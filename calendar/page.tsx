"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Edit, Trash2, X, Clock, User, Scissors, CheckCircle2 } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null); // Tıklanan randevuyu tutar

  // Seçili tarihe göre o haftanın 7 gününü hesaplar
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi başlangıç
    const d = new Date(start.setDate(diff));
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    fetchAppointments();
    const channel = supabase.channel('global-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments(); 
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentDate]);

  const fetchAppointments = async () => {
    const startStr = weekDates[0].toISOString().split('T')[0];
    const endStr = weekDates[6].toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr)
      .eq('business_slug', CURRENT_BUSINESS_SLUG);
      
    if (data) setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleDelete = async (id: string) => {
    if(confirm("Bu randevuyu kalıcı olarak silmek istediğinize emin misiniz?")) {
      await supabase.from('appointments').delete().eq('id', id);
      setSelectedApp(null);
      fetchAppointments();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full animate-in fade-in duration-500 pb-20 md:pb-0">
        
        {/* ÜST BAR: HAFTA NAVİGASYONU */}
        <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-white shadow-lg"><CalIcon size={20} /></div>
            <div>
              <h2 className="text-sm md:text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                {weekDates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Haftalık Görünüm</p>
            </div>
          </div>
          
          <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all active:scale-95"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 md:px-6 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-600 border-x border-slate-200 active:scale-95">Bugün</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all active:scale-95"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* PARMAKLA KAYDIRILABİLİR (SWIPE) 7 GÜNLÜK TAKVİM */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 custom-scrollbar">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayApps = appointments.filter(a => a.appointment_date === dateStr);
            const hasApps = dayApps.length > 0;

            return (
              <div key={index} className={`min-w-[280px] md:min-w-[320px] snap-center flex-shrink-0 flex flex-col rounded-[2.5rem] border-2 transition-all duration-300 ${hasApps ? 'bg-slate-50 border-blue-100' : 'bg-white border-slate-100'} ${isToday ? 'shadow-2xl shadow-blue-900/10' : 'shadow-sm'}`}>
                
                {/* GÜN BAŞLIĞI */}
                <div className={`p-5 rounded-t-[2.3rem] text-center border-b ${hasApps ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-50 text-slate-800 border-slate-200'} ${isToday && !hasApps ? 'bg-slate-900 text-white' : ''}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{date.toLocaleDateString('tr-TR', { weekday: 'long' })}</p>
                  <p className="text-3xl font-black mt-1 tracking-tighter">{date.getDate()}</p>
                </div>

                {/* İÇERİK (RANDEVULAR VEYA MÜSAİT GÜN) */}
                <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[50vh]">
                  {!hasApps ? (
                    <div className="flex flex-col items-center justify-center h-full text-emerald-500 py-10 opacity-80">
                      <CheckCircle2 size={48} className="mb-3 opacity-50" />
                      <p className="font-black uppercase tracking-widest text-sm">Müsait Gün</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Randevu Alınabilir</p>
                    </div>
                  ) : (
                    dayApps.map(app => (
                      <div 
                        key={app.id} 
                        onClick={() => setSelectedApp(app)}
                        className="bg-white border border-slate-200 p-4 rounded-[1.5rem] shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative"
                      >
                        <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                          <Edit size={16} />
                        </div>
                        <span className="inline-block bg-blue-50 text-blue-600 font-black text-xs px-3 py-1.5 rounded-xl mb-2">
                          {app.time}
                        </span>
                        <h4 className="font-black text-slate-800 uppercase tracking-tight leading-tight pr-6">{app.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                          <Scissors size={10}/> {app.service || 'Genel Hizmet'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DÜZENLE / SİL MODALI (Aşağıdan Kayarak Açılır) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center sm:p-4">
          <div className="bg-white w-full md:max-w-sm md:rounded-[2.5rem] rounded-t-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">İşlem Menüsü</h3>
              <button onClick={() => setSelectedApp(null)} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all"><X size={20}/></button>
            </div>

            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-200 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <User className="text-slate-400" size={18} />
                <span className="font-black text-slate-800 uppercase">{selectedApp.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-blue-500" size={18} />
                <span className="font-black text-slate-600">{selectedApp.appointment_date} | {selectedApp.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <Scissors className="text-slate-400" size={18} />
                <span className="font-black text-slate-600 text-sm uppercase">{selectedApp.service}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Gelecek Güncelleme: Düzenleme formu buraya bağlanabilir */}
              <button onClick={() => { alert("Düzenleme özelliği yakında aktif edilecek."); setSelectedApp(null); }} className="w-full bg-slate-100 text-slate-600 font-black text-xs uppercase italic py-4 rounded-2xl hover:bg-slate-200 transition-all flex justify-center items-center gap-2">
                <Edit size={16}/> Düzenle
              </button>
              
              <button onClick={() => handleDelete(selectedApp.id)} className="w-full bg-red-50 text-red-600 font-black text-xs uppercase italic py-4 rounded-2xl hover:bg-red-100 transition-all flex justify-center items-center gap-2">
                <Trash2 size={16}/> İptal Et & Sil
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}