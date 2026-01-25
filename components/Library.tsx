
import React, { useState } from 'react';
import { LibraryItem } from '../types';
import { LibraryIcon, SparklesIcon, BookOpenIcon } from './Icons';

const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ["All", "Quran", "Hadith", "Seerah", "Fiqh", "History", "Media", "Children"];

  const items: LibraryItem[] = [
    { id: '1', title: "Sahih al-Bukhari", author: "Imam Bukhari", category: "Hadith", type: 'book', image: "https://picsum.photos/seed/bukhari1/400/600", pages: 2300, language: "Arabic/English", rating: 5, description: "The most authentic book after the Quran, containing thousands of verified traditions of the Prophet (PBUH)." },
    { id: '2', title: "The Sealed Nectar", author: "Safiur Rahman", category: "Seerah", type: 'book', image: "https://picsum.photos/seed/seerah1/400/600", pages: 580, language: "English", rating: 4.8, description: "A detailed biography of the Prophet Muhammad (PBUH), award-winning for its accuracy and flow." },
    { id: '3', title: "Tafsir Ibn Kathir", author: "Ibn Kathir", category: "Quran", type: 'book', image: "https://picsum.photos/seed/tafsir1/400/600", pages: 4000, language: "English/Arabic", rating: 5, description: "One of the most widely accepted interpretations of the Holy Quran." },
    { id: '4', title: "Riyad as-Salihin", author: "Imam an-Nawawi", category: "Hadith", type: 'book', image: "https://picsum.photos/seed/nawawi1/400/600", pages: 800, language: "Multiple", rating: 4.9, description: "A collection of verses from the Quran supplemented by hadith, covering all aspects of Islamic belief." },
    { id: '5', title: "Prophetic Medicine", author: "Ibn al-Qayyim", category: "History", type: 'book', image: "https://picsum.photos/seed/med1/400/600", pages: 450, language: "English", rating: 4.5, description: "Classical knowledge on health and healing recommended by the Prophet (PBUH)." },
    { id: '6', title: "Al-Bidayah wan-Nihayah", author: "Ibn Kathir", category: "History", type: 'book', image: "https://picsum.photos/seed/hist2/400/600", pages: 15000, language: "Arabic", rating: 5, description: "A monumental work on the history of the world from an Islamic perspective." },
    { id: '7', title: "Bulugh al-Maram", author: "Ibn Hajar", category: "Fiqh", type: 'book', image: "https://picsum.photos/seed/fiqh1/400/600", pages: 600, language: "Arabic/English", rating: 4.7, description: "A collection of hadith that forms the basis of Islamic Jurisprudence." },
    { id: '8', title: "Stories of the Prophets", author: "Ibn Kathir", category: "Children", type: 'book', image: "https://picsum.photos/seed/kids1/400/600", pages: 300, language: "English", rating: 4.9, description: "Simplified biographies of the Prophets for young readers." }
  ];

  const filteredItems = items.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 bg-emerald-950 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-b-8 border-gold">
         <div className="relative z-10 space-y-4">
            <h2 className="text-5xl font-black tracking-tighter uppercase">Divine <span className="text-gold">Archives</span></h2>
            <p className="text-emerald-100/60 max-w-xl font-medium">Access over 10,000 authenticated scrolls of knowledge from the Golden Age to modern scholars.</p>
         </div>
         <div className="relative z-10 w-full md:w-96 group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query the scrolls..." 
              className="w-full py-4 pl-12 pr-6 rounded-2xl bg-white/10 border border-white/20 focus:border-gold outline-none text-sm transition-all"
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>
         <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <LibraryIcon className="w-80 h-80" />
         </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? 'bg-gold text-emerald-950 shadow-xl scale-105' 
                : 'bg-white dark:bg-emerald-950/50 text-slate-500 dark:text-emerald-500 border border-gold/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer glass-premium rounded-[3rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-gold/10"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-gold rounded-3xl flex items-center justify-center text-emerald-950 transform -translate-y-10 group-hover:translate-y-0 transition-transform">
                     <BookOpenIcon className="w-8 h-8" />
                  </div>
               </div>
            </div>
            <div className="p-8 space-y-2">
               <span className="text-[9px] font-black text-gold uppercase tracking-widest">{item.category}</span>
               <h4 className="text-lg font-black text-emerald-950 dark:text-white line-clamp-1">{item.title}</h4>
               <p className="text-xs font-bold text-slate-400 italic">By {item.author}</p>
            </div>
          </div>
        ))}
      </div>
      
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-emerald-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="max-w-6xl w-full bg-white dark:bg-emerald-950 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
              <button onClick={() => setSelectedItem(null)} className="absolute top-10 right-10 z-10 text-slate-400 hover:text-gold transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="md:w-1/3 relative h-[400px] md:h-auto">
                 <img src={selectedItem.image} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent opacity-80"></div>
                 <div className="absolute bottom-10 left-10 text-white">
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-2">Sacred Classification</p>
                    <h3 className="text-3xl font-black uppercase">{selectedItem.title}</h3>
                 </div>
              </div>

              <div className="flex-1 p-16 space-y-8 overflow-y-auto max-h-[80vh]">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Abstract From Archive</h5>
                    <p className="text-xl font-medium text-slate-600 dark:text-emerald-100 leading-relaxed">
                      {selectedItem.description}
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Author / Scholar</p>
                       <p className="text-sm font-black text-emerald-950 dark:text-white">{selectedItem.author}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Rating</p>
                       <p className="text-sm font-black text-gold">★★★★★ 5.0</p>
                    </div>
                 </div>

                 <button className="w-full py-6 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black uppercase tracking-widest rounded-3xl hover:scale-105 transition-all shadow-xl">
                    Acquire Digital Copy
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Library;
