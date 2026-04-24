"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Phone, User, Clock, Scissors, CalendarDays, CheckCircle2 } from 'lucide-react';

const WORKING_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function AppointmentModal({ isOpen, onClose, onSave }: any) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ name: '', phone: '', date: today, time: '', service: '' });
  const [services, setServices] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>(WORKING_HOURS);

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      setFormData({ name: '', phone: '', date: today, time: '', service: '' });
    }
  }, [isOpen]);

  // Seçilen tarihteki dolu saatleri bulup listeden çıkarır
  useEffect(() => {
    if (formData.date) {
      checkAvailableTimes();
    }
  }, [formData.date]);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('business_slug', CURRENT_BUSINESS_SLUG);
    if (data) setServices(data);
  };

  const checkAvailableTimes = async () => {
    const { data: existingApps } = await supabase
      .from('appointments')
      .select('time')
      .eq('appointment_date', formData.date)
      .eq('business_slug', CURRENT_BUSINESS_SLUG);

    const takenTimes = existingApps?.map(a => a.time) || [];
    const filtered = WORKING_HOURS.filter(t => !takenTimes.includes(t));
    setAvailableTimes(filtered);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center sm:p-4 transition-all">
      <div className="bg-white w-full md:max-w-md md:rounded-[2.5rem] rounded-t-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Akıllı Kayıt</h3>
            <p className="text-[10px] text-blue-600 font-bold tracking-[0.3em] uppercase">Sadece Boş Saatler</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          {/* MÜŞTERİ BİLGİLERİ */}
          <div className="grid grid-cols-2 gap-3">
            <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" placeholder="Ad Soyad" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="tel" maxLength={11} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          {/* TARİH VE HİZMET SEÇİMİ */}
          <div className="grid grid-cols-2 gap-3">
             <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
             
             <select 
               className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none appearance-none"
               value={formData.service}
               onChange={(e) => setFormData({...formData, service: e.target.value})}
             >
               <option value="">Hizmet Seç</option>
               {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
             </select>
          </div>

          {/* AKILLI SAAT SEÇİCİ (LUNA'NIN ÖZEL TASARIMI) */}
          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><Clock size={14}/> <span>Müsait Saatler</span></label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
              {availableTimes.map(time => (
                <button 
                  key={time}
                  onClick={() => setFormData({...formData, time})}
                  className={`py-3 rounded-xl text-[11px] font-black transition-all ${formData.time === time ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => {
              if(formData.name && formData.phone && formData.date && formData.time && formData.service) {
                onSave(formData);
              } else {
                alert("Lütfen tüm alanları (İsim, Telefon, Tarih, Saat, Hizmet) doldurunuz!");
              }
            }} 
            className="w-full bg-slate-900 text-white font-black text-sm uppercase italic py-4 rounded-2xl mt-4 shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <CheckCircle2 size={18}/> Randevuyu Onayla
          </button>
        </div>
      </div>
    </div>
  );
}
