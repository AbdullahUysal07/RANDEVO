"use client";

import { useState } from 'react';
import { X, Phone, User, Clock, Scissors } from 'lucide-react';

export default function AppointmentModal({ isOpen, onClose, initialTime = "09:00", onSave }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', time: initialTime, service: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center sm:p-4">
      {/* MOBİLDE AŞAĞIDAN YUKARI KAYARAK AÇILIR (Bottom Sheet Hissiyatı) */}
      <div className="bg-white w-full md:max-w-md md:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Yeni Randevu</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-all"><X size={20}/></button>
        </div>

        <div className="space-y-5">
          {/* MÜŞTERİ ADI */}
          <div>
            <label className="flex items-center space-x-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><User size={12}/> <span>Müşteri Adı</span></label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="Örn: Hasan Demir" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          {/* TELEFON NUMARASI (Max'in Altın Madeni) */}
          <div>
            <label className="flex items-center space-x-1 text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2"><Phone size={12}/> <span>Telefon Numarası (Kalıcı Kayıt)</span></label>
            <input type="tel" maxLength={11} className="w-full bg-blue-50/50 border border-blue-200 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-blue-300" placeholder="05XX XXX XX XX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* SAAT */}
            <div>
              <label className="flex items-center space-x-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Clock size={12}/> <span>Saat</span></label>
              <input type="time" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
            </div>
            {/* HİZMET */}
            <div>
              <label className="flex items-center space-x-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Scissors size={12}/> <span>Hizmet</span></label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:border-blue-500" placeholder="Örn: Saç Kesim" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={() => onSave(formData)} 
            disabled={!formData.name || !formData.phone} // İSİM VE TELEFON YOKSA BUTON ÇALIŞMAZ
            className="w-full bg-blue-600 disabled:bg-slate-300 text-white font-black text-sm uppercase italic py-4 rounded-2xl mt-4 shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:bg-blue-700 transition-all active:scale-95 flex justify-center items-center space-x-2"
          >
            <span>Kaydet & Veritabanına Ekle</span>
          </button>
        </div>

      </div>
    </div>
  );
}
