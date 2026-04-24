"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, User, Scissors } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';
const WORKING_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null); 
  const [modalData, setModalData] = useState({ date: new Date().toISOString().split('T')[0], time: '09:00' });

  // 7 GÜNLÜK BLOK
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
    const { data } = await supabase.from('appointments').select('*').gte('appointment_date', startStr).lte('appointment_date', endStr).eq('business_slug', CURRENT_BUSINESS_SLUG);
    if (data) setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleEmptySlotClick = (dateStr: string, timeStr: string) => {
    setModalData({ date: dateStr, time: timeStr });
    setIsModalOpen(true);
  };

  const deleteAppointment = async (id: string) => {
    if (confirm("Bu randevuyu silmek istediğinize emin misiniz?")) {
      await supabase.from('appointments').delete().eq('id', id);
      setSelectedApp(null);
      fetchAppointments();
    }
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 pb-24 md:pb-0">
        
        {/* ÜST NAVİGASYON */}
        <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex-shrink-0">
          <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase italic tracking-tighter">
            {weekDates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-x border-slate-200">Bugün</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* PROFESYONEL SAAT ÇİZELGESİ (TIMELINE) ALANI */}
        <div className="flex-1 overflow-auto bg-white rounded-[2rem] border border-slate-200 shadow-sm custom-scrollbar relative">
          <div className="inline-flex flex-col min-w-full">
            
            {/* BAŞLIK SATIRI (GÜNLER - Üstte Sabit) */}
            <div className="flex border-b border-slate-200 bg-slate-50/95 backdrop-blur-md sticky top-0 z-30">
              {/* Sol Üst Köşe (Boş) */}
              <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50/95 sticky left-0 z-40"></div>
              
              {weekDates.map((date, index) => {
                const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
                return (
                  <div key={index} className="min-w-[140px] md:min-w-[180px] flex-1 p-3 text-center border-r border-slate-100">
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

            {/* GÖVDE SATIRLARI (SAATLER) */}
            {WORKING_HOURS.map((hour, hourIdx) => (
              <div key={hourIdx} className="flex border-b border-slate-100 group/row">
                
                {/* SAAT KOLONU (Solda Sabit) */}
                <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-20 flex items-start justify-center pt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{hour}</span>
                </div>

                {/* GÜNLERİN HÜCRELERİ (IZGARA) */}
                {weekDates.map((date, dayIdx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  // O güne ve o saate ait randevuyu bul
                  const app = appointments.find(a => a.appointment_date === dateStr && a.time.startsWith(hour.split(':')[0]));

                  return (
                    <div key={dayIdx} className="min-w-[140px] md:min-w-[180px] flex-1 min-h-[90px] border-r border-slate-100 p-1 relative transition-colors hover:bg-slate-50 group/cell">
                      
                      {app ? (
                        // DOLU SAAT KARTI
                        <div 
                          onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                          className="absolute inset-1 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-xl p-2 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all z-10 overflow-hidden"
                        >
                          <div className="w-1 h-full bg-blue-500 absolute left-0 top-0"></div>
                          <p className="text-[9px] font-black text-blue-700 mb-0.5">{app.time}</p>
                          <p className="text-xs font-black text-slate-800 leading-tight truncate">{app.name}</p>
                          <p className="text-[9px] font-bold text-slate-500 truncate mt-1">{app.service}</p>
                        </div>
                      ) : (
                        // BOŞ SAAT ALANI (TIKLANABİLİR)
                        <div 
                          onClick={() => handleEmptySlotClick(dateStr, hour)}
                          className="w-full h-full border-2 border-dashed border-transparent group-hover/cell:border-blue-200 rounded-xl cursor-pointer flex flex-col items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all"
                        >
                          <Plus size={16} className="text-blue-400 mb-1" />
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Ekle</span>
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

      {/* RANDEVU YÖNETİM MODALI (DÜZENLE / SİL) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">İşlem Menüsü</h3>
              <button onClick={() => setSelectedApp(null)} className="p-2 bg-slate-100 rounded-xl text-slate-400"><X size={20}/></button>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><User size={12}/> Müşteri</p>
                <p className="font-black text-slate-800 uppercase text-lg">{selectedApp.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><Clock size={12}/> Zaman</p>
                  <p className="font-black text-slate-800">{selectedApp.time}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><Scissors size={12}/> Hizmet</p>
                  <p className="font-black text-slate-800 text-sm truncate">{selectedApp.service}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { alert("Düzenleme özelliği pakete dahil edilecektir."); }} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase italic">Düzenle</button>
              <button onClick={() => deleteAppointment(selectedApp.id)} className="flex-1 bg-red-50 text-red-600 font-black py-4 rounded-2xl text-xs uppercase italic flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Trash2 size={16}/> İptal & Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ KAYIT MODALI */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialDate={modalData.date}
        initialTime={modalData.time} // Tıklanan saati forma aktarır
       onSave={async (newApp: any) => {
  try {
    // Neo: Veritabanına gönderilen her bilginin tam olduğundan emin oluyoruz
    const { error } = await supabase.from('appointments').insert([{ 
      name: newApp.name,
      phone: newApp.phone,
      time: newApp.time,
      service: newApp.service, // Seçilen hizmet
      appointment_date: newApp.date || modalData.date, 
      business_slug: CURRENT_BUSINESS_SLUG // 'shram-events' kimliği
    }]);

    if (error) {
      alert("⚠️ Veritabanı Hatası: " + error.message);
    } else {
      setIsModalOpen(false); 
      fetchAppointments(); // Listeyi anında tazele
    }
  } catch (err) {
    console.error("Beklenmedik hata:", err);
  }
}}
      />
    </DashboardLayout>
  );
}
