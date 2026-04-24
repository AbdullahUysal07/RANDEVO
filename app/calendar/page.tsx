"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, User, Scissors, AlertCircle } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';
// Mesai saatleri: 09:00 - 21:00
const WORKING_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null); 
  const [modalData, setModalData] = useState({ date: new Date().toISOString().split('T')[0], time: '09:00' });

  // 7 GÜNLÜK BLOK HESAPLAMA (Pazartesi başlangıçlı)
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
    // Veritabanı değişimlerini canlı dinle
    const channel = supabase.channel('calendar-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments(); 
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentDate]);

  const fetchAppointments = async () => {
    const startStr = weekDates[0].toISOString().split('T')[0];
    const endStr = weekDates[6].toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr)
      .eq('business_slug', CURRENT_BUSINESS_SLUG);
    
    if (error) console.error("Veri çekme hatası:", error);
    if (data) setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleEmptySlotClick = (dateStr: string, timeStr: string) => {
    setModalData({ date: dateStr, time: timeStr });
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
        
        {/* ÜST NAVİGASYON (HAFTA KAYDIRMA) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex-shrink-0">
          <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase italic tracking-tighter">
            {weekDates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all active:scale-90"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-x border-slate-200 active:bg-white transition-all">Bugün</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all active:scale-90"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* PROFESYONEL TIMELINE IZGARASI */}
        <div className="flex-1 overflow-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm custom-scrollbar relative">
          <div className="inline-flex flex-col min-w-full">
            
            {/* BAŞLIK SATIRI (GÜNLER) */}
            <div className="flex border-b border-slate-200 bg-slate-50/95 backdrop-blur-md sticky top-0 z-30">
              <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50/95 sticky left-0 z-40"></div>
              {weekDates.map((date, index) => {
                const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
                return (
                  <div key={index} className="min-w-[140px] md:min-w-[180px] flex-1 p-4 text-center border-r border-slate-100">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </p>
                    <p className={`text-xl font-black ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                      {date.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* SAAT SATIRLARI */}
            {WORKING_HOURS.map((hour, hourIdx) => (
              <div key={hourIdx} className="flex border-b border-slate-100 group/row">
                
                {/* SOL SAAT KOLONU */}
                <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-20 flex items-start justify-center pt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{hour}</span>
                </div>

                {/* GÜN HÜCRELERİ */}
                {weekDates.map((date, dayIdx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  // Saati eşleştir (09:00, 14:00 gibi tam saatleri kontrol eder)
                  const app = appointments.find(a => a.appointment_date === dateStr && a.time.startsWith(hour.split(':')[0]));

                  return (
                    <div key={dayIdx} className="min-w-[140px] md:min-w-[180px] flex-1 min-h-[100px] border-r border-slate-100 p-1 relative transition-colors hover:bg-slate-50 group/cell">
                      
                      {app ? (
                        <div 
                          onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                          className="absolute inset-1.5 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-2.5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all z-10 overflow-hidden"
                        >
                          <div className="w-1.5 h-full bg-blue-500 absolute left-0 top-0"></div>
                          <p className="text-[9px] font-black text-blue-700 mb-1">{app.time}</p>
                          <p className="text-[11px] font-black text-slate-800 leading-tight uppercase truncate">{app.name}</p>
                          <p className="text-[9px] font-bold text-slate-500 truncate mt-1 italic uppercase tracking-tighter">{app.service}</p>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleEmptySlotClick(dateStr, hour)}
                          className="w-full h-full border-2 border-dashed border-transparent group-hover/cell:border-blue-100 rounded-2xl cursor-pointer flex flex-col items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-300"
                        >
                          <Plus size={20} className="text-blue-300 mb-1" />
                          <span className="text-[8px] font-black text-blue-300 uppercase tracking-[0.2em]">Randevu Ekle</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RANDEVU DETAY / SİLME MODALI */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">İşlem Özeti</h3>
              <button onClick={() => setSelectedApp(null)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 mb-10">
              <div className="bg-slate-50 p-5 rounded-[1.8rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-2 tracking-widest"><User size={12}/> Müşteri</p>
                <p className="font-black text-slate-800 uppercase text-xl leading-none">{selectedApp.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-[1.8rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-2 tracking-widest"><Clock size={12}/> Zaman</p>
                  <p className="font-black text-slate-800">{selectedApp.time}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-[1.8rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-2 tracking-widest"><Scissors size={12}/> Hizmet</p>
                  <p className="font-black text-slate-800 text-xs truncate uppercase italic">{selectedApp.service}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => { alert("Düzenleme özelliği sıradaki güncelleme ile eklenecektir."); }} className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-2xl text-[10px] uppercase italic hover:bg-slate-200 transition-all">Düzenle</button>
              <button onClick={() => deleteAppointment(selectedApp.id)} className="flex-1 bg-red-50 text-red-600 font-black py-5 rounded-2xl text-[10px] uppercase italic flex items-center justify-center gap-2 active:scale-95 hover:bg-red-100 transition-all">
                <Trash2 size={18}/> İptal & Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ KAYIT MODALI (CRM SENKRONİZASYONLU) */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialDate={modalData.date}
        initialTime={modalData.time}
        onSave={async (newApp: any) => {
          // 1. Randevuyu Kaydet
          const { error: appError } = await supabase.from('appointments').insert([{ 
            ...newApp, 
            business_slug: CURRENT_BUSINESS_SLUG 
          }]);

          // 2. Müşteriyi CRM Rehberine Ekle veya Güncelle (Neo'nun Müdahalesi)
          const { error: custError } = await supabase.from('customers').upsert({ 
            name: newApp.name, 
            phone: newApp.phone, 
            business_slug: CURRENT_BUSINESS_SLUG 
          }, { onConflict: 'phone, business_slug' });

          if (appError || custError) {
            const msg = appError?.message || custError?.message;
            alert("❌ Veritabanı Hatası: " + msg);
          } else {
            setIsModalOpen(false); 
            fetchAppointments();
          }
        }} 
      />
    </DashboardLayout>
  );
}
