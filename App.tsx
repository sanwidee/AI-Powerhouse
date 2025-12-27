
import React, { useState, useEffect } from 'react';
import { Wrench, Star, Rocket, Terminal, Github, Moon, Zap, Palette, ChevronRight, Key, Globe } from 'lucide-react';
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
  const [manualKey, setManualKey] = useState('');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
        setIsStandalone(false);
      } else {
        setIsStandalone(true);
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        const savedKey = sessionStorage.getItem('IKHSAN_LAB_KEY');
        setHasKey(!!(envKey || savedKey));
      }
    };
    checkKey();

    const loadData = async () => {
      try {
        const resRefs = await fetch('/api/references');
        const resBrands = await fetch('/api/brands');
        const resPosts = await fetch('/api/posts');

        const remoteRefs = await resRefs.json();
        const remoteBrands = await resBrands.json();
        const remotePosts = await resPosts.json();

        // Migration Check
        const localRefs = localStorage.getItem('ikhsan_design_refs');
        const localBrands = localStorage.getItem('ikhsan_brand_refs');
        const localPosts = localStorage.getItem('ikhsan_generated_posts');

        if (localRefs || localBrands || localPosts) {
          console.log("Migration detected. Merging local data to disk...");
          const migratedRefs = [...remoteRefs, ...(localRefs ? JSON.parse(localRefs) : [])];
          const migratedBrands = [...remoteBrands, ...(localBrands ? JSON.parse(localBrands) : [])];
          const migratedPosts = [...remotePosts, ...(localPosts ? JSON.parse(localPosts) : [])];

          await fetch('/api/references', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(migratedRefs) });
          await fetch('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(migratedBrands) });
          await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(migratedPosts) });

          setReferences(migratedRefs);
          setBrands(migratedBrands);
          setGeneratedPosts(migratedPosts);

          localStorage.removeItem('ikhsan_design_refs');
          localStorage.removeItem('ikhsan_brand_refs');
          localStorage.removeItem('ikhsan_generated_posts');
          console.log("Migration complete.");
        } else {
          setReferences(remoteRefs);
          setBrands(remoteBrands);
          setGeneratedPosts(remotePosts);
        }
      } catch (err) {
        console.error("Failed to load data from storage server:", err);
      }
    };
    loadData();
  }, []);

  const handleOpenKey = async () => {
    if (isStandalone) {
      if (manualKey.trim().length > 20) {
        sessionStorage.setItem('IKHSAN_LAB_KEY', manualKey.trim());
        setHasKey(true);
      }
    } else {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const saveData = async (collection: string, data: any) => {
    try {
      await fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error(`Failed to save ${collection}:`, err);
    }
  };

  const saveReference = (ref: DesignReference) => {
    const updated = [ref, ...references];
    setReferences(updated);
    saveData('references', updated);
  };

  const saveBrand = (brand: BrandReference) => {
    const updated = [brand, ...brands];
    setBrands(updated);
    saveData('brands', updated);
  };

  const saveGeneratedPost = (post: GeneratedPost) => {
    const updated = [post, ...generatedPosts];
    setGeneratedPosts(updated);
    saveData('posts', updated);
  };

  const updateGeneratedPost = (post: GeneratedPost) => {
    const updated = generatedPosts.map(p => p.id === post.id ? post : p);
    setGeneratedPosts(updated);
    saveData('posts', updated);
  };

  const deleteReference = (id: string) => {
    const updated = references.filter(r => r.id !== id);
    setReferences(updated);
    saveData('references', updated);
  };

  const deleteBrand = (id: string) => {
    const updated = brands.filter(b => b.id !== id);
    setBrands(updated);
    saveData('brands', updated);
  };

  const deleteGeneratedPost = (id: string) => {
    const updated = generatedPosts.filter(p => p.id !== id);
    setGeneratedPosts(updated);
    saveData('posts', updated);
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-[2.5rem] border border-slate-800 bg-slate-900/50 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Key size={40} className="text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Activation Required</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            {isStandalone
              ? "Stand-alone mode detected. Please enter your Gemini API key to activate the Production Lab."
              : "Studio mode detected. This lab requires a paid API key from your Google Cloud project."}
          </p>

          {isStandalone ? (
            <div className="space-y-4 mb-8">
              <input
                type="password"
                placeholder="Paste API Key here..."
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 italic">Key is stored in sessionStorage and never sent to our servers.</p>
            </div>
          ) : (
            <div className="mb-8">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs flex items-center justify-center gap-2">
                <Globe size={14} /> Review billing documentation
              </a>
            </div>
          )}

          <button
            onClick={handleOpenKey}
            disabled={isStandalone && manualKey.trim().length < 20}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            {isStandalone ? "Activate Lab" : "Select Paid API Key"}
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
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Production Lab Standalone</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-transparent">
                Creative Powerhouse
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ToolCard icon={<Wrench className="text-blue-400" />} title="Design Builder" desc="Extract Structural DNA." onClick={() => setActiveTool(AppTool.BUILDER)} accent="blue" />
              <ToolCard icon={<Palette className="text-pink-400" />} title="Brand Identity" desc="Save Color DNA." onClick={() => setActiveTool(AppTool.BRAND_LAB)} accent="pink" />
              <ToolCard icon={<Star className="text-cyan-400" />} title="Inspo Library" desc="Manage Vault." onClick={() => setActiveTool(AppTool.LIBRARY)} accent="cyan" />
              <ToolCard icon={<Rocket className="text-indigo-400" />} title="Post Generator" desc="Deploy & Remix." onClick={() => setActiveTool(AppTool.GENERATOR)} accent="indigo" />
            </div>

            {isStandalone && (
              <div className="mt-16 pt-8 border-t border-slate-800 text-center">
                <button
                  onClick={() => { sessionStorage.removeItem('IKHSAN_LAB_KEY'); window.location.reload(); }}
                  className="text-[10px] font-bold text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  Reset Session API Key
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div onClick={() => setActiveTool(AppTool.LANDING)} className="flex items-center space-x-3 cursor-pointer">
          <Zap size={20} className="text-blue-500" />
          <span className="font-bold text-lg tracking-tight">IKHSAN'S <span className="text-blue-500">LAB</span></span>
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
    <div className="flex items-center text-xs font-bold text-blue-500">ENTER CHAMBER <ChevronRight size={14} /></div>
  </div>
);

export default App;
