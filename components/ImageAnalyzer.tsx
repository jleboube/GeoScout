import React, { useState, useRef } from 'react';
import { analyzeImageDeeply } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Describe this image in extreme detail, including objects, colors, style, and potential context.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await analyzeImageDeeply(base64Data, mimeType, prompt);
      setResult(response.text || "No description generated.");

    } catch (error) {
      console.error(error);
      setResult("Error during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Deep Image Analysis</h2>
            <p className="text-slate-400">Powered by Gemini 3.0 Pro Preview</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 space-y-4">
                    <div 
                        className={`aspect-video rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group cursor-pointer transition-colors hover:border-primary-500/50`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {image ? (
                            <img src={image} alt="Analysis target" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-slate-500 flex flex-col items-center">
                                <i className="fa-solid fa-image text-3xl mb-2"></i>
                                <span className="text-sm">Click to upload</span>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-24 bg-slate-800 text-slate-200 p-3 rounded-lg border border-slate-700 focus:ring-1 focus:ring-primary-500 outline-none text-sm resize-none"
                        placeholder="Ask specifically what to look for..."
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={!image || loading}
                        className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        Analyze
                    </button>
                </div>

                <div className="w-full md:w-1/2 bg-slate-800/50 rounded-xl p-4 border border-slate-700 min-h-[300px] overflow-y-auto">
                    {result ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                             <p className="whitespace-pre-wrap">{result}</p>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                            Analysis results will appear here...
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImageAnalyzer;