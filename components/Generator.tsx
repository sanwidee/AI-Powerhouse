
import React, { useState } from 'react';
import { Rocket, Sparkles, ArrowLeft, ChevronDown, ImageIcon, Loader2, Copy, Check, Zap, AlertCircle, RefreshCw, Send, Palette, XCircle, Layers, Save } from 'lucide-react';
import { DesignReference, BrandReference, RemixIntensity, ContentBrief, AspectRatio, GeneratedPost } from '../types';
import { generatePostFromReference, generateRemixImage, refinePostImage } from '../services/geminiService';

interface GeneratorProps {
  references: DesignReference[];
  brands: BrandReference[];
  onSavePost: (post: GeneratedPost) => void;
  onBack: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ references, brands, onSavePost, onBack }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [intensity, setIntensity] = useState<RemixIntensity>('strict');
  const [carouselMode, setCarouselMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [brief, setBrief] = useState<ContentBrief>({
    topic: '',
    elements_to_display: '',
    copy_instructions: '',
    target_audience: '',
    aspectRatio: '1:1',
    slide_number: 1,
    total_slides: 5
  });

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [remixImage, setRemixImage] = useState<string | null>(null);
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRef = references.find(r => r.id === selectedId);
  const selectedBrand = brands.find(b => b.id === selectedBrandId);

  const handleGenerate = async () => {
    if (!selectedRef) return;
    setLoading(true);
    setResultText(null);
    setRemixImage(null);
    setError(null);
    setIsSaved(false);

    const finalBrief: ContentBrief = {
      ...brief,
      slide_number: carouselMode ? brief.slide_number : undefined,
      total_slides: carouselMode ? brief.total_slides : undefined
    };

    try {
      const { report, finalVisualPrompt } = await generatePostFromReference(
        selectedRef.jsonSpec,
        finalBrief,
        intensity,
        selectedBrand?.dna
      );
      setResultText(report);

      if (finalVisualPrompt) {
        setImageLoading(true);
        const img = await generateRemixImage(finalVisualPrompt, brief.aspectRatio);
        setRemixImage(img);
        setImageLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Synthesis failed. The lab encountered a processing error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    if (!remixImage || !selectedRef) return;
    const newPost: GeneratedPost = {
      id: Date.now().toString(),
      name: `${brief.topic} - Remix`,
      imageSource: remixImage,
      history: [{
        id: 'original',
        timestamp: Date.now(),
        instruction: 'Original Generation',
        image: remixImage,
        type: 'text'
      }],
      blueprintId: selectedRef.id,
      brandId: selectedBrandId || undefined,
      aspectRatio: brief.aspectRatio,
      createdAt: Date.now()
    };
    onSavePost(newPost);
    setIsSaved(true);
  };

  const handleRefine = async () => {
    if (!remixImage || !refineInput) return;
    setIsRefining(true);
    setError(null);
    try {
      const refined = await refinePostImage(remixImage, refineInput, brief.aspectRatio);
      setRemixImage(refined);
      setRefineInput('');
    } catch (err: any) {
      setError("Retouch engine failure. Instructions were too complex or blocked.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={onBack} className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-all active:scale-95 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Post Generator</h2>
          <p className="text-slate-400">Deploy content into design systems.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-[2rem] border border-slate-800 bg-slate-900/50 shadow-2xl space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">1. Select Components</label>
              <div className="space-y-3">
                <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                  <option value="" className="bg-slate-900">Choose Structural Blueprint...</option>
                  {references.map(r => <option key={r.id} value={r.id} className="bg-slate-900">{r.name}</option>)}
                </select>
                <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50" value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}>
                  <option value="" className="bg-slate-900">Choose Brand Override (Optional)...</option>
                  {brands.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name} Identity</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">2. Content & Format</label>
                <button onClick={() => setCarouselMode(!carouselMode)} className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${carouselMode ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}>
                  <Layers size={12} />
                  <span>{carouselMode ? 'CAROUSEL ON' : 'CAROUSEL OFF'}</span>
                </button>
              </div>
              <input type="text" placeholder="Main Topic / Headline..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={brief.topic} onChange={(e) => setBrief({ ...brief, topic: e.target.value })} />
              <textarea placeholder="Specific Elements / Copy..." rows={2} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={brief.elements_to_display} onChange={(e) => setBrief({ ...brief, elements_to_display: e.target.value })} />

              <div className="grid grid-cols-2 gap-4">
                <select value={brief.aspectRatio} onChange={(e) => setBrief({ ...brief, aspectRatio: e.target.value as AspectRatio })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs outline-none">
                  <option value="1:1">1:1 Square</option>
                  <option value="4:3">4:3 Slide</option>
                  <option value="3:4">3:4 Portrait</option>
                  <option value="9:16">9:16 Story</option>
                  <option value="16:9">16:9 Landscape</option>
                </select>
                <select value={intensity} onChange={(e) => setIntensity(e.target.value as RemixIntensity)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs outline-none">
                  <option value="strict">Strict DNA</option>
                  <option value="light">Light Touch</option>
                  <option value="heavy">Creative Heavy</option>
                </select>
              </div>

              {carouselMode && (
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 grid grid-cols-2 gap-4">
                  <input type="number" min="1" className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-indigo-300" value={brief.slide_number} onChange={(e) => setBrief({ ...brief, slide_number: parseInt(e.target.value) })} />
                  <input type="number" min="1" className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-indigo-300" value={brief.total_slides} onChange={(e) => setBrief({ ...brief, total_slides: parseInt(e.target.value) })} />
                </div>
              )}
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><p>{error}</p></div>}

            <button onClick={handleGenerate} disabled={loading || !selectedId || !brief.topic} className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}`}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
              <span>{loading ? 'SYNTHESIZING...' : 'Deploy Content to Lab'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 h-full">
          {resultText ? (
            <div className="space-y-6">
              <div className="bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-8 border border-slate-800 shadow-2xl">
                <div className="aspect-square relative rounded-2xl overflow-hidden bg-black border border-slate-800 mb-6 flex items-center justify-center">
                  {remixImage ? <img src={remixImage} className="w-full h-full object-contain" alt="Result" /> : <div className="text-slate-700 font-mono text-xs uppercase tracking-widest">Render Pending...</div>}
                  {imageLoading && <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-10"><Zap className="animate-bounce text-indigo-400" size={32} /></div>}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex space-x-2">
                    <input type="text" placeholder="Quick retouch..." className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none" value={refineInput} onChange={(e) => setRefineInput(e.target.value)} disabled={isRefining} />
                    <button onClick={handleRefine} disabled={!refineInput || isRefining} className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl text-white">
                      {isRefining ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <button onClick={handleSaveResult} disabled={isSaved || !remixImage} className={`px-6 rounded-xl flex items-center space-x-2 font-bold text-xs transition-all ${isSaved ? 'bg-green-500/10 text-green-400 border border-green-500/50' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                    {isSaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isSaved ? 'Vaulted' : 'Save to Vault'}</span>
                  </button>
                </div>
              </div>

              <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
                <div className="flex items-center space-x-2 mb-4 text-slate-500"><Sparkles size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Synthesis Report</span></div>
                {resultText}
              </div>
            </div>
          ) : (
            <div className="h-[600px] border border-slate-800 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-slate-600 text-center p-12">
              <Zap size={48} className="mb-6 opacity-10" /><h3 className="text-xl font-bold text-slate-400 mb-2">Synthesis Chamber Ready</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
