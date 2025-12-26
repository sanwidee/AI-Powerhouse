
import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Star, 
  Rocket, 
  LayoutDashboard, 
  ChevronRight, 
  Terminal, 
  Github,
  Moon,
  Zap
} from 'lucide-react';
import { AppTool, DesignReference } from './types';
import Builder from './components/Builder';
import Library from './components/Library';
import Generator from './components/Generator';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<AppTool>(AppTool.LANDING);
  const [references, setReferences] = useState<DesignReference[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ikhsan_design_refs');
    if (saved) {
      try {
        setReferences(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading library", e);
      }
    }
  }, []);

  const saveReference = (ref: DesignReference) => {
    const updated = [ref, ...references];
    setReferences(updated);
    localStorage.setItem('ikhsan_design_refs', JSON.stringify(updated));
  };

  const deleteReference = (id: string) => {
    const updated = references.filter(r => r.id !== id);
    setReferences(updated);
    localStorage.setItem('ikhsan_design_refs', JSON.stringify(updated));
  };

  const renderTool = () => {
    switch (activeTool) {
      case AppTool.BUILDER:
        return <Builder onSave={saveReference} onBack={() => setActiveTool(AppTool.LANDING)} />;
      case AppTool.LIBRARY:
        return <Library references={references} onDelete={deleteReference} onBack={() => setActiveTool(AppTool.LANDING)} />;
      case AppTool.GENERATOR:
        return <Generator references={references} onBack={() => setActiveTool(AppTool.LANDING)} />;
      default:
        return (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <header className="mb-16 text-center animate-fade-in">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <Zap size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Version 1.0 Stable</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-transparent">
                Ikhsan’s AI Powerhouse
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Post Design Lab: Analyze, Reverse-Engineer, and Evolve your creative inspirations into high-converting social content.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ToolCard 
                icon={<Wrench className="text-blue-400" />}
                title="Design → Prompt Builder"
                desc="Upload any post. Our lab extracts the visual DNA, layout logic, and creates AI-ready prompts."
                onClick={() => setActiveTool(AppTool.BUILDER)}
                accent="blue"
              />
              <ToolCard 
                icon={<Star className="text-cyan-400" />}
                title="Inspiration Library"
                desc="Manage your curated collection of structural design references. Your local secret weapon."
                onClick={() => setActiveTool(AppTool.LIBRARY)}
                accent="cyan"
              />
              <ToolCard 
                icon={<Rocket className="text-indigo-400" />}
                title="Post Generator"
                desc="Generate new variations based on your saved briefs. Scale your production without losing taste."
                onClick={() => setActiveTool(AppTool.GENERATOR)}
                accent="indigo"
              />
            </div>

            <footer className="mt-24 pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="flex items-center space-x-1">
                  <Terminal size={16} />
                  <span>Local-First Design System</span>
                </div>
                <span>•</span>
                <span>Optimized for Gemini Flash Image</span>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Updates</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-white transition-colors">
                  <Github size={16} />
                  <span>v1.0.4</span>
                </a>
              </div>
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTool(AppTool.LANDING)}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all">
              <Zap size={18} fill="white" />
            </div>
            <span className="font-bold text-lg tracking-tight">DESIGN <span className="text-blue-500">LAB</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <NavButton active={activeTool === AppTool.BUILDER} icon={<Wrench size={16} />} label="Builder" onClick={() => setActiveTool(AppTool.BUILDER)} />
            <NavButton active={activeTool === AppTool.LIBRARY} icon={<Star size={16} />} label="Library" onClick={() => setActiveTool(AppTool.LIBRARY)} />
            <NavButton active={activeTool === AppTool.GENERATOR} icon={<Rocket size={16} />} label="Generator" onClick={() => setActiveTool(AppTool.GENERATOR)} />
          </div>

          <div className="flex items-center space-x-4">
             <button className="p-2 text-slate-400 hover:text-white transition-colors">
               <Moon size={20} />
             </button>
             <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20">
               Connect API
             </button>
          </div>
        </div>
      </nav>

      <main>
        {renderTool()}
      </main>
    </div>
  );
};

const ToolCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, onClick: () => void, accent: string }> = ({ icon, title, desc, onClick, accent }) => {
  const accentColors: any = {
    blue: "hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
    cyan: "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    indigo: "hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 cursor-pointer transition-all duration-300 ${accentColors[accent] || ''}`}
    >
      <div className="mb-6 p-3 rounded-xl bg-slate-800/50 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center text-sm font-semibold text-blue-500">
        Enter Module <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, icon: React.ReactNode, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
