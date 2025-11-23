
import React, { useState, useRef, useEffect } from 'react';
import { identifyLocation, submitFeedback } from '../services/geminiService';
import { GroundingChunk, GeoAnalysisResult, FeedbackSubmission } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const GeoGuesser: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<GeoAnalysisResult | null>(null);
  const [grounding, setGrounding] = useState<GroundingChunk[]>([]);
  const [scanStep, setScanStep] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  
  // Feedback State
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionInput, setCorrectionInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisData(null);
        setGrounding([]);
        setLogs(["Image loaded into buffer.", "Ready for analysis."]);
        
        // Reset Feedback
        setFeedbackStatus('idle');
        setCorrectionMode(false);
        setCorrectionInput("");
      };
      reader.readAsDataURL(file);
    }
  };

  const runSimulatedScans = async () => {
    const steps = [
        "Extracting EXIF metadata...",
        "Analyzing pixel-level artifacts...",
        "Accessing public biometric databases (simulated)...",
        "Scraping social media geolocation tags...",
        "Triangulating visible landmarks via Satellite...",
        "Compiling intelligence report..."
    ];

    for (const step of steps) {
        setScanStep(step);
        addLog(step);
        await new Promise(r => setTimeout(r, 800)); 
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysisData(null);
    setLogs(["Initializing GeoScout Protocol v2.5..."]);
    
    // Reset Feedback
    setFeedbackStatus('idle');
    setCorrectionMode(false);
    setCorrectionInput("");

    try {
      // Start UI simulation
      const scanPromise = runSimulatedScans();
      
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      // Real API Call
      const apiPromise = identifyLocation(base64Data, mimeType);

      const [_, response] = await Promise.all([scanPromise, apiPromise]);
      
      if (response.result) {
        setAnalysisData(response.result);
        addLog(`Analysis Complete. Confidence: ${response.result.confidence}%`);
      } else {
        addLog("Analysis Failed: Invalid response structure.");
      }

      if (response.groundingMetadata?.groundingChunks) {
        setGrounding(response.groundingMetadata.groundingChunks);
      }

    } catch (error) {
      console.error(error);
      addLog("CRITICAL ERROR: Connection to intelligence servers failed.");
    } finally {
      setLoading(false);
      setScanStep("Idle");
    }
  };

  const handleFeedbackSubmit = async (isCorrect: boolean) => {
    if (!analysisData) return;

    // If marking as incorrect but haven't typed input yet, switch mode
    if (!isCorrect && !correctionMode) {
        setCorrectionMode(true);
        return;
    }

    setFeedbackStatus('submitting');
    
    const feedback: FeedbackSubmission = {
        guessedLocation: analysisData.location,
        isCorrect,
        actualLocation: isCorrect ? analysisData.location : correctionInput,
        timestamp: Date.now()
    };

    await submitFeedback(feedback);
    
    addLog(`User Feedback Logged: ${isCorrect ? 'CONFIRMED' : 'DISPUTED'}`);
    setFeedbackStatus('success');
  };

  const renderGroundingSources = () => {
    if (grounding.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-slate-950/50 rounded-none border-l-2 border-blue-500 font-mono">
        <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-database"></i> Verified Intelligence Sources
        </h3>
        <div className="grid grid-cols-1 gap-2">
            {grounding.map((chunk, idx) => {
                const item = chunk.web || chunk.maps;
                if (!item) return null;
                
                return (
                    <a key={idx} href={item.uri} target="_blank" rel="noreferrer" 
                       className="flex items-center gap-3 p-2 bg-slate-900 hover:bg-slate-800 transition text-xs text-slate-300 truncate border border-slate-800 group">
                        <div className={`w-1 h-full ${chunk.web ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <i className={`fa-solid ${chunk.web ? 'fa-globe' : 'fa-map-location-dot'} text-slate-500 group-hover:text-white`}></i>
                        <span className="truncate font-mono">{item.title}</span>
                        <i className="fa-solid fa-external-link-alt ml-auto opacity-0 group-hover:opacity-100"></i>
                    </a>
                )
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 animate-fade-in font-sans">
      
      {/* Left Panel: Input & Terminal */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-sm overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>
            <div className="p-1 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-3">
                <span className="text-[10px] text-slate-500 uppercase font-mono">IMG_BUFFER_01</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
            </div>
            
            <div 
                className={`relative group aspect-square bg-slate-950 flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
                onClick={() => !loading && fileInputRef.current?.click()}
            >
                {image ? (
                    <>
                        <img src={image} alt="Subject" className="w-full h-full object-contain opacity-80" />
                        {loading && (
                            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center">
                                <div className="w-64 h-64 border border-blue-500/30 rounded-full animate-ping absolute"></div>
                                <div className="w-48 h-48 border border-blue-500/50 rounded-full animate-ping delay-100 absolute"></div>
                                <div className="relative z-10 font-mono text-blue-400 text-sm animate-pulse bg-slate-950 px-4 py-1 border border-blue-900">
                                    {scanStep}
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 pointer-events-none border-2 border-slate-800 m-4 opacity-50">
                             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6 group-hover:scale-105 transition-transform">
                        <i className="fa-solid fa-fingerprint text-5xl text-slate-700 mb-4 group-hover:text-blue-500 transition-colors"></i>
                        <p className="text-slate-400 font-mono text-sm">UPLOAD TARGET IMAGE</p>
                        <p className="text-slate-600 text-xs mt-2">JPGE / PNG / WEBP</p>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} disabled={loading} />
            </div>
        </div>

        <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className={`w-full py-4 font-mono text-sm tracking-widest font-bold uppercase border transition-all relative overflow-hidden group
                ${!image || loading 
                    ? 'bg-slate-900 text-slate-600 border-slate-800' 
                    : 'bg-blue-900/20 text-blue-400 border-blue-500/50 hover:bg-blue-900/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}
        >
            {loading ? (
                <span className="animate-pulse">SCANNING...</span>
            ) : (
                <>
                    <span className="relative z-10">INITIATE GEOLOCATION</span>
                    <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </>
            )}
        </button>

        {/* Terminal Log */}
        <div className="bg-slate-950 rounded-sm border border-slate-800 p-4 h-48 overflow-y-auto font-mono text-xs text-green-500/80 shadow-inner">
            {logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
            ))}
            <div ref={logsEndRef} />
            {loading && <div className="animate-pulse">_</div>}
        </div>
      </div>

      {/* Right Panel: Data Visualization */}
      <div className="lg:col-span-7 space-y-6">
        {analysisData ? (
            <div className="space-y-6 animate-fade-in-up">
                
                {/* Main Location Card */}
                <div className="bg-slate-900 border border-slate-700 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <i className="fa-solid fa-map-location text-6xl text-blue-500"></i>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xs text-blue-500 font-mono uppercase tracking-widest mb-1">Target Location</h2>
                        <div className="text-2xl md:text-3xl font-bold text-white mb-2">{analysisData.location}</div>
                        {analysisData.coordinates && (
                            <div className="flex gap-4 text-sm font-mono text-slate-400">
                                <span>LAT: {analysisData.coordinates.lat.toFixed(6)}</span>
                                <span>LNG: {analysisData.coordinates.lng.toFixed(6)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Confidence Metric */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-700 p-4">
                         <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Confidence Probability</h3>
                         <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{name: 'Prob', value: analysisData.confidence}]} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{background: '#0f172a', border: '1px solid #1e293b'}} />
                                    <Bar dataKey="value" barSize={20} background={{ fill: '#1e293b' }}>
                                        <Cell fill={analysisData.confidence > 80 ? '#22c55e' : analysisData.confidence > 50 ? '#eab308' : '#ef4444'} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="text-right text-2xl font-bold text-white">{analysisData.confidence}%</div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-700 p-4 flex flex-col justify-center">
                        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Social/Viral Index</h3>
                        <div className="flex-1 flex items-center">
                             <p className="text-xs text-slate-300 leading-relaxed">
                                {analysisData.social_context || "No significant viral vector detected."}
                             </p>
                        </div>
                    </div>
                </div>

                {/* Analysis Log / Deductions */}
                <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-xs text-blue-500 font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-microscope"></i> Forensic Deduction Log
                    </h3>
                    <ul className="space-y-3">
                        {analysisData.analysis_log.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-300">
                                <span className="text-blue-500 mt-1">›</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Biometric/Social Analysis */}
                <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-xs text-purple-500 font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-users-viewfinder"></i> Biometric & Demographics Analysis
                    </h3>
                     <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-purple-500/50 pl-4">
                        {analysisData.biometric_analysis || "No human subjects detected for demographic profiling."}
                     </p>
                </div>

                {renderGroundingSources()}

                {/* Feedback System */}
                <div className={`bg-slate-900 border transition-all duration-500 p-6 mt-6 relative overflow-hidden group ${feedbackStatus === 'success' ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-50"></div>
                    
                    <h3 className={`text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-2 ${feedbackStatus === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                        <i className={`fa-solid ${feedbackStatus === 'success' ? 'fa-lock' : 'fa-clipboard-check'}`}></i> 
                        {feedbackStatus === 'success' ? 'Verification Protocol Complete' : 'Human Verification Required'}
                    </h3>

                    {feedbackStatus === 'success' ? (
                       <div className="text-green-400 font-mono text-sm flex items-center gap-2 animate-pulse">
                          <i className="fa-solid fa-check-circle"></i> 
                          <span>Intelligence data successfully archived for model retraining.</span>
                       </div>
                    ) : feedbackStatus === 'submitting' ? (
                        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
                             <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>
                             <span>Encrypting and transmitting feedback packet...</span>
                        </div>
                    ) : (
                       <div>
                          {!correctionMode ? (
                              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                  <p className="text-sm text-slate-300">Is the identified location accurate?</p>
                                  <div className="flex gap-3">
                                      <button 
                                        onClick={() => handleFeedbackSubmit(true)}
                                        className="px-4 py-2 bg-green-900/20 border border-green-500/30 text-green-400 hover:bg-green-900/40 text-xs font-bold uppercase tracking-wider transition-colors"
                                      >
                                          <i className="fa-solid fa-thumbs-up mr-2"></i> Confirm
                                      </button>
                                      <button 
                                        onClick={() => setCorrectionMode(true)}
                                        className="px-4 py-2 bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 text-xs font-bold uppercase tracking-wider transition-colors"
                                      >
                                          <i className="fa-solid fa-thumbs-down mr-2"></i> Dispute
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              <div className="space-y-3 animate-fade-in">
                                  <p className="text-xs text-red-400 font-mono">DISPUTE PROTOCOL INITIATED. ENTER CORRECT INTELLIGENCE:</p>
                                  <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={correctionInput}
                                        onChange={(e) => setCorrectionInput(e.target.value)}
                                        placeholder="Enter verified city, landmark, or coordinates..."
                                        className="flex-1 bg-slate-950 border border-slate-700 text-white text-sm px-3 py-2 focus:border-yellow-500 outline-none font-mono"
                                      />
                                      <button 
                                        onClick={() => handleFeedbackSubmit(false)}
                                        disabled={!correctionInput.trim()}
                                        className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider transition-colors"
                                      >
                                          Submit
                                      </button>
                                      <button 
                                        onClick={() => setCorrectionMode(false)}
                                        className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                                      >
                                          <i className="fa-solid fa-times"></i>
                                      </button>
                                  </div>
                              </div>
                          )}
                       </div>
                    )}
                </div>

            </div>
        ) : (
            <div className="h-full min-h-[400px] bg-slate-900/50 border border-slate-800/50 border-dashed rounded-sm flex flex-col items-center justify-center text-slate-600 space-y-4">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center">
                    <i className="fa-solid fa-crosshairs text-4xl"></i>
                </div>
                <p className="font-mono text-sm uppercase tracking-widest">AWAITING TARGET DATA</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default GeoGuesser;
