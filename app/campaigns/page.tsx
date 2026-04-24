"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Sparkles, Send, Calendar, Users, Percent, MessageSquare, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function CampaignsPage() {
  const [emptyDays, setEmptyDays] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [discount, setDiscount] = useState('15');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    analyzeEmptyDays();
    fetchCustomers();
  }, []);

  // NEO: Önümüzdeki 7 günü tara ve boş olanları bul
  const analyzeEmptyDays = async () => {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return d.toISOString().split('T')[0];
    });

    const { data: apps } = await supabase
      .from('appointments')
      .select('appointment_date')
      .eq('business_slug', CURRENT_BUSINESS_SLUG)
      .in('appointment_date', next7Days);

    const busyDays = apps?.map(a => a.appointment_date) || [];
    const freeDays = next7Days.filter(day => !busyDays.includes(day));
    setEmptyDays(freeDays);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').eq('business_slug', CURRENT_BUSINESS_SLUG);
    if (data) setCustomers(data);
  };

  // MAX: SMS Gönderim Simülasyonu
  const sendCampaign = async () => {
    if (!selectedDay) return;
    setIsSending(true);
    
    // Burada ileride Netgsm veya Twilio gibi bir SMS API'si bağlanacak
    setTimeout(() => {
      alert(`🚀 BAŞARILI! ${customers.length} müşteriye "${selectedDay}" tarihi için %${discount} indirimli SMS kampanyası gönderildi.`);
      setIsSending(false);
      setSelectedDay(null);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* LUNA: ÜST BAŞLIK TASARIMI */}
        <div className="relative p-10 bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Sparkles size={200} className="text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Kampanya Radarı</h1>
            <p className="text-blue-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Yapay Zeka Destekli Doluluk Analizi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* SOL PANEL: BOŞ GÜNLER (POTANSİYEL) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3 px-4">
              <Calendar className="text-blue-600" size={20} />
              <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">Fırsat Günleri</h2>
            </div>
            
            <div className="space-y-3">
              {emptyDays.map(day => (
                <button 
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${selectedDay === day ? 'border-blue-600 bg-blue-50 shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                >
                  <div className="text-left">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedDay === day ? 'text-blue-600' : 'text-slate-400'}`}>Henüz Randevu Yok</p>
                    <p className="text-lg font-black text-slate-800">
                      {new Date(day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl transition-all ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-blue-400'}`}>
                    <Percent size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ PANEL: KAMPANYA SİHİRBAZI */}
          <div className="lg:col-span-2">
            {selectedDay ? (
              <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm sticky top-10 animate-in zoom-in-95 duration-500">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Kampanyayı Hazırla</h3>
                    <button onClick={() => setSelectedDay(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20}/></button>
                  </div>

                  {/* MAX: PAZARLAMA AYARLARI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">İndirim Oranı</label>
                      <div className="relative">
                        <input type="number" className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black text-2xl outline-none focus:ring-2 focus:ring-blue-600" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hedef Kitle</label>
                      <div className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black text-slate-800 flex items-center justify-between border border-blue-100">
                        <span>{customers.length} Müşteri</span>
                        <Users size={20} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* SMS ÖNİZLEME */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">SMS Önizleme</label>
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <MessageSquare size={100} />
                      </div>
                      <p className="text-lg leading-relaxed font-medium italic">
                        "Merhaba <span className="text-blue-400">[Müşteri Adı]</span>, Shram Events'te <span className="text-blue-400">{new Date(selectedDay).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span> gününe özel <span className="text-emerald-400">%{discount} indirim</span> fırsatını kaçırma! Hemen randevunu al: <span className="underline decoration-blue-500">rezervo.app/shram</span>"
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={sendCampaign}
                    disabled={isSending}
                    className="w-full bg-blue-600 hover:bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase italic text-xl shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:bg-slate-200"
                  >
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={24}/> KAMPANYAYI BAŞLAT</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] border-4 border-dashed border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center text-slate-300 p-10 text-center">
                <AlertCircle size={64} className="mb-6 opacity-20" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Analiz Bekleniyor</h3>
                <p className="max-w-xs font-bold text-sm mt-2">Sol taraftan boş bir gün seçerek o güne özel indirim bombasını hazırlayabilirsin patron!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const X = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;