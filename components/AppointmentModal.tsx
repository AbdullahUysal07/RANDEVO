"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Check, User, Clock, Tag, Phone } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialTime?: string;
  initialDayIndex?: number;
}

export default function AppointmentModal({ isOpen, onClose, onSave, initialTime = "09:00", initialDayIndex = 0 }: ModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [time, setTime] = useState(initialTime);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  // KRİTİK: Modal her açıldığında takvimden gelen saati içeri al
  useEffect(() => {
    if (isOpen) {
      setTime(initialTime);
      fetchServices();
      // Formu temizle (yeni kayıt için)
      setName('');
      setPhone('');
    }
  }, [isOpen, initialTime]);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('name');
    if (data) {
      setAvailableServices(data);
      if (data.length > 0) setService(data[0].name);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[999] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
        
        {/* Üst Başlık */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Hızlı Kayıt</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.3em] mt-1">Operasyon Planlama</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          {/* İSİM ALANI */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Müşteri Bilgisi</label>
             <div className="relative">
                <User className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold placeholder:text-slate-300" 
                  placeholder="Ad Soyad" 
                  value={name}
                  onChange={(e) => setName(e.target.value)} 
                />
             </div>
          </div>

          {/* TELEFON ALANI (Yeni Eklendi) */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">İletişim Numarası</label>
             <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  type="tel"
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold placeholder:text-slate-300" 
                  placeholder="5xx xxx xx xx" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)} 
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* HİZMET SEÇİMİ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hizmet</label>
              <div className="relative">
                <Tag className="absolute left-4 top-4 text-slate-300" size={18} />
                <select 
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold appearance-none" 
                  value={service} 
                  onChange={(e) => setService(e.target.value)}
                >
                  {availableServices.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* SAAT ALANI (Artık Takvimle Senkronize) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Zaman</label>
              <div className="relative">
                <Clock className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  type="time" 
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* KAYDET BUTONU */}
          <button 
            onClick={() => onSave({ name, phone, service, time, dayIndex: initialDayIndex })} 
            className="w-full bg-slate-900 hover:bg-black py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center space-x-3 mt-4"
          >
            <Check size={20} />
            <span>KAYDI TAMAMLA</span>
          </button>
        </div>
      </div>
    </div>
  );
}