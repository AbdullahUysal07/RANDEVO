"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { MessageSquare, Zap, Target, Send, Percent, Sparkles } from 'lucide-react';

export default function MarketingPage() {
  const [emptySlots, setEmptySlots] = useState<any[]>([]);
  const [campaignText, setCampaignText] = useState("Antalya'nın en prestijli etkinlikleri için bu Salı boşuz! Sana özel %25 indirim tanımladık. Hemen randevunu al: rezer.vo/shram");

  useEffect(() => {
    const findGaps = async () => {
      const { data } = await supabase.from('appointments').select('appointment_date');
      const counts: any = {};
      data?.forEach(d => counts[d.appointment_date] = (counts[d.appointment_date] || 0) + 1);
      
      const gaps = [];
      for(let i=1; i<=7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        if ((counts[dateStr] || 0) < 3) gaps.push(dateStr);
      }
      setEmptySlots(gaps);
    };
    findGaps();
  }, []);

  return (
    <DashboardLayout onOpenModal={() => {}}>
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Akıllı Pazarlama</h1>
            <p className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mt-2">Max'in Büyüme Stratejileri</p>
          </div>
          <div className="bg-blue-600 text-white px-6 py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 animate-pulse">
            <Zap size={14} /> Canlı Analiz Aktif
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Max'in Fırsat Radarı */}
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <h3 className="text-lg font-black text-slate-800 mb-8 uppercase italic flex items-center gap-3"><Target className="text-blue-600" /> Fırsat Radarı</h3>
            <div className="space-y-4">
              {emptySlots.map(date => (
                <div key={date} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase">{new Date(date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Düşük Yoğunluk Tespit Edildi</p>
                  </div>
                  <button onClick={() => setCampaignText(`Shram Events'te bu ${new Date(date).toLocaleDateString('tr-TR', { weekday: 'long' })} gününe özel fırsatı kaçırma! %30 indirim seni bekliyor.`)} 
                    className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm hover:bg-blue-600 hover:text-white transition-all transform hover:rotate-12">
                    <Sparkles size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Paneli */}
          <div className="flex flex-col space-y-6">
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-200">
               <h3 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3"><MessageSquare className="text-blue-400" /> Kampanya Taslağı</h3>
               <textarea value={campaignText} onChange={(e) => setCampaignText(e.target.value)} className="w-full h-44 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm font-medium outline-none focus:border-blue-500 transition-all resize-none" />
               <div className="mt-8 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kayıtlı Portföy</p>
                    <p className="text-xl font-black text-white">482 Müşteri</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-blue-900/40 transition-all active:scale-95">
                    <Send size={16} /> SMS GÖNDER
                  </button>
               </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Percent size={24} /></div>
               <div>
                  <p className="font-black text-emerald-800 text-xs uppercase tracking-tighter italic">Potansiyel Kazanç Artışı</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Max'in stratejisiyle boşlukları doldurmak ciroyu %40 arttırabilir.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}