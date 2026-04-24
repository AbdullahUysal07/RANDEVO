"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Scissors, Clock, ShieldCheck } from 'lucide-react';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({ name: '', duration: 60 });
  const CURRENT_BUSINESS_SLUG = 'shram-events';

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('business_slug', CURRENT_BUSINESS_SLUG);
    if (data) setServices(data);
  };

  const addService = async () => {
    if (!newService.name) return;
    await supabase.from('services').insert([{ ...newService, business_slug: CURRENT_BUSINESS_SLUG }]);
    setNewService({ name: '', duration: 60 });
    fetchServices();
  };

  const deleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      {/* HİZMET EKLEME FORMU */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
        <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter mb-4">Hizmet Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Hizmet İsmi (Örn: Saç Kesim)" className="bg-slate-50 p-4 rounded-2xl font-bold outline-none border border-slate-100 focus:border-blue-500" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
          <input type="number" placeholder="Süre (Dakika)" className="bg-slate-50 p-4 rounded-2xl font-bold outline-none border border-slate-100 focus:border-blue-500" value={newService.duration} onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})} />
          <button onClick={addService} className="bg-blue-600 text-white font-black uppercase italic rounded-2xl flex items-center justify-center gap-2 py-4 md:py-0 active:scale-95 transition-all"><Plus size={20}/> EKLE</button>
        </div>
      </div>

      {/* HİZMET LİSTESİ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Scissors size={20}/></div>
              <div>
                <h4 className="font-black text-slate-800 uppercase italic">{s.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {s.duration} Dakika Seans</p>
              </div>
            </div>
            <button onClick={() => deleteService(s.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
