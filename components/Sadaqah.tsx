
import React, { useState } from 'react';
import { CreditCardIcon, MalikLogo } from './Icons';

interface PaymentMethod {
  name: string;
  icon: string;
  color: string;
  detailsLabel: string;
  placeholder: string;
}

const Sadaqah: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; date: string; amount: string; method: string } | null>(null);

  const paymentMethods: PaymentMethod[] = [
    { name: 'EasyPaisa', icon: '💸', color: 'bg-green-500', detailsLabel: 'Mobile Number', placeholder: '03XX-XXXXXXX' },
    { name: 'JazzCash', icon: '📱', color: 'bg-red-600', detailsLabel: 'Mobile Number', placeholder: '03XX-XXXXXXX' },
    { name: 'Credit/Debit Card', icon: '💳', color: 'bg-blue-600', detailsLabel: 'Card Number', placeholder: 'XXXX XXXX XXXX XXXX' },
    { name: 'Bank Transfer', icon: '🏦', color: 'bg-slate-700', detailsLabel: 'IBAN / Account', placeholder: 'PKXX XXXX ...' },
  ];

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate real functional processing
    setTimeout(() => {
      const newReceipt = {
        id: `ALM-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleString(),
        amount: amount,
        method: selectedMethod?.name || 'N/A'
      };
      setIsProcessing(false);
      setReceipt(newReceipt);
    }, 2000);
  };

  const resetAll = () => {
    setReceipt(null);
    setSelectedMethod(null);
    setAmount('');
    setAccountInfo('');
    setReference('');
  };

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
                onClick={() => setSelectedMethod(method)}
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

      {/* Payment/Receipt Modal */}
      {(selectedMethod || receipt) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="max-w-md w-full bg-white dark:bg-navy-900 rounded-[2.5rem] overflow-hidden shadow-3xl border border-gold/20 relative">
            {receipt ? (
              <div className="p-8 md:p-12 text-center space-y-6 animate-in zoom-in">
                 <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Transaction Success</h3>
                    <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">Official Digital Receipt</p>
                 </div>

                 <div className="bg-slate-50 dark:bg-navy-950 p-6 rounded-3xl border border-gold/5 text-left space-y-4">
                    <div className="flex justify-between border-b border-gold/5 pb-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reference No.</span>
                      <span className="text-[10px] font-black text-navy-950 dark:text-white">{receipt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gold/5 pb-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date / Time</span>
                      <span className="text-[10px] font-black text-navy-950 dark:text-white">{receipt.date}</span>
                    </div>
                    <div className="flex justify-between border-b border-gold/5 pb-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                      <span className="text-[10px] font-black text-navy-950 dark:text-white">{receipt.method}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</span>
                      <span className="text-lg font-black text-gold">PKR {receipt.amount}</span>
                    </div>
                 </div>

                 <button onClick={resetAll} className="w-full py-4 bg-gold text-navy-950 font-black rounded-2xl uppercase tracking-widest text-[9px] shadow-xl hover:scale-[1.02] transition-all">Close Receipt</button>
                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">JazakAllah Khair for your support.</p>
              </div>
            ) : (
              selectedMethod && (
                <>
                  <div className="bg-gold p-6 text-navy-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedMethod.icon}</span>
                      <h3 className="font-black uppercase tracking-widest text-xs">Donate via {selectedMethod.name}</h3>
                    </div>
                    <button onClick={() => setSelectedMethod(null)} className="p-2 hover:bg-black/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <form onSubmit={handleProcessPayment} className="p-8 space-y-6">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Donation Amount (PKR)</label>
                      <input 
                        type="number" 
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 5000" 
                        className="w-full py-4 px-6 bg-slate-50 dark:bg-navy-950 rounded-2xl font-black text-lg outline-none border border-gold/5 focus:border-gold/30 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{selectedMethod.detailsLabel}</label>
                      <input 
                        type="text" 
                        required
                        value={accountInfo}
                        onChange={(e) => setAccountInfo(e.target.value)}
                        placeholder={selectedMethod.placeholder}
                        className="w-full py-4 px-6 bg-slate-50 dark:bg-navy-950 rounded-2xl font-black text-sm outline-none border border-gold/5 focus:border-gold/30 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Purpose / Note (Optional)</label>
                      <input 
                        type="text" 
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="e.g. Sadaqah Jariyah"
                        className="w-full py-4 px-6 bg-slate-50 dark:bg-navy-950 rounded-2xl font-black text-[10px] outline-none border border-gold/5 focus:border-gold/30 transition-all shadow-inner"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full py-5 bg-navy-950 dark:bg-gold text-white dark:text-navy-950 font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'Validating Connection...' : 'Confirm Transaction'}
                    </button>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center">Secure Al-Malik Payment Gateway Simulation</p>
                  </form>
                </>
              )
            )}
          </div>
        </div>
      )}

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
