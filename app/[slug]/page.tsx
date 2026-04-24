"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Phone, User, CheckCircle2, Scissors, Car } from 'lucide-react';

// Bu sayfa: rezervo.app/kuafor-ahmet veya rezervo.app/oto-yikama gibi linklerde açılır.
export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const [businessName, setBusinessName] = useState('Yükleniyor...');
  const [formData, setFormData] = useState({ name: '', phone: '', time: '', date: '', service: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // İşletme adına göre tema ikonları (Kuaförse makas, yıkamacıysa araba vb. Luna'nın detayı)
  const isCarWash = params.slug.includes('yikama') || params.slug.includes('oto');

  useEffect(() => {
    // URL'deki slug'ı (kuafor-ahmet) güzel bir isme çevirir
    const formattedName = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    setBusinessName(formattedName);
  }, [params.slug]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Veritabanına doğrudan kayıt (İşletme ID'si ile eşleşecek şekilde ayarlanacak)
    await supabase.from('appointments').insert([{ 
      name: formData.name, 
      phone: formData.phone, 
      time: formData.time, 
      appointment_date: formData.date,
      service: formData.service,
      business_slug: params.slug // Hangi işletmeye ait olduğu
    }]);

    await supabase.from('customers').insert([{ 
      name: formData.name, 
      phone: formData.phone,
      business_slug: params.slug
    }]).onConflict('phone').ignore();

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-700 max-w-sm w-full">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Randevunuz Alındı!</h2>
          <p className="text-slate-400 text-sm font-bold">Size SMS ile onay mesajı göndereceğiz. Bizi tercih ettiğiniz için teşekkürler.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6">
      
      {/* İŞLETME VİTRİNİ */}
      <div className="w-full max-w-md text-center mb-10 animate-in slide-in-from-top-10 duration-500">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] rotate-3">
          {isCarWash ? <Car size={40} className="text-white" /> : <Scissors size={40} className="text-white" />}
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">{businessName}</h1>
        <p className="text-blue-400 font-bold text-sm tracking-widest uppercase mt-2">Hızlı Randevu Sistemi</p>
      </div>

      {/* RANDEVU FORMU */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-700 delay-150 space-y-5">
        
        <div>
          <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><User size={14}/> <span>Ad Soyad</span></label>
          <input required type="text" className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" placeholder="Adınız Soyadınız" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Phone size={14}/> <span>Telefon Numarası</span></label>
          <input required type="tel" maxLength={11} className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" placeholder="05XX XXX XX XX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Calendar size={14}/> <span>Tarih</span></label>
            <input required type="date" className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Clock size={14}/> <span>Saat</span></label>
            <input required type="time" className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Scissors size={14}/> <span>İstenilen Hizmet</span></label>
          <input required type="text" className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" placeholder="Örn: İç-Dış Yıkama veya Saç Kesimi" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-black text-sm uppercase italic py-5 rounded-2xl mt-4 hover:bg-blue-500 transition-all active:scale-95 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.6)]">
          Randevuyu Onayla
        </button>

      </form>
      
      <p className="text-[10px] text-slate-600 mt-8 font-black uppercase tracking-widest">Powered by Rezervo App</p>
    </div>
  );
}
