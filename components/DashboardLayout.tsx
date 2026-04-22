"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, BarChart3, Settings, Zap, Megaphone, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children, onOpenModal }: any) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 relative">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl text-white italic shadow-lg shadow-blue-100">S</div>
          <div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic leading-none block">Rezervo</span>
            <p className="text-[8px] text-blue-600 font-black tracking-[0.4em] uppercase">Shram Events Hub</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {/* LİNKLERİN BAŞINDAKİ '/' ÇOK ÖNEMLİ */}
          <MenuLink href="/" icon={<Calendar size={20} />} label="Takvim" active={pathname === '/'} />
          <MenuLink href="/finance" icon={<BarChart3 size={20} />} label="Finans" active={pathname === '/finance'} />
          <MenuLink href="/marketing" icon={<Zap size={20} />} label="Pazarlama" active={pathname === '/marketing'} />
          <MenuLink href="/customers" icon={<Users size={20} />} label="Müşteriler" active={pathname === '/customers'} />
          <MenuLink href="/settings" icon={<Settings size={20} />} label="Ayarlar" active={pathname === '/settings'} />
        </nav>

        <div className="mt-auto bg-slate-50 border border-slate-200 p-4 rounded-3xl text-[10px] font-bold text-slate-500 italic">
          <div className="flex items-center gap-2 text-emerald-600 mb-1"><ShieldCheck size={14}/> SİSTEM AKTİF</div>
          Antalya Ofis Güvenli Bağlantı.
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl z-30">
          <div className="flex items-center space-x-2 text-slate-400">
            <Megaphone size={14} className="text-blue-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Shram Management</h2>
          </div>
          <button onClick={onOpenModal} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase italic transition-all active:scale-95 shadow-xl shadow-slate-200">
            + HIZLI KAYIT
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50">{children}</div>
      </main>
    </div>
  );
}

function MenuLink({ href, icon, label, active }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
        {icon}<span className="font-black text-[13px] italic uppercase">{label}</span>
      </div>
    </Link>
  );
}