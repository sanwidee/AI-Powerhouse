
import React, { useState, useEffect } from 'react';
import { Wrench, Star, Rocket, Terminal, Github, Moon, Zap, Palette, ChevronRight } from 'lucide-react';
import { AppTool, DesignReference, BrandReference, GeneratedPost } from './types';
import Builder from './components/Builder';
import Library from './components/Library';
import Generator from './components/Generator';
import BrandLab from './components/BrandLab';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<AppTool>(AppTool.LANDING);
  const [references, setReferences] = useState<DesignReference[]>([]);
  const [brands, setBrands] = useState<BrandReference[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();

    const savedRefs = localStorage.getItem('ikhsan_design_refs');
    const savedBrands = localStorage.getItem('ikhsan_brand_refs');
    const savedPosts = localStorage.getItem('ikhsan_generated_posts');
    if (savedRefs) setReferences(JSON.parse(savedRefs));
    if (savedBrands) setBrands(JSON.parse(savedBrands));
    if (savedPosts) setGeneratedPosts(JSON.parse(savedPosts));
  }, []);

  const handleOpenKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const saveReference = (ref: DesignReference) => {
    const updated = [ref, ...references];
    setReferences(updated);
    localStorage.setItem('ikhsan_design_refs', JSON.stringify(updated));
  };

  const saveBrand = (brand: BrandReference) => {
    const updated = [brand, ...brands];
    setBrands(updated);
    localStorage.setItem('ikhsan_brand_refs', JSON.stringify(updated));
  };

  const saveGeneratedPost = (post: GeneratedPost) => {
    const updated = [post, ...generatedPosts];
    setGeneratedPosts(updated);
    localStorage.setItem('ikhsan_generated_posts', JSON.stringify(updated));
  };

  const updateGeneratedPost = (post: GeneratedPost) => {
    const updated = generatedPosts.map(p => p.id === post.id ? post : p);
    setGeneratedPosts(updated);
    localStorage.setItem('ikhsan_generated_posts', JSON.stringify(updated));
  };

  const deleteReference = (id: string) => {
    const updated = references.filter(r => r.id !== id);
    setReferences(updated);
    localStorage.setItem('ikhsan_design_refs', JSON.stringify(updated));
  };

  const deleteBrand = (id: string) => {
    const updated = brands.filter(b => b.id !== id);
    setBrands(updated);
    localStorage.setItem('ikhsan_brand_refs', JSON.stringify(updated));
  };

  const deleteGeneratedPost = (id: string) => {
    const updated = generatedPosts.filter(p => p.id !== id);
    setGeneratedPosts(updated);
    localStorage.setItem('ikhsan_generated_posts', JSON.stringify(updated));
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900/50 shadow-2xl">
          <Zap size={48} className="text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            This application uses high-performance Gemini 3 Pro models that require a paid API key from a Google Cloud project with billing enabled.
            <br /><br />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              Review billing documentation
            </a>
          </p>
          <button 
            onClick={handleOpenKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            Select Paid API Key
          </button>
        </div>
      </div>
    );
  }

  const renderTool = () => {
    switch (activeTool) {
      case AppTool.BUILDER:
        return <Builder onSave={saveReference} onBack={() => setActiveTool(AppTool.LANDING)} />;
      case AppTool.LIBRARY:
        return (
          <Library 
            references={references} 
            brands={brands}
            generatedPosts={generatedPosts}
            onDelete={deleteReference} 
            onDeleteBrand={deleteBrand}
            onDeletePost={deleteGeneratedPost}
            onUpdatePost={updateGeneratedPost}
            onBack={() => setActiveTool(AppTool.LANDING)} 
          />
        );
      case AppTool.GENERATOR:
        return (
          <Generator 
            references={references} 
            brands={brands} 
            onSavePost={saveGeneratedPost}
            onBack={() => setActiveTool(AppTool.LANDING)} 
          />
        );
      case AppTool.BRAND_LAB:
        return <BrandLab onSave={saveBrand} onBack={() => setActiveTool(AppTool.LANDING)} />;
      default:
        return (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <header className="mb-16 text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <Zap size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Post Design Lab v2.5</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-transparent">
                Creative Production Lab
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ToolCard icon={<Wrench className="text-blue-400" />} title="Design Builder" desc="Extract Structural DNA." onClick={() => setActiveTool(AppTool.BUILDER)} accent="blue" />
              <ToolCard icon={<Palette className="text-pink-400" />} title="Brand Identity" desc="Save Color DNA." onClick={() => setActiveTool(AppTool.BRAND_LAB)} accent="pink" />
              <ToolCard icon={<Star className="text-cyan-400" />} title="Inspo Library" desc="Manage Vault." onClick={() => setActiveTool(AppTool.LIBRARY)} accent="cyan" />
              <ToolCard icon={<Rocket className="text-indigo-400" />} title="Post Generator" desc="Deploy & Remix." onClick={() => setActiveTool(AppTool.GENERATOR)} accent="indigo" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div onClick={() => setActiveTool(AppTool.LANDING)} className="flex items-center space-x-3 cursor-pointer">
          <Zap size={20} className="text-blue-500" />
          <span className="font-bold text-lg tracking-tight">DESIGN <span className="text-blue-500">LAB</span></span>
        </div>
      </nav>
      {renderTool()}
    </div>
  );
};

const ToolCard = ({ icon, title, desc, onClick, accent }: any) => (
  <div onClick={onClick} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-slate-700 transition-all group">
    <div className="mb-4 p-3 rounded-xl bg-slate-800/50 w-fit group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-4">{desc}</p>
    <div className="flex items-center text-xs font-bold text-blue-500">GO <ChevronRight size={14} /></div>
  </div>
);

export default App;
