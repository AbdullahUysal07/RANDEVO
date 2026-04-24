"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, BarChart3, Settings, LayoutDashboard, Plus } from 'lucide-react';

export default function DashboardLayout({ children, onOpenModal }: any) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* MASAÜSTÜ SIDEBAR (Mobilde Gizli) */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-6 z-50 shadow-xl">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl text-white italic shadow-lg shadow-blue-100">S</div>
          <div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic leading-none block">Rezervo</span>
            <p className="text-[8px] text-blue-600 font-black tracking-[0.4em] uppercase">Shram Events Hub</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <MenuLink href="/" icon={<LayoutDashboard size={20} />} label="Özet" active={pathname === '/'} />
          <MenuLink href="/calendar" icon={<Calendar size={20} />} label="Takvim" active={pathname === '/calendar'} />
          <MenuLink href="/finance" icon={<BarChart3 size={20} />} label="Finans" active={pathname === '/finance'} />
          <MenuLink href="/customers" icon={<Users size={20} />} label="Müşteriler" active={pathname === '/customers'} />
          <MenuLink href="/settings" icon={<Settings size={20} />} label="Ayarlar" active={pathname === '/settings'} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden w-full pb-20 md:pb-0">
        
        {/* MASAÜSTÜ ÜST BİLGİ VE BUTON */}
        <header className="hidden md:flex h-20 border-b border-slate-200 items-center justify-between px-8 bg-white/80 backdrop-blur-xl z-30">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Yönetim Paneli</h2>
          <button onClick={onOpenModal} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase italic transition-all active:scale-95 shadow-xl shadow-blue-200 hover:bg-blue-700">
            + YENİ RANDEVU
          </button>
        </header>

        {/* ANA İÇERİK ALANI */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50 custom-scrollbar">{children}</div>

        {/* MOBİL: FAB (Uçan Hızlı İşlem Butonu) */}
        <button 
          onClick={onOpenModal}
          className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] z-50 transition-transform active:scale-90"
        >
          <Plus size={28} />
        </button>

        {/* MOBİL: ALT NAVİGASYON (Bottom Tab Bar) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-20 pb-4 px-2 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <BottomTab href="/" icon={<LayoutDashboard size={22} />} label="Özet" active={pathname === '/'} />
          <BottomTab href="/calendar" icon={<Calendar size={22} />} label="Takvim" active={pathname === '/calendar'} />
          <BottomTab href="/finance" icon={<BarChart3 size={22} />} label="Finans" active={pathname === '/finance'} />
          <BottomTab href="/customers" icon={<Users size={22} />} label="Müşteri" active={pathname === '/customers'} />
        </nav>

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

function BottomTab({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
    </Link>
  );
}
