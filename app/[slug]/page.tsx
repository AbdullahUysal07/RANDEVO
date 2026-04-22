"use client";

import React, { use, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, CheckCircle2, User, ChevronRight, Banknote, Calendar as CalendarIcon, Phone } from 'lucide-react';

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const businessName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [step, setStep] = useState(1); 
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', time: '09:00', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*').order('name');
      if (data) setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  const handleBooking = async () => {
    if (!formData.name || !formData.phone) return alert("Lütfen adınızı ve telefon numaranızı girin!");
    
    const { error } = await supabase.from('appointments').insert([{ 
      name: formData.name, 
      phone: formData.phone,
      service: selectedService.name, 
      time: formData.time,
      appointment_date: formData.date,
      day_index: new Date(formData.date).getDay() - 1 
    }]);

    if (!error) setStep(3);
    else alert("Hata oluştu, lütfen tekrar deneyin.");
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
        
        {step === 1 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">{businessName}</h1>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">Hizmet Seçimi</p>
            </div>
            <div className="space-y-4">
              {services.map((s) => (
                <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full p-6 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 rounded-[2rem] text-left transition-all group flex justify-between items-center hover:shadow-lg hover:shadow-blue-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-black italic">S</div>
                    <div><p className="font-bold text-slate-800">{s.name}</p><p className="text-xs text-emerald-600 font-black">₺{s.price}</p></div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center"><h2 className="text-2xl font-black uppercase italic">{selectedService.name}</h2><p className="text-slate-400 text-xs font-bold mt-1 tracking-widest">Rezervasyon Tamamla</p></div>
            <div className="space-y-4">
              <div className="relative"><CalendarIcon className="absolute left-4 top-4 text-blue-500" size={18} /><input type="date" value={formData.date} min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-600 font-bold" onChange={(e) => setFormData({...formData, date: e.target.value})} /></div>
              <div className="relative"><User className="absolute left-4 top-4 text-slate-300" size={18} /><input placeholder="Adınız Soyadınız" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-600 font-bold" onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
              <div className="relative"><Phone className="absolute left-4 top-4 text-slate-300" size={18} /><input placeholder="Telefon Numaranız (5xx...)" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-600 font-bold" onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-blue-600"><Clock size={18} className="text-blue-500" /><input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="bg-transparent outline-none w-full font-bold" /></div>
              <button onClick={handleBooking} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">Randevuyu Onayla</button>
              <button onClick={() => setStep(1)} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900">Vazgeç</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-50"><CheckCircle2 size={64} /></div>
            <div><h2 className="text-3xl font-black uppercase italic tracking-tighter">İşlem Tamam!</h2><p className="text-slate-400 text-sm mt-2 font-medium px-6">Randevun başarıyla alındı. SMS ile bilgilendirme yapılacaktır.</p></div>
            <div className="pt-6 border-t border-slate-50"><p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">Powered by Shram Events</p></div>
          </div>
        )}
      </div>
    </div>
  );
}