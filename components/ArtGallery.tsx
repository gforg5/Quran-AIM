
import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { GalleryIcon, MalikLogo } from './Icons';

const ArtGallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('almalik_gallery');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you wish to expunge this artifact from the archive?")) {
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      localStorage.setItem('almalik_gallery', JSON.stringify(newItems));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gold p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] text-emerald-950 shadow-2xl relative overflow-hidden">
         <div className="relative z-10 space-y-2 lg:space-y-4">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase">The <span className="text-white">Galleria</span></h2>
            <p className="text-[10px] lg:text-sm text-emerald-900/60 max-w-xl font-bold">Your personal collection of manifested sacred visions and digital artifacts.</p>
         </div>
         <div className="absolute top-0 right-0 p-12 lg:p-20 opacity-10 pointer-events-none">
            <GalleryIcon className="w-48 h-48 lg:w-80 lg:h-80" />
         </div>
      </header>

      {items.length === 0 ? (
        <div className="py-24 lg:py-40 flex flex-col items-center justify-center text-center space-y-6 lg:space-y-8 glass-premium rounded-[2.5rem] lg:rounded-[4rem] border-2 border-dashed border-gold/20 mx-4">
           <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gold/5 rounded-full flex items-center justify-center">
              <GalleryIcon className="w-8 h-8 lg:w-12 lg:h-12 text-gold/30" />
           </div>
           <div className="space-y-2">
             <h3 className="text-xl lg:text-2xl font-black text-emerald-950 dark:text-white uppercase tracking-tighter">Vault Empty</h3>
             <p className="text-[10px] lg:text-sm text-slate-400 font-medium">Generate sacred art in the Studio to populate your archive.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8 px-4 lg:px-0">
           {items.map((item) => (
             <div 
               key={item.id} 
               onClick={() => setSelectedItem(item)}
               className="group relative glass-premium rounded-[1.5rem] lg:rounded-[3rem] overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 lg:hover:-translate-y-4 border border-gold/10 aspect-square"
             >
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-emerald-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 lg:p-8">
                   <p className="text-[7px] lg:text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1 lg:mb-2">Authenticated Artifact</p>
                   <p className="text-[9px] lg:text-xs font-bold text-white line-clamp-2 italic mb-3">"{item.prompt}"</p>
                   <button 
                     onClick={(e) => deleteItem(item.id, e)}
                     className="self-end p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-lg transition-colors border border-red-500/40"
                   >
                     <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-emerald-950/95 backdrop-blur-2xl animate-in zoom-in duration-300">
           <div className="max-w-5xl w-full bg-white dark:bg-emerald-950 rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl relative flex flex-col border border-gold/20 max-h-[95vh]">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 lg:top-8 lg:right-8 z-10 p-3 lg:p-4 bg-emerald-950/10 dark:bg-white/10 rounded-full text-slate-600 dark:text-gold hover:scale-110 transition-all backdrop-blur-md"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="w-full h-[40vh] lg:h-[60vh] bg-black">
                 <img src={selectedItem.url} className="w-full h-full object-contain" />
              </div>

              <div className="p-6 lg:p-10 space-y-4 lg:space-y-6 overflow-y-auto">
                 <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                    <div>
                       <span className="text-[8px] lg:text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-1 lg:mb-2 block">Vision Manifestation Record</span>
                       <h3 className="text-xl lg:text-2xl font-black text-emerald-950 dark:text-white uppercase tracking-tighter">Archive ID: {selectedItem.id}</h3>
                    </div>
                    <div className="lg:text-right">
                       <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedItem.timestamp).toLocaleDateString()}</p>
                       <p className="text-[8px] lg:text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sovereign Encryption: Active</p>
                    </div>
                 </div>
                 <div className="p-4 lg:p-6 bg-slate-50 dark:bg-black/40 rounded-2xl lg:rounded-3xl border border-gold/5">
                    <p className="text-[10px] lg:text-sm font-medium text-slate-600 dark:text-emerald-100 italic leading-relaxed">"{selectedItem.prompt}"</p>
                 </div>
                 <div className="flex gap-3 lg:gap-4">
                    <a 
                      href={selectedItem.url} 
                      download={`almalik-art-${selectedItem.id}.png`}
                      className="flex-1 py-3 lg:py-4 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black uppercase tracking-widest text-[8px] lg:text-[10px] rounded-xl lg:rounded-2xl text-center hover:scale-[1.03] transition-all shadow-xl"
                    >
                      Acquire Export
                    </a>
                    <button 
                      onClick={(e) => deleteItem(selectedItem.id, e)}
                      className="px-6 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl lg:rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ArtGallery;
