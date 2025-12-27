
import React, { useState, useRef } from 'react';
/* Added missing XCircle to the import list from lucide-react */
import { Search, Tag, Trash2, ExternalLink, Download, ArrowLeft, Filter, Grid, List as ListIcon, ImageIcon, LayoutTemplate, Copy, Check, Palette, ShieldAlert, Zap, History, FileCode, Terminal, Rocket, Clock, MessageSquare, Send, Loader2, Upload, AlertCircle, Eye, XCircle } from 'lucide-react';
import { DesignReference, BrandReference, GeneratedPost, RetouchHistory, UsageLog } from '../types';
import { refinePostImage } from '../services/geminiService';

interface LibraryProps {
  references: DesignReference[];
  brands: BrandReference[];
  generatedPosts: GeneratedPost[];
  onDelete: (id: string) => void;
  onDeleteBrand: (id: string) => void;
  onDeletePost: (id: string) => void;
  onUpdatePost: (post: GeneratedPost) => void;
  onBack: () => void;
}

const Library: React.FC<LibraryProps> = ({ references, brands, generatedPosts, onDelete, onDeleteBrand, onDeletePost, onUpdatePost, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRef, setSelectedRef] = useState<DesignReference | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandReference | null>(null);
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'template' | 'brands' | 'generated'>('generated');
  const [copied, setCopied] = useState(false);

  // Retouch Studio State
  const [retouchInput, setRetouchInput] = useState('');
  const [retouchRefImg, setRetouchRefImg] = useState<string | null>(null);
  const [isAnnotation, setIsAnnotation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);
  const retouchFileRef = useRef<HTMLInputElement>(null);

  const filteredRefs = references.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.jsonSpec?.structural_rules?.aesthetic_motifs || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = generatedPosts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetouch = async () => {
    if (!selectedPost || !retouchInput) return;
    setIsProcessing(true);
    setStudioError(null);
    try {
      const { image: refinedImg } = await refinePostImage(
        selectedPost.imageSource,
        retouchInput,
        selectedPost.aspectRatio,
        retouchRefImg || undefined,
        isAnnotation
      );

      const newHistory: RetouchHistory = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        instruction: retouchInput,
        image: refinedImg,
        type: retouchRefImg ? 'visual_reference' : (isAnnotation ? 'annotation' : 'text')
      };

      const updatedPost = {
        ...selectedPost,
        imageSource: refinedImg,
        history: [newHistory, ...selectedPost.history]
      };

      onUpdatePost(updatedPost);
      setSelectedPost(updatedPost);
      setRetouchInput('');
      setRetouchRefImg(null);
      setIsAnnotation(false);
    } catch (err: any) {
      setStudioError("Production engine failed. The instruction was too complex or output blocked.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRetouchRefImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center space-x-5">
          <button onClick={onBack} className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 flex items-center justify-center border border-slate-700/50">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">The Vault</h2>
            <p className="text-slate-400 text-sm">Centralized structural and brand DNA registry.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
          <button onClick={() => setViewMode('generated')} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'generated' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <Rocket size={14} /><span>Generated</span>
          </button>
          <button onClick={() => setViewMode('template')} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'template' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <LayoutTemplate size={14} /><span>Blueprints</span>
          </button>
          <button onClick={() => setViewMode('original')} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'original' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <History size={14} /><span>Originals</span>
          </button>
          <button onClick={() => setViewMode('brands')} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'brands' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <Palette size={14} /><span>Brands</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input type="text" placeholder="Search the Vault..." className="w-full pl-14 pr-6 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {viewMode === 'generated' && (
          filteredPosts.length === 0 ? <EmptyState icon={<Rocket size={64} />} label="No generated content yet." /> :
            filteredPosts.map(post => (
              <div key={post.id} onClick={() => setSelectedPost(post)} className="group rounded-[2.5rem] border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-green-500/40 transition-all cursor-pointer relative flex flex-col">
                <div className="aspect-[4/5] relative bg-black">
                  <img src={post.imageSource} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt={post.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-2 mb-2"><Clock size={12} className="text-green-400" /><span className="text-[10px] font-bold text-slate-400 uppercase">{post.history.length} Iterations</span></div>
                    <h4 className="font-bold text-lg text-white truncate">{post.name}</h4>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-600 font-mono uppercase">{new Date(post.createdAt).toLocaleDateString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDeletePost(post.id); }} className="p-2 rounded-xl text-slate-600 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
        )}

        {viewMode === 'brands' && (
          filteredBrands.map(brand => (
            <div key={brand.id} onClick={() => setSelectedBrand(brand)} className="group rounded-[2.5rem] border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-pink-500/40 transition-all cursor-pointer">
              <div className="aspect-[4/5] bg-slate-950 flex items-center justify-center p-8"><img src={brand.imageSource} className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100" alt={brand.name} /></div>
              <div className="p-5 flex items-center justify-between border-t border-slate-800/50">
                <h4 className="font-bold text-white truncate">{brand.name}</h4>
                <button onClick={(e) => { e.stopPropagation(); onDeleteBrand(brand.id); }} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}

        {viewMode === 'template' && (
          filteredRefs.map(ref => (
            <div key={ref.id} onClick={() => setSelectedRef(ref)} className="group rounded-[2.5rem] border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-blue-500/40 transition-all cursor-pointer">
              <div className="aspect-[4/5] bg-black"><img src={ref.templateImage || ref.imageSource} className="w-full h-full object-cover opacity-80" alt={ref.name} /></div>
              <div className="p-5 flex items-center justify-between border-t border-slate-800/50">
                <h4 className="font-bold text-white truncate">{ref.name}</h4>
                <button onClick={(e) => { e.stopPropagation(); onDelete(ref.id); }} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PRODUCTION STUDIO MODAL (GENERATED POSTS) */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-[#020617] backdrop-blur-3xl overflow-y-auto animate-in fade-in duration-300">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-8">
              <div className="flex items-center space-x-6">
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 shadow-2xl"><Rocket size={32} className="text-green-400" /></div>
                <div><h2 className="text-4xl font-bold text-white">{selectedPost.name}</h2><p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Production Studio Studio v3.0</p></div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-all font-bold text-slate-300">Exit Studio</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* LEFT: LIVE RENDER & RETOUCH */}
              <div className="lg:col-span-8 space-y-8">
                <div className="rounded-[3rem] overflow-hidden border border-slate-800 bg-black aspect-square shadow-2xl relative flex items-center justify-center p-4">
                  <img src={selectedPost.imageSource} className="max-w-full max-h-full object-contain" alt="Current Render" />
                  {isProcessing && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center animate-pulse z-20"><Zap size={48} className="text-green-400 mb-6 animate-bounce" /><span className="text-xs font-bold text-green-300 tracking-[0.3em]">PROCESSING LAYER...</span></div>}
                </div>

                <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-slate-800 shadow-2xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3"><MessageSquare size={20} className="text-green-400" /><span className="text-sm font-bold uppercase tracking-widest text-slate-400">Visual Retouch Engine</span></div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setIsAnnotation(!isAnnotation)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isAnnotation ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><Eye size={12} /><span>ANNOTATION MODE</span></button>
                      <button onClick={() => retouchFileRef.current?.click()} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${retouchRefImg ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><ImageIcon size={12} /><span>REF IMAGE</span></button>
                      <input type="file" ref={retouchFileRef} onChange={handleRefImgUpload} className="hidden" accept="image/*" />
                    </div>
                  </div>

                  {retouchRefImg && (
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 animate-in zoom-in-95">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-blue-500/40 flex items-center justify-center bg-black"><img src={retouchRefImg} className="max-w-full max-h-full object-contain" /></div>
                      <div className="flex-1"><span className="text-[10px] font-bold text-blue-400 block mb-1">REFERENCE LAYER DETECTED</span><p className="text-xs text-slate-500 italic">This image will be used as a structural or content reference for the retouch.</p></div>
                      <button onClick={() => setRetouchRefImg(null)} className="p-2 text-slate-600 hover:text-red-400"><XCircle size={18} /></button>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <input type="text" placeholder={isAnnotation ? "e.g. 'Shift the headline 20px down', 'Resize logo block'..." : "e.g. 'Add a neon glow to the background', 'Change text to bold navy'..."} className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500/50" value={retouchInput} onChange={(e) => setRetouchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRetouch()} />
                    <button onClick={handleRetouch} disabled={!retouchInput || isProcessing} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 p-4 rounded-2xl transition-all active:scale-90 text-white shadow-xl"><Send size={24} /></button>
                  </div>

                  {studioError && <div className="flex items-center space-x-3 text-red-400 text-sm p-4 rounded-2xl bg-red-500/10 border border-red-500/20"><AlertCircle size={18} /><p>{studioError}</p></div>}
                </div>
              </div>

              {/* RIGHT: VERSION LOG */}
              <div className="lg:col-span-4 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-6"><Clock size={20} className="text-slate-500" /><h3 className="text-lg font-bold text-slate-200">Revision History</h3></div>
                <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-hide">
                  {selectedPost.history.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-800 rounded-[2rem] text-center text-slate-600 text-xs uppercase tracking-widest font-bold">No revisions logged.</div>
                  ) : (
                    selectedPost.history.map((log) => (
                      <div key={log.id} className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4 group hover:border-slate-600 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${log.type === 'annotation' ? 'bg-orange-500/10 text-orange-400' : log.type === 'visual_reference' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{log.type}</span>
                        </div>
                        <div
                          className="aspect-square rounded-2xl overflow-hidden border border-slate-800/50 bg-black cursor-pointer relative group/img"
                          onClick={() => onUpdatePost({ ...selectedPost, imageSource: log.image })}
                        >
                          <img src={log.image} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-green-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-green-600 text-white text-[10px] font-bold py-1 px-3 rounded-full shadow-lg">ROLLBACK</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 italic">"{log.instruction}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODALS (ORIGINALS/TEMPLATES/BRANDS) - Simplified for length, keeping structure */}
      {selectedRef && <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl p-6 overflow-y-auto flex items-center justify-center" onClick={() => setSelectedRef(null)}><div className="max-w-2xl bg-slate-900 p-8 rounded-[3rem] border border-slate-800" onClick={e => e.stopPropagation()}><img src={selectedRef.imageSource} className="rounded-2xl mb-6 max-h-[70vh] w-full object-contain" /><h2 className="text-2xl font-bold">{selectedRef.name}</h2></div></div>}
      {selectedBrand && <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl p-6 overflow-y-auto flex items-center justify-center" onClick={() => setSelectedBrand(null)}><div className="max-w-2xl bg-slate-900 p-8 rounded-[3rem] border border-slate-800" onClick={e => e.stopPropagation()}><img src={selectedBrand.imageSource} className="rounded-2xl mb-6 max-h-[70vh] w-full object-contain" /><h2 className="text-2xl font-bold">{selectedBrand.name}</h2></div></div>}
    </div>
  );
};

const EmptyState = ({ icon, label }: any) => (
  <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20 flex flex-col items-center">
    <div className="opacity-10 mb-6">{icon}</div>
    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">{label}</p>
  </div>
);

export default Library;
