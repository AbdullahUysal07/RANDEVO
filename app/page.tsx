"use client";

import DashboardLayout from '@/components/DashboardLayout';
import ServiceSettings from '@/components/ServiceSettings'; // Az önce oluşturduğumuz bileşen
import { Settings, Bell, Lock, Globe, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* AYARLAR ÜST BAŞLIK */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10"><Settings size={200} /></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">İşletme Ayarları</h1>
            <p className="text-slate-400 font-bold text-sm mt-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> 
              Sistem Tercihlerini ve Hizmetlerini Buradan Yönet
            </p>
          </div>
        </div>

        {/* LUNA'NIN ÖZEL DOKUNUŞU: HİZMET YÖNETİMİ ALANI */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Hizmet Menüsü Yapılandırması</h2>
          </div>
          
          {/* İŞTE O BİLEŞENİ BURAYA YERLEŞTİRDİK */}
          <ServiceSettings />
        </section>

        {/* DİĞER AYARLAR (GELECEKTEKİ GÜNCELLEMELER İÇİN TASLAK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 cursor-not-allowed">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl"><Bell size={20}/></div>
              <span className="font-black text-slate-800 uppercase italic">Bildirim Ayarları</span>
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase">Yakında</span>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl"><Lock size={20}/></div>
              <span className="font-black text-slate-800 uppercase italic">Güvenlik & Şifre</span>
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase">Yakında</span>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
