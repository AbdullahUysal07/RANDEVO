"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, BarChart3, Settings, Zap, Megaphone, ShieldCheck, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children, onOpenModal }: any) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* MOBİL ARKA PLAN KARARTMASI */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Mobilde Yandan Açılır, Masaüstünde Sabit) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* MOBİL İÇİN KAPATMA BUTONU */}
        <button 
          className="absolute top-6 right-6 md:hidden text-slate-400 hover:text-slate-900"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} />
        </button>

        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl text-white italic shadow-lg shadow-blue-100">S</div>
          <div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic leading-none block">Rezervo</span>
            <p className="text-[8px] text-blue-600 font-black tracking-[0.4em] uppercase">Shram Events Hub</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <MenuLink href="/" icon={<Calendar size={20} />} label="Takvim" active={pathname === '/'} onClick={() => setIsSidebarOpen(false)} />
          <MenuLink href="/finance" icon={<BarChart3 size={20} />} label="Finans" active={pathname === '/finance'} onClick={() => setIsSidebarOpen(false)} />
          <MenuLink href="/marketing" icon={<Zap size={20} />} label="Pazarlama" active={pathname === '/marketing'} onClick={() => setIsSidebarOpen(false)} />
          <MenuLink href="/customers" icon={<Users size={20} />} label="Müşteriler" active={pathname === '/customers'} onClick={() => setIsSidebarOpen(false)} />
          <MenuLink href="/settings" icon={<Settings size={20} />} label="Ayarlar" active={pathname === '/settings'} onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="mt-auto bg-slate-50 border border-slate-200 p-4 rounded-3xl text-[10px] font-bold text-slate-500 italic">
          <div className="flex items-center gap-2 text-emerald-600 mb-1"><ShieldCheck size={14}/> SİSTEM AKTİF</div>
          Antalya Ofis Güvenli Bağlantı.
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-xl z-30">
          <div className="flex items-center space-x-3">
            {/* MOBİL HAMBURGER BUTONU */}
            <button 
              className="md:hidden p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2 text-slate-400">
              <Megaphone size={14} className="text-blue-500 hidden sm:block" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] hidden sm:block">Shram Management</h2>
            </div>
          </div>
          <button onClick={onOpenModal} className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase italic transition-all active:scale-95 shadow-xl shadow-slate-200">
            + HIZLI KAYIT
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50">{children}</div>
      </main>
    </div>
  );
}

function MenuLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick}>
      <div className={`flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
        {icon}<span className="font-black text-[13px] italic uppercase">{label}</span>
      </div>
    </Link>
  );
}
