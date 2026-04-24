"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Scissors, User, Phone, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// Neo: Params tipini ve kullanımını garantiye alıyoruz
export default function CustomerBookingPage({ params }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // LUNA: Sayfa açıldığında slug'ı çöz ve hizmetleri getir
  useEffect(() => {
    const init = async () => {
      try {
        // Next.js params bazen promise döner, bu yüzden bekliyoruz veya güvenli alıyoruz
        const resolvedParams = await params;
        const slug = resolvedParams?.slug || 'shram-events';
        await fetchServices(slug);
      } catch (err) {
        setErrorMsg("Bağlantı kurulurken bir hata oluştu.");
        setLoading(false);
      }
    };
    init();
  }, [params]);

  const fetchServices = async (slug: string) => {
    try {
      setLoading(true);
      // Neo: Slug temizleme (köşeli parantez vb. hatalara karşı)
      const cleanSlug = slug.replace('[', '').replace(']', '').toLowerCase();
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_slug', cleanSlug);

      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      console.error("Fetch Hatası:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    
    try {
      const resolvedParams = await params;
      const cleanSlug = (resolvedParams?.slug || 'shram-events').replace('[', '').replace(']', '');

      // 1. Randevuyu Kaydet
      const { error: appError } = await supabase.from('appointments').insert([{
        name: formData.name,
        phone: formData.phone,
        service: formData.service,
        appointment_date: formData.date,
        time: formData.time,
        business_slug: cleanSlug
      }]);

      // 2. Müşteriyi CRM'e Kaydet
      await supabase.from('customers').upsert({
        name: formData.name,
        phone: formData.phone,
        business_slug: cleanSlug
      }, { onConflict: 'phone, business_slug' });

      if (appError) throw appError;
      setIsSuccess(true);
    } catch (err: any) {
      alert("Randevu kaydedilemedi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Veriler Yükleniyor...</p>
      </div>
    </div>
  );

  if (isSuccess) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-50">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
        <CheckCircle2 size={48} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Onaylandı!</h1>
      <p className="text-slate-500 font-bold max-w-xs uppercase text-[10px] tracking-widest">Shram Events Randevun Kaydedildi.</p>
      <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-[10px] shadow-2xl">Başa Dön</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white p-8 border-b border-slate-100 flex flex-col items-center shadow-sm sticky top-0 z-50">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg mb-2">S</div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Shram Events</h2>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* STEP 1: HİZMET SEÇİMİ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter text-center">Hizmet Seçiniz</h3>
            
            {services.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-loose">
                  {errorMsg ? `Hata: ${errorMsg}` : "Bu işletmeye ait henüz bir hizmet bulunamadı."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((s) => (
                  <button 
                    key={s.id} 
                    onClick={() => { setFormData({...formData, service: s.name}); setStep(2); }}
                    className="w-full bg-white p-6 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 transition-all flex items-center justify-between shadow-sm active:scale-95 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-slate-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Scissors size={20} /></div>
                      <div className="text-left">
                        <p className="font-black text-slate-800 uppercase italic tracking-tighter">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.duration} Dakika</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 font-black text-blue-600 text-[9px] uppercase italic">Fiyat Alın</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: ZAMAN SEÇİMİ */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Zaman Seçin</h3>
              <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 underline uppercase">Geri</button>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-6">
              <input type="date" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black outline-none border-2 border-transparent focus:border-blue-500" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              <div className="grid grid-cols-3 gap-2">
                {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                  <button key={t} onClick={() => setFormData({...formData, time: t})} className={`p-4 rounded-2xl font-black text-[10px] transition-all ${formData.time === t ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{t}</button>
                ))}
              </div>
              <button disabled={!formData.time} onClick={() => setStep(3)} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase italic shadow-2xl active:scale-95 disabled:bg-slate-200">Devam Et</button>
            </div>
          </div>
        )}

        {/* STEP 3: İLETİŞİM */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Bilgiler</h3>
              <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-400 underline uppercase">Geri</button>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-4">
              <input type="text" placeholder="Adınız Soyadınız" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="tel" placeholder="Telefon Numaranız" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <button 
                onClick={handleBooking} 
                disabled={isSubmitting || !formData.name || !formData.phone} 
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Randevuyu Onayla <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
