"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Phone, User, Clock, Scissors, CalendarDays, CheckCircle2 } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function AppointmentModal({ isOpen, onClose, initialDate, initialTime, onSave }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', time: '', service: '' });
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        date: initialDate || new Date().toISOString().split('T')[0],
        time: initialTime || "09:00",
        service: ''
      });
      fetchServices();
    }
  }, [isOpen, initialDate, initialTime]);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('business_slug', CURRENT_BUSINESS_SLUG);
    if (data) setServices(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-[2.5rem] rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-900 uppercase italic">Yeni Kayıt</h3>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all"><X size={20}/></button>
        </div>

        <div className="space-y-5">
          <input type="text" placeholder="Müşteri Ad Soyad" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 focus:border-blue-500 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <input type="tel" placeholder="Telefon Numarası" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 focus:border-blue-500 outline-none transition-all" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />

          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            <input type="time" className="bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
          </div>

          <select 
            className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 focus:border-blue-500 outline-none appearance-none"
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
          >
            <option value="">İşlem Seçiniz</option>
            {services.map(s => <option key={s.id} value={s.name}>{s.name} - ₺{s.price}</option>)}
          </select>

          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase italic"
          >
            <CheckCircle2 size={20}/> Randevuyu Onayla
          </button>
        </div>
      </div>
    </div>
  );
}
