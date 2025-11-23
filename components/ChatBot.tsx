import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { Message } from '../types';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Hello! I am the GeoScout Chatbot using Gemini 3.0 Pro. Ask me anything about geography, travel planning, or complex reasoning tasks.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // Prepare history for API
        const history = messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const response = await sendChatMessage(history, userMsg.text);
        const text = response.text || "I couldn't generate a response.";

        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Sorry, I encountered an error connecting to the satellite (API).",
            timestamp: Date.now()
        }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center gap-3">
         <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
         <h2 className="font-semibold text-white">Gemini 3.0 Pro Intelligence</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
         {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                     msg.role === 'user' 
                     ? 'bg-primary-600 text-white rounded-br-none' 
                     : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                 }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                 </div>
             </div>
         ))}
         {loading && (
             <div className="flex justify-start">
                 <div className="bg-slate-800 rounded-2xl p-4 rounded-bl-none flex gap-2 items-center border border-slate-700">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                 </div>
             </div>
         )}
         <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-700">
         <div className="relative">
             <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="w-full bg-slate-900 text-white placeholder-slate-500 rounded-xl py-4 pl-5 pr-12 border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
             />
             <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
                 <i className="fa-solid fa-paper-plane text-xl"></i>
             </button>
         </div>
      </div>
    </div>
  );
};

export default ChatBot;