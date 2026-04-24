"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Scissors, User, Phone, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

export default function CustomerBookingPage({ params }: { params: { slug: string } }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Hizmet, 2: Zaman, 3: İletişim
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // LUNA: Sayfa yüklendiğinde hizmetleri getir
  useEffect(() => {
    if (params.slug) {
      fetchServices();
    }
  }, [params.slug]);

  // NEO: Zırhlı Hizmet Getirme Fonksiyonu
  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_slug', params.slug);

      if (error) throw error;
      
      if (data) {
        setServices(data);
      }
    } catch (err) {
      console.error("Hizmetler yüklenirken hata oluştu:", err);
    } finally {
      setLoading(false);
    }
  };

  // MAX: Randevu Kayıt ve CRM Entegrasyonu
  const handleBooking = async () => {
    setIsSubmitting(true);
    
    // 1. Randevuyu Kaydet
    const { error: appError } = await supabase.from('appointments').insert([{
      name: formData.name,
      phone: formData.phone,
      service: formData.service,
      appointment_date: formData.date, // Veritabanındaki sütun adıyla tam eşleşme
      time: formData.time,
      business_slug: params.slug
    }]);

    // 2. Müşteriyi CRM'e Kaydet (Upsert)
    const { error: custError } = await supabase.from('customers').upsert({
      name: formData.name,
      phone: formData.phone,
      business_slug: params.slug
    }, { onConflict: 'phone, business_slug' });

    if (!appError && !custError) {
      setIsSuccess(true);
    } else {
      alert("Bir pürüz çıktı, lütfen tekrar deneyin.");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (isSuccess) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-50">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
        <CheckCircle2 size={48} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Randevun Alındı!</h1>
      <p className="text-slate-500 font-bold max-w-xs uppercase text-[10px] tracking-widest">
        Harika! Talebin Shram Events paneline düştü. Görüşmek üzere patron!
      </p>
      <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-2xl transition-all active:scale-95">
        Başa Dön
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white p-8 border-b border-slate-100 flex flex-col items-center shadow-sm sticky top-0 z-50">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg mb-2">S</div>
        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Shram Events</h2>
        <div className="h-1 w-8 bg-blue-600 rounded-full mt-1"></div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* PROGRESS */}
        <div className="flex justify-between items-center px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          ))}
        </div>

        {/* STEP 1: HİZMET SEÇİMİ */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter italic">Hizmet Seçin</h3>
            <div className="space-y-4">
              {services.length > 0 ? (
                services.map((s) => (
                  <button 
                    key={s.id} 
                    onClick={() => { setFormData({...formData, service: s.name}); setStep(2); }}
                    className="w-full bg-white p-6 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 transition-all flex items-center justify-between shadow-sm group active:scale-95"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-slate-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <Scissors size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-800 uppercase italic tracking-tighter">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.duration} Dk</p>
                      </div>
                    </div>
                    {/* PATRON: Fiyat gizleme alanı */}
                    <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                      <span className="text-[10px] font-black text-blue-600 uppercase italic tracking-tighter">Fiyat Alın</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Henüz hizmet eklenmemiş patron!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: TARİH VE SAAT */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Zaman Seçin</h3>
              <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 underline uppercase">Geri</button>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-6">
              <input type="date" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black outline-none border-2 border-transparent focus:border-blue-500 shadow-inner" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              <div className="grid grid-cols-3 gap-3">
                {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                  <button key={t} onClick={() => setFormData({...formData, time: t})} className={`p-4 rounded-2xl font-black text-xs transition-all ${formData.time === t ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{t}</button>
                ))}
              </div>
              <button disabled={!formData.time} onClick={() => setStep(3)} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase italic shadow-2xl disabled:bg-slate-200">Devam Et</button>
            </div>
          </div>
        )}

        {/* STEP 3: İLETİŞİM */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Bilgiler</h3>
              <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-400 underline uppercase">Geri</button>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-4">
              <input type="text" placeholder="Adınız Soyadınız" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black outline-none shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="tel" placeholder="Telefon Numaranız" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black outline-none shadow-inner" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <button 
                onClick={handleBooking}
                disabled={isSubmitting || !formData.name || !formData.phone}
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-slate-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Onayla ve Bitir <ChevronRight size={20}/></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
