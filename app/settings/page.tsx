"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings, Plus, Trash2, Tag, Banknote, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [services, setServices] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('name');
    if (data) setServices(data);
  };

  const addService = async () => {
    if (!newName || !newPrice) return;
    const { data } = await supabase.from('services').insert([{ name: newName, price: Number(newPrice) }]).select();
    if (data) { setServices([...services, data[0]]); setNewName(''); setNewPrice(''); }
  };

  return (
    <DashboardLayout onOpenModal={() => {}}>
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in">
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Sistem Ayarları</h1>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Mağaza ve Hizmet Parametreleri</p>
        </header>

        <section className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2"><Tag size={20}/> Yeni Hizmet Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Hizmet Adı" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold" />
            <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} type="number" placeholder="Fiyat (₺)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold" />
            <button onClick={addService} className="bg-slate-900 text-white font-black rounded-2xl py-4 shadow-lg shadow-slate-200">+ LİSTEYE EKLE</button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <span className="font-bold text-slate-800 uppercase italic">{s.name}</span>
              <span className="font-black text-emerald-600">₺{s.price}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}