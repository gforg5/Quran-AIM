
import React from 'react';
import { CreditCardIcon, MalikLogo } from './Icons';

const Sadaqah: React.FC = () => {
  const paymentMethods = [
    { name: 'EasyPaisa', icon: '💸', color: 'bg-green-500' },
    { name: 'JazzCash', icon: '📱', color: 'bg-red-600' },
    { name: 'Credit/Debit Card', icon: '💳', color: 'bg-blue-600' },
    { name: 'Bank Transfer', icon: '🏦', color: 'bg-slate-700' },
  ];

  const features = [
    { en: 'Global Dawah Support', ur: 'عالمی دعوت سپورٹ' },
    { en: 'Server Maintenance', ur: 'سرور کی دیکھ بھال' },
    { en: 'New AI Features', ur: 'نئی AI خصوصیات' },
    { en: 'Research & Development', ur: 'تحقیق و ترقی' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-20 px-4 text-center space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCardIcon className="w-8 h-8 md:w-12 md:h-12 text-gold" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black text-navy-950 dark:text-white tracking-tighter uppercase italic playfair">Sadaqah & <span className="text-gradient-gold">Support</span></h2>
          <p className="arabic-text text-xl md:text-3xl text-gold font-bold">صدقہ اور تعاون</p>
        </div>
        <p className="text-slate-500 dark:text-emerald-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Contribute to the path of knowledge (صدقہ جاریہ)</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-premium p-8 md:p-12 rounded-[2.5rem] border border-gold/10 shadow-2xl space-y-8 bg-white/50 dark:bg-navy-900/40 text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Why Donate?</h3>
            <p className="arabic-text text-sm text-gold font-bold">عطیہ کیوں دیں؟</p>
          </div>
          <div className="space-y-4">
            <p className="text-sm md:text-base text-slate-600 dark:text-emerald-100 leading-relaxed">
              Your contributions help us maintain the servers, develop new features for the Quranic AI, and keep this application free for everyone worldwide.
            </p>
            <p className="arabic-text text-sm md:text-base text-gold font-medium leading-relaxed">
              آپ کے عطیات ہمیں سرورز کو برقرار رکھنے، قرآنی AI کے لیے نئی خصوصیات تیار کرنے، اور اس ایپلیکیشن کو دنیا بھر میں ہر کسی کے لیے مفت رکھنے میں مدد دیتے ہیں۔
            </p>
          </div>
          <ul className="space-y-3">
             {features.map((item, i) => (
               <li key={i} className="flex flex-col gap-0.5">
                 <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-gold uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                   {item.en}
                 </div>
                 <p className="arabic-text text-[10px] text-slate-400 dark:text-emerald-500/60 ml-4">{item.ur}</p>
               </li>
             ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-left px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Method (ادائیگی کا طریقہ)</h3>
          <div className="grid gap-4">
            {paymentMethods.map(method => (
              <button 
                key={method.name}
                className="w-full flex items-center justify-between p-6 bg-white dark:bg-navy-900 border border-gold/5 rounded-[1.5rem] hover:border-gold/30 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                   <span className="text-2xl">{method.icon}</span>
                   <span className="font-black text-navy-950 dark:text-white uppercase tracking-tighter">{method.name}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center group-hover:bg-gold group-hover:text-navy-950 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 glass-premium rounded-[2.5rem] border border-gold/20 bg-emerald-950 text-white shadow-3xl space-y-6">
         <div className="space-y-4">
           <h4 className="text-lg md:text-2xl font-black italic">"The example of those who spend their wealth in the way of Allah is like a seed of grain..."</h4>
           <p className="arabic-text text-xl md:text-3xl text-gold font-bold leading-relaxed">"ان لوگوں کی مثال جو اللہ کی راہ میں اپنا مال خرچ کرتے ہیں اس بیج کی سی ہے جس نے سات بالیاں اگائیں، ہر بالی میں سو سو دانے ہوں، اور اللہ جس کے لیے چاہتا ہے اسے دگنا کر دیتا ہے، اور اللہ بڑی کشادگی والا اور جاننے والا ہے۔"</p>
         </div>
         <p className="text-xs text-gold font-bold uppercase tracking-[0.3em]">Surah Al-Baqarah • 261</p>
      </div>
    </div>
  );
};

export default Sadaqah;
