"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Scissors, Clock, Loader2 } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: 60 });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_slug', CURRENT_BUSINESS_SLUG);
    
    if (error) console.error("Hizmetler çekilemedi:", error.message);
    if (data) setServices(data);
  };

  const addService = async () => {
    if (!newService.name) {
      alert("Lütfen bir hizmet adı girin!");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('services')
      .insert([{ 
        name: newService.name, 
        duration: Number(newService.duration), 
        business_slug: CURRENT_BUSINESS_SLUG 
      }]);

    if (error) {
      console.error("Ekleme Hatası:", error);
      alert("Hata oluştu: " + error.message); // Hata varsa ekranda göreceksin
    } else {
      setNewService({ name: '', duration: 60 });
      await fetchServices();
    }
    setLoading(false);
  };

  const deleteService = async (id: string) => {
    if(!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) alert("Silme hatası: " + error.message);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      {/* HİZMET EKLEME FORMU */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
        <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter mb-4">Yeni Hizmet Tanımla</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Hizmet Adı (Örn: Saç Kesimi)" 
            className="bg-slate-50 p-4 rounded-2xl font-bold outline-none border border-slate-100 focus:border-blue-500 transition-all" 
            value={newService.name} 
            onChange={(e) => setNewService({...newService, name: e.target.value})} 
          />
          <div className="relative">
            <input 
              type="number" 
              placeholder="Süre" 
              className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none border border-slate-100 focus:border-blue-500 transition-all pr-12" 
              value={newService.duration} 
              onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})} 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">DAKİKA</span>
          </div>
          <button 
            onClick={addService} 
            disabled={loading}
            className="bg-blue-600 text-white font-black uppercase italic rounded-2xl flex items-center justify-center gap-2 py-4 md:py-0 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> EKLE</>}
          </button>
        </div>
      </div>

      {/* MEVCUT HİZMETLER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full text-center p-10 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold">
            Henüz hiçbir hizmet eklemediniz.
          </div>
        ) : (
          services.map(s => (
            <div key={s.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Scissors size={20}/></div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase italic leading-none">{s.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1.5"><Clock size={12}/> {s.duration} Dakika</p>
                </div>
              </div>
              <button onClick={() => deleteService(s.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"><Trash2 size={18}/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
