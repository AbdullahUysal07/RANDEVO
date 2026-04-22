"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Trash2, Clock } from 'lucide-react';

const WORKING_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [prefilledData, setPrefilledData] = useState({ time: '09:00', dayIndex: 0 });

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
    
    // BİLDİRİM SİSTEMİ (EN GÜÇLÜ HALİ)
    const channel = supabase.channel('global-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        console.log("Yeni Hareket!", payload);
        fetchAppointments(); // Bildirim sesi yerine ekranı anında tazeler
      })
      .subscribe((status) => {
        console.log("Bağlantı Durumu:", status);
      });

    return () => { supabase.removeChannel(channel); };
  }, [currentDate]);

  const fetchAppointments = async () => {
    const startStr = weekDates[0].toISOString().split('T')[0];
    const endStr = weekDates[6].toISOString().split('T')[0];
    const { data } = await supabase.from('appointments').select('*').gte('appointment_date', startStr).lte('appointment_date', endStr);
    if (data) setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* ÜST NAVİGASYON */}
        <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><CalIcon size={24} /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                {weekDates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em] mt-1">Sistem Aktif</p>
            </div>
          </div>
          <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2.5 hover:bg-white rounded-xl text-slate-400 transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-6 text-[11px] font-black uppercase tracking-widest text-slate-600 border-x border-slate-200">Bugün</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2.5 hover:bg-white rounded-xl text-slate-400 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* TAKVİM IZGARASI */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div key={index} className="space-y-4">
                <div className={`p-5 text-center rounded-[2rem] border transition-all ${isToday ? 'bg-blue-600 text-white shadow-xl' : 'bg-white border-slate-100'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
                  <p className="text-xl font-black mt-1">{date.getDate()}</p>
                </div>

                <div className="space-y-3">
                  {WORKING_HOURS.map((hour) => {
                    const app = appointments.find(a => a.appointment_date === dateStr && a.time.startsWith(hour.split(':')[0]));

                    return (
                      <div 
                        key={hour} 
                        onClick={() => !app && (setPrefilledData({time: hour, dayIndex: index}), setIsModalOpen(true))}
                        className={`min-h-[110px] rounded-[2rem] border transition-all p-4 flex flex-col justify-center relative group ${
                          app 
                          ? `bg-blue-50 border-blue-200 shadow-sm` // OVERFLOW-HIDDEN KALDIRILDI
                          : 'bg-slate-200/30 border-slate-200/50 border-dashed hover:bg-blue-50/50 cursor-pointer'
                        }`}
                      >
                        {app ? (
                          <div className="animate-in fade-in zoom-in">
                            <button 
                              onClick={async (e) => { e.stopPropagation(); if(confirm("Silinsin mi?")) { await supabase.from('appointments').delete().eq('id', app.id); fetchAppointments(); } }}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-xl border border-red-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50"
                            >
                              <Trash2 size={14} />
                            </button>
                            <span className="text-[10px] font-black text-blue-600 block mb-1 uppercase italic">{app.time}</span>
                            <p className="font-black text-[12px] leading-tight uppercase tracking-tighter text-slate-900">{app.name}</p>
                            <p className="text-[8px] font-bold mt-1.5 opacity-50 italic uppercase">{app.service}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-1 opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-[10px] font-black text-slate-400 italic">{hour}</span>
                            <Plus size={14} className="text-blue-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialTime={prefilledData.time}
        initialDayIndex={prefilledData.dayIndex}
        onSave={async (newApp: any) => {
          await supabase.from('appointments').insert([{ ...newApp, appointment_date: weekDates[newApp.dayIndex].toISOString().split('T')[0] }]);
          await supabase.from('customers').insert([{ name: newApp.name, phone: newApp.phone }]).onConflict('phone').ignore();
          setIsModalOpen(false); fetchAppointments();
        }} 
      />
    </DashboardLayout>
  );
}