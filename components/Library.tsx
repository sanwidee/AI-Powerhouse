
import React, { useState } from 'react';
import { Search, Tag, Trash2, ExternalLink, Download, ArrowLeft, Filter, Grid, List as ListIcon, ImageIcon, LayoutTemplate, Copy, Check } from 'lucide-react';
import { DesignReference } from '../types';

interface LibraryProps {
  references: DesignReference[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

const Library: React.FC<LibraryProps> = ({ references, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRef, setSelectedRef] = useState<DesignReference | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'template'>('template');
  const [copied, setCopied] = useState(false);

  const filtered = references.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.jsonSpec.visual_style.motifs.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(references));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "design_lab_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Design Library</h2>
            <p className="text-slate-400">Your vault of structural inspirations.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
             <button 
              onClick={() => setViewMode('template')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'template' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
             >
               <LayoutTemplate size={14} />
               <span>Templates</span>
             </button>
             <button 
              onClick={() => setViewMode('original')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'original' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
             >
               <ImageIcon size={14} />
               <span>Originals</span>
             </button>
          </div>
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <Download size={16} />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, motif, or style..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700">
          <Filter size={20} />
        </button>
      </div>

      {references.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-3xl">
          <div className="inline-flex p-6 rounded-full bg-slate-800 mb-6">
            <Search size={48} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No references found</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Upload and analyze your first design to start building your powerhouse vault.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(ref => {
            const displayImg = viewMode === 'template' && ref.templateImage ? ref.templateImage : ref.imageSource;
            return (
              <div 
                key={ref.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer flex flex-col"
                onClick={() => setSelectedRef(ref)}
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-black">
                  <img 
                    src={displayImg} 
                    alt={ref.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {viewMode === 'template' && !ref.templateImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="text-[10px] bg-slate-800/80 px-2 py-1 rounded text-slate-400 uppercase tracking-widest font-bold">Original Reference Only</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="font-bold text-lg leading-tight truncate">{ref.name}</h4>
                    <p className="text-xs text-blue-400 font-medium mt-1 uppercase tracking-widest">{ref.jsonSpec.visual_style.layout}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(ref.id); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedRef && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">{selectedRef.name}</h2>
              <button 
                onClick={() => setSelectedRef(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-bold text-slate-300 border border-slate-700"
              >
                Close Lab Entry
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex space-x-4 mb-4">
                   <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">STRUCTURE REFERENCE</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Original Reference</span>
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-[4/5] flex items-center justify-center">
                       <img src={selectedRef.imageSource} className="w-full h-full object-cover" alt="Original" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Visual Template</span>
                    <div className="rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-900 aspect-[4/5] flex items-center justify-center relative">
                       {selectedRef.templateImage ? (
                         <img src={selectedRef.templateImage} className="w-full h-full object-cover" alt="Template" />
                       ) : (
                         <div className="text-center p-4">
                           <LayoutTemplate size={32} className="mx-auto text-slate-700 mb-2" />
                           <p className="text-[10px] text-slate-600 uppercase font-bold">No template saved</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedRef.jsonSpec.platform_ratios.map(r => (
                    <span key={r} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-400">{r}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                  <h3 className="text-xl font-bold mb-6 flex items-center space-x-3">
                    <Tag size={20} className="text-blue-400" />
                    <span>Visual DNA</span>
                  </h3>
                  <div className="space-y-4 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                    {selectedRef.markdownBrief.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-[#0a0f1d] border border-slate-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                    <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Machine Prompt Logic</span>
                    <button 
                      onClick={() => copyPrompt(selectedRef.jsonSpec.visual_prompt)}
                      className="flex items-center space-x-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied' : 'Copy Visual Prompt'}</span>
                    </button>
                  </div>
                  <pre className="p-6 text-sm text-cyan-500/80 mono overflow-x-auto max-h-[300px]">
                    {JSON.stringify(selectedRef.jsonSpec, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
