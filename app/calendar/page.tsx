"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Trash2, X, Clock, User, Scissors, CheckCircle2 } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null); // Düzenleme/Silme için seçilen randevu
  const [selectedDateForModal, setSelectedDateForModal] = useState(new Date().toISOString().split('T')[0]);

  // HAFTALIK 7 GÜNLÜK BLOK HESAPLAMA (Pazartesi Başlangıçlı)
  const getWeekDates = (baseDate: Date) => {
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(diff + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentDate);

  useEffect(() => {
    fetchAppointments();
    const channel = supabase.channel('calendar-sync')
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

  const handleDayClick = (dateStr: string) => {
    setSelectedDateForModal(dateStr);
    setIsModalOpen(true);
  };

  const deleteAppointment = async (id: string) => {
    if (confirm("Bu randevuyu silmek ve veritabanından kaldırmak istiyor musunuz?")) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (!error) {
        setSelectedApp(null);
        fetchAppointments();
      }
    }
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 pb-24 md:pb-0">
        
        {/* ÜST NAVİGASYON (HAFTALIK KAYDIRMA) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
            {weekDates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-x border-slate-200">Bugün</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* 7 GÜNLÜK TEK EKRAN IZGARA (GRID) */}
        <div className="grid grid-cols-7 gap-1 h-full min-h-[500px]">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayApps = appointments.filter(a => a.appointment_date === dateStr);

            return (
              <div 
                key={index} 
                className={`flex flex-col border-r last:border-r-0 border-slate-100 relative ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
                onClick={(e) => e.target === e.currentTarget && handleDayClick(dateStr)}
              >
                {/* GÜN BAŞLIĞI */}
                <div className={`text-center py-3 border-b ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <p className="text-[8px] font-black uppercase tracking-tighter">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
                  <p className="text-sm font-black">{date.getDate()}</p>
                </div>

                {/* RANDEVULAR VE BOŞ ALAN */}
                <div className="flex-1 p-1 space-y-1 overflow-y-auto custom-scrollbar min-h-[300px]">
                  {dayApps.length > 0 ? (
                    dayApps.map(app => (
                      <div 
                        key={app.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                        className="bg-blue-100/50 border border-blue-200 p-2 rounded-xl cursor-pointer hover:bg-blue-200/50 transition-all"
                      >
                        <p className="text-[8px] font-black text-blue-700">{app.time}</p>
                        <p className="text-[9px] font-black text-slate-800 leading-tight uppercase truncate">{app.name.split(' ')[0]}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-20 pointer-events-none">
                       <Plus size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANDEVU YÖNETİM MODALI (DÜZENLE / SİL) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Randevu Detayı</h3>
              <button onClick={() => setSelectedApp(null)} className="p-2 bg-slate-100 rounded-xl text-slate-400"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                <User size={20} className="text-blue-600" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Müşteri</p>
                  <p className="font-black text-slate-800 uppercase">{selectedApp.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                <Clock size={20} className="text-blue-600" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Zaman</p>
                  <p className="font-black text-slate-800 uppercase">{selectedApp.time} | {selectedApp.appointment_date}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { alert("Düzenleme paneli yakında!"); }} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase italic">Düzenle</button>
              <button onClick={() => deleteAppointment(selectedApp.id)} className="flex-1 bg-red-50 text-red-600 font-black py-4 rounded-2xl text-xs uppercase italic flex items-center justify-center gap-2">
                <Trash2 size={16}/> SİL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ KAYIT MODALI */}
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
