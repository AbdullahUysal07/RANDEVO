"use client";

import React from 'react';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const HOURS = Array.from({ length: 11 }, (_, i) => `${i + 9}:00`);

export default function WeeklyCalendar({ appointments }: { appointments: any[] }) {
  // Saati piksel değerine çeviren Neo'nun sihirli formülü
  const calculateTop = (timeStr: string) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const startHour = 9; // Takvim 09:00'da başlıyor
    return (hour - startHour) * 80 + (minute / 60) * 80;
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-800/30">
        <div className="p-4 border-r border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">SAAT</div>
        {DAYS.map((day) => (
          <div key={day} className="p-4 text-center text-xs font-black text-slate-400 uppercase italic tracking-tighter">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-8 h-[600px] overflow-y-auto relative">
        {/* Saat Sütunu */}
        <div className="col-span-1 border-r border-slate-800 bg-slate-900/50">
          {HOURS.map((hour) => (
            <div key={hour} className="h-20 border-b border-slate-800/30 p-2 text-[10px] text-slate-600 text-right pr-4 font-mono font-bold leading-none">{hour}</div>
          ))}
        </div>

        {/* Gün Sütunları ve Randevular */}
        {DAYS.map((_, dayIndex) => (
          <div key={dayIndex} className="col-span-1 border-r border-slate-800/20 relative group">
            {/* Arka Plan Çizgileri */}
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b border-slate-800/10 group-hover:bg-blue-500/[0.02] transition-colors" />
            ))}

            {/* Bu güne ait randevuları filtrele ve çiz */}
           {appointments.filter(app => (app.day_index === dayIndex || app.dayIndex === dayIndex)).map((app) => (
  <div 
    key={app.id} 
    className="absolute left-1 right-1 bg-blue-600/20 border-l-4 border-blue-500 p-2 rounded-r-xl backdrop-blur-md cursor-pointer hover:bg-blue-600/30 transition-all shadow-lg z-10"
    style={{ top: `${calculateTop(app.time)}px`, height: '75px' }}
  >
    <p className="text-[9px] font-black text-blue-400 uppercase">{app.time}</p>
    <p className="text-[11px] font-black text-white truncate leading-tight uppercase tracking-tight">{app.name}</p>
    <p className="text-[9px] text-slate-500 font-bold italic">{app.service}</p>
  </div>
))}
          </div>
        ))}
      </div>
    </div>
  );
}