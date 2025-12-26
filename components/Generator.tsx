
import React, { useState } from 'react';
import { Rocket, Sparkles, ArrowLeft, ChevronDown, FileText, Layout, Type as TypeIcon, Image as ImageIcon, Loader2, Copy, Check, Info } from 'lucide-react';
import { DesignReference, RemixIntensity, ContentBrief } from '../types';
import { generatePostFromReference } from '../services/geminiService';

interface GeneratorProps {
  references: DesignReference[];
  onBack: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ references, onBack }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [intensity, setIntensity] = useState<RemixIntensity>('strict');
  const [brief, setBrief] = useState<ContentBrief>({
    topic: '',
    elements_to_display: '',
    copy_instructions: '',
    target_audience: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedRef = references.find(r => r.id === selectedId);

  const handleGenerate = async () => {
    if (!selectedRef) return;
    setLoading(true);
    try {
      const data = await generatePostFromReference(selectedRef.jsonSpec, brief, intensity);
      setResult(data);
    } catch (error) {
      alert("Error generating post concepts.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
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
          <h2 className="text-3xl font-bold tracking-tight">Post Generator</h2>
          <p className="text-slate-400">Deploy new content into your saved design systems.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">1. Choose Design Blueprint</label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Select a saved template...</option>
                  {references.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.jsonSpec.structural_rules.layout_archetype})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>

            {selectedRef && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-black overflow-hidden border border-slate-700">
                  <img src={selectedRef.templateImage || selectedRef.imageSource} className="w-full h-full object-cover" alt="Ref" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{selectedRef.name}</h4>
                  <p className="text-[10px] text-blue-400 uppercase font-bold">{selectedRef.jsonSpec.structural_rules.layout_archetype}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 border-t border-slate-800 pt-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">2. New Content Brief</label>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">New Topic / Context</label>
                  <input 
                    type="text"
                    placeholder="E.g. Healthy Eating for Developers"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm"
                    value={brief.topic}
                    onChange={(e) => setBrief({...brief, topic: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">What to Display (Visual Elements)</label>
                  <textarea 
                    placeholder="E.g. A vibrant bowl of kale salad with coding icons floating around it"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm resize-none"
                    value={brief.elements_to_display}
                    onChange={(e) => setBrief({...brief, elements_to_display: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Copy Style & Tone</label>
                  <input 
                    type="text"
                    placeholder="E.g. Punchy, minimalist, aggressive hooks"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm"
                    value={brief.copy_instructions}
                    onChange={(e) => setBrief({...brief, copy_instructions: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">3. Structural Fidelity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['strict', 'light', 'heavy'] as RemixIntensity[]).map(level => (
                  <button 
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${intensity === level ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 text-center italic mt-2">
                {intensity === 'strict' ? 'Force AI to strictly follow the layout grid.' : intensity === 'heavy' ? 'Allow AI to creatively expand the style.' : 'Balance system logic with content needs.'}
              </p>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !selectedId || !brief.topic}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 mt-4 group"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} className="group-hover:-translate-y-1 transition-transform" />}
              <span>{loading ? 'Processing System Logic...' : 'Deploy Content to Template'}</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
               <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <Sparkles className="text-yellow-400" size={20} />
                  <span>Production Package</span>
                </h3>
                <button 
                  onClick={copyResult}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied All' : 'Copy Assets'}</span>
                </button>
              </div>

              <div className="p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed">
                  {result.split('\n').map((line, i) => {
                    if (line.startsWith('#')) return <h3 key={i} className="text-blue-400 font-bold mt-6 mb-2">{line.replace(/^#+\s/, '')}</h3>;
                    if (line.trim() === '') return <div key={i} className="h-4" />;
                    return <p key={i} className="mb-2 text-sm">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] rounded-3xl border border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-600 relative p-12 text-center">
              <div className="p-6 rounded-full bg-slate-800/50 mb-6">
                <Layout size={48} className="opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Awaiting Content Deployment</h3>
              <p className="text-sm max-w-sm mx-auto">
                Once you provide a Content Brief and select a Blueprint, the lab will generate visual prompts and copy that inherit your chosen design's DNA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
