"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, X, Clock, CheckCircle2, ChevronDown } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState(new Date().toISOString().split('T')[0]);

  // HAFTALIK GÜNLERİ HESAPLA (7 Günlük Blok)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
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

  // AY SEÇİMİ İŞLEMİ
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
    setIsMonthPickerOpen(false);
  };

  const openNewAppointment = (dateStr: string) => {
    setSelectedDateForModal(dateStr);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="flex flex-col h-full animate-in fade-in duration-500 pb-20 md:pb-0 relative">
        
        {/* ÜST BAR: AY SEÇİCİ VE NAVİGASYON */}
        <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mb-6">
          <div className="relative">
            <button 
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="flex items-center space-x-2 bg-slate-50 px-5 py-3 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 border border-slate-100"
            >
              <span className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">
                {weekDates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </span>
              <ChevronDown size={18} className={`text-blue-600 transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* AY SEÇME MENÜSÜ (DROPDOWN) */}
            {isMonthPickerOpen && (
              <div className="absolute top-16 left-0 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-[60] p-4 grid grid-cols-2 gap-2 animate-in zoom-in-95">
                {Array.from({ length: 12 }, (_, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleMonthSelect(i)}
                    className="py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                  >
                    {new Date(0, i).toLocaleDateString('tr-TR', { month: 'long' })}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-3 hover:bg-white rounded-xl text-blue-600 transition-all active:scale-90"><ChevronLeft size={22} /></button>
            <div className="px-4 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-x border-slate-200">Hafta</div>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-3 hover:bg-white rounded-xl text-blue-600 transition-all active:scale-90"><ChevronRight size={22} /></button>
          </div>
        </div>

        {/* HAFTALIK KAYDIRILABİLİR ALAN */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-10 custom-scrollbar p-2">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayApps = appointments.filter(a => a.appointment_date === dateStr);

            return (
              <div key={index} className={`min-w-[300px] md:min-w-[350px] snap-center flex-shrink-0 flex flex-col rounded-[3rem] border-2 transition-all duration-500 ${isToday ? 'border-blue-500 shadow-2xl shadow-blue-100' : 'border-slate-100 bg-white'}`}>
                
                {/* GÜN BAŞLIĞI */}
                <div className={`p-6 text-center border-b rounded-t-[2.8rem] ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-800'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">{date.toLocaleDateString('tr-TR', { weekday: 'long' })}</p>
                  <p className="text-4xl font-black mt-1 tracking-tighter">{date.getDate()}</p>
                </div>

                {/* İÇERİK: TIKLAYINCA RANDEVU OLUŞTURUR */}
                <div 
                  className="p-4 flex-1 flex flex-col gap-3 min-h-[400px] cursor-pointer"
                  onClick={(e) => { if(e.target === e.currentTarget) openNewAppointment(dateStr); }}
                >
                  {dayApps.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-emerald-500/40 group hover:text-emerald-500 transition-all">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3">
                        <Plus size={32} />
                      </div>
                      <p className="font-black uppercase tracking-widest text-xs">Müsait Gün</p>
                      <p className="text-[9px] font-bold mt-1 uppercase">Kayıt için dokun</p>
                    </div>
                  ) : (
                    dayApps.map(app => (
                      <div key={app.id} className="bg-slate-50 border border-slate-100 p-4 rounded-[1.8rem] shadow-sm flex flex-col relative group hover:border-blue-300 transition-all">
                        <span className="text-[10px] font-black text-blue-600 mb-1">{app.time}</span>
                        <h4 className="font-black text-slate-800 uppercase text-sm leading-tight">{app.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">{app.service}</p>
                        <CheckCircle2 size={14} className="absolute top-4 right-4 text-emerald-500 opacity-50" />
                      </div>
                    ))
                  )}
                  
                  {/* GÜNÜN ALTINA EKLEME BUTONU */}
                  {dayApps.length > 0 && (
                    <button 
                      onClick={() => openNewAppointment(dateStr)}
                      className="mt-auto w-full py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-slate-300 hover:text-blue-500 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16}/> <span className="text-[10px] font-black uppercase">Ekle</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDateForModal}
        onSave={async (newApp: any) => {
          await supabase.from('appointments').insert([{ 
            ...newApp, 
            appointment_date: newApp.date || selectedDateForModal, 
            business_slug: CURRENT_BUSINESS_SLUG 
          }]);
          setIsModalOpen(false); 
          fetchAppointments();
        }} 
      />
    </DashboardLayout>
  );
}
