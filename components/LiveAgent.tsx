import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decodeAudioData, base64ToUint8Array } from '../services/geminiService';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const LiveAgent: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'speaking'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Refs for playback
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session
  const sessionRef = useRef<Promise<any> | null>(null);
  
  // Canvas for visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  const cleanup = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    
    // Stop all scheduled audio
    scheduledSourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    scheduledSourcesRef.current.clear();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Close session if possible (not directly exposed on promise, but good to reset state)
    sessionRef.current = null;
    
    setConnected(false);
    setStatus('disconnected');
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down
        
        // Gradient color
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#818cf8');
        gradient.addColorStop(1, '#4f46e5');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const handleConnect = async () => {
    if (connected) {
      cleanup();
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      
      // 1. Setup Audio Contexts
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      // Analyser for visualizer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setConnected(true);
            
            // Setup input stream
            if (!audioContextRef.current || !streamRef.current) return;
            
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            // Connect to analyser
            if (analyserRef.current) {
                source.connect(analyserRef.current);
                drawVisualizer();
            }

            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!outputContextRef.current) return;
            
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('speaking');
              
              // Manage playback timing
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
              
              const audioBytes = base64ToUint8Array(base64Audio);
              const audioBuffer = await decodeAudioData(audioBytes, outputContextRef.current);
              
              const source = outputContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContextRef.current.destination);
              
              source.addEventListener('ended', () => {
                scheduledSourcesRef.current.delete(source);
                if (scheduledSourcesRef.current.size === 0) {
                    setStatus('connected'); // Back to listening
                }
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              scheduledSourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
               scheduledSourcesRef.current.forEach(s => s.stop());
               scheduledSourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setStatus('connected');
            }
          },
          onclose: () => {
            cleanup();
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection error occurred.");
            cleanup();
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}
            },
            systemInstruction: "You are GeoScout, a helpful field agent assistant. You speak concisely and are ready to help with navigation or observation.",
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to Live API");
      setStatus('disconnected');
      setConnected(false);
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 pt-10 animate-fade-in">
      <div className="space-y-4">
        <div className="inline-flex p-4 rounded-full bg-slate-800/50 border border-slate-700 shadow-2xl mb-4">
            <i className="fa-solid fa-tower-broadcast text-4xl text-primary-400"></i>
        </div>
        <h2 className="text-3xl font-bold text-white">Live Field Agent</h2>
        <p className="text-slate-400">
          Talk to GeoScout in real-time. Ask about locations, geography, or travel tips.
        </p>
      </div>

      <div className="relative h-48 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
         <canvas ref={canvasRef} width="600" height="192" className="absolute inset-0 w-full h-full opacity-50" />
         
         <div className="relative z-10">
             {status === 'disconnected' && <p className="text-slate-600">Ready to connect</p>}
             {status === 'connecting' && <p className="text-yellow-500 animate-pulse">Establishing satellite link...</p>}
             {status === 'connected' && <p className="text-green-500">Listening...</p>}
             {status === 'speaking' && <p className="text-primary-400 font-medium">Agent Speaking...</p>}
         </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleConnect}
          className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500
            ${connected 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/30'}`}
        >
          {connected ? (
             <>
                <span className="mr-2"><i className="fa-solid fa-phone-slash"></i></span> Disconnect
             </>
          ) : (
             <>
                <span className="mr-2"><i className="fa-solid fa-microphone"></i></span> Start Conversation
             </>
          )}
        </button>
        
        {error && (
            <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default LiveAgent;