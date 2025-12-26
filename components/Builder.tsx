
import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Sparkles, Save, ArrowLeft, Loader2, Copy, Check, Info, Terminal, Image as ImageIcon, Zap, AlertCircle } from 'lucide-react';
import { analyzeDesign, generateTemplateImage } from '../services/geminiService';
import { DesignReference, DesignPromptJson } from '../types';

interface BuilderProps {
  onSave: (ref: DesignReference) => void;
  onBack: () => void;
}

const Builder: React.FC<BuilderProps> = ({ onSave, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<{ markdown: string, json: DesignPromptJson } | null>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image && !imageUrl) return;
    setLoading(true);
    setResult(null);
    setTemplateImage(null);
    try {
      const source = image || imageUrl;
      const data = await analyzeDesign(source, notes);
      setResult(data);
    } catch (error) {
      alert("Error analyzing design. Ensure your API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!result) return;
    setTemplateLoading(true);
    try {
      const generated = await generateTemplateImage(result.json.visual_prompt);
      setTemplateImage(generated);
    } catch (error) {
      alert("Error generating visual template.");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleSave = () => {
    if (!result || !image) return;
    const newRef: DesignReference = {
      id: Date.now().toString(),
      name: result.json.title || "Untitled Inspiration",
      tags: [],
      imageSource: image,
      templateImage: templateImage || undefined,
      markdownBrief: result.markdown,
      jsonSpec: result.json,
      createdAt: Date.now(),
    };
    onSave(newRef);
    alert("Saved to Inspiration Library with Visual DNA!");
  };

  const copyPrompt = () => {
    if (result) {
      navigator.clipboard.writeText(result.json.visual_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Design → Prompt Builder</h2>
          <p className="text-slate-400">Deconstruct any visual design into structured AI logic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Upload size={18} className="text-blue-400" />
              <span>Input Reference</span>
            </h3>

            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <div className="p-4 rounded-full bg-slate-800 mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-slate-500 group-hover:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-slate-400">Click to upload design image</p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 10MB</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-black">
                <img src={image} alt="Reference" className="w-full aspect-video object-contain" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change
                </button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <LinkIcon size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Or paste image URL..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Optional Context Notes</label>
              <textarea 
                rows={3}
                placeholder="E.g. Focus on the grainy texture and the layout of the floating elements..."
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading || (!image && !imageUrl)}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              <span>{loading ? 'Analyzing Architecture...' : 'Analyze DNA'}</span>
            </button>
          </div>
          
          <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <h4 className="flex items-center space-x-2 text-blue-400 font-semibold mb-2">
              <Info size={16} />
              <span>Lab Pro Tip</span>
            </h4>
            <p className="text-sm text-slate-400">
              Generate the "Visual Template" before saving to store the placeholder mockup as a reference in your library.
            </p>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-blue-400 neon-text">Analysis Complete</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={copyPrompt}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied' : 'Copy Visual Prompt'}</span>
                  </button>
                  <button 
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-lg ${templateImage ? 'bg-green-600 hover:bg-green-500 shadow-green-900/10' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/10'}`}
                  >
                    <Save size={16} />
                    <span>{templateImage ? 'Save DNA + Template' : 'Save DNA Only'}</span>
                  </button>
                </div>
              </div>

              {/* Template Validation Row */}
              <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20">
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h4 className="text-lg font-bold flex items-center space-x-2 text-white">
                        <ImageIcon size={20} className="text-indigo-400" />
                        <span>Design Template Validation</span>
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">Generate a placeholder mockup to store in your reference vault.</p>
                    </div>
                    <button 
                      onClick={handleGenerateTemplate}
                      disabled={templateLoading}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-900/30"
                    >
                      {templateLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                      <span>{templateLoading ? 'Rendering...' : 'Generate Visual Template'}</span>
                    </button>
                  </div>

                  <div className="aspect-video relative rounded-xl overflow-hidden bg-[#0a0f1d] border border-slate-800 flex items-center justify-center">
                    {templateImage ? (
                      <img src={templateImage} alt="Generated Template" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-8 space-y-3 opacity-40">
                        <Terminal size={40} className="mx-auto mb-2" />
                        <p className="text-xs font-mono uppercase tracking-widest">Awaiting Lab Validation Run</p>
                      </div>
                    )}
                    {templateLoading && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <Loader2 size={48} className="text-indigo-500 animate-spin" />
                          <Sparkles size={20} className="absolute top-0 right-0 text-indigo-300 animate-pulse" />
                        </div>
                        <p className="text-sm font-bold text-indigo-300 animate-pulse">Re-rendering DNA structure...</p>
                      </div>
                    )}
                    {!templateLoading && !templateImage && (
                      <div className="absolute bottom-4 flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                        <AlertCircle size={12} />
                        <span>Run Validation to save complete DNA</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                  <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Markdown Design Brief</span>
                  </div>
                  <div className="p-6 prose prose-invert prose-blue max-w-none text-slate-300 text-sm leading-relaxed max-h-[400px] overflow-y-auto">
                    {result.markdown.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                   <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">JSON Spec Object</span>
                  </div>
                  <pre className="p-6 text-[11px] text-cyan-400 mono overflow-x-auto bg-[#0a0f1d] max-h-[400px]">
                    {JSON.stringify(result.json, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-600">
              <Terminal size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Awaiting DNA input...</p>
              <p className="text-sm">Analysis results will appear here in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Builder;
