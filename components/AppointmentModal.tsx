"use client";

import { useState, useEffect } from 'react';
import { X, Phone, User, Clock, Scissors, CalendarDays } from 'lucide-react';

export default function AppointmentModal({ isOpen, onClose, initialTime = "09:00", onSave }: any) {
  // Bugünün tarihini otomatik alır
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ name: '', phone: '', date: today, time: initialTime, service: '' });

  // Modal her açıldığında formu sıfırlar ve tarihi bugüne ayarlar
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', phone: '', date: today, time: initialTime, service: '' });
    }
  }, [isOpen, initialTime, today]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center sm:p-4 transition-all">
      {/* MOBİLDE AŞAĞIDAN YUKARI KAYARAK AÇILIR */}
      <div className="bg-white w-full md:max-w-md md:rounded-[2.5rem] rounded-t-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300">
        
        {/* ÜST BAR (Kapatma ve Başlık) */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Yeni Kayıt</h3>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Müşteri & Randevu</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95">
            <X size={20}/>
          </button>
        </div>

        <div className="space-y-4">
          {/* İSİM */}
          <div className="group">
            <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><User size={14}/> <span>Müşteri Adı</span></label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" placeholder="Örn: Hasan Demir" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          {/* TELEFON */}
          <div className="group">
            <label className="flex items-center space-x-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2"><Phone size={14}/> <span>Telefon (Kalıcı CRM Kaydı)</span></label>
            <input type="tel" maxLength={11} className="w-full bg-blue-50/50 border border-blue-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-blue-300" placeholder="05XX XXX XX XX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* TARİH (YENİ EKLENEN ALAN) */}
            <div>
              <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><CalendarDays size={14}/> <span>Tarih</span></label>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            {/* SAAT */}
            <div>
              <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Clock size={14}/> <span>Saat</span></label>
              <input type="time" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>

          {/* HİZMET */}
          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Scissors size={14}/> <span>Hizmet Detayı</span></label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all" placeholder="Örn: Saç Kesim / İç Dış Yıkama" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} />
          </div>

          {/* KAYDET BUTONU */}
          <button 
            onClick={() => onSave(formData)} 
            disabled={!formData.name || !formData.phone || !formData.date}
            className="w-full bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm uppercase italic py-4 rounded-2xl mt-4 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center space-x-2"
          >
            <span>Randevuyu Onayla</span>
          </button>
        </div>

      </div>
    </div>
  );
}
