"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Scissors, Clock, CreditCard, Loader2, Sparkles } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: 30, price: '' });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('business_slug', CURRENT_BUSINESS_SLUG).order('created_at', { ascending: false });
    if (data) setServices(data);
  };

  const addService = async () => {
    if (!newService.name || !newService.price) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('services').insert([{ 
      name: newService.name, 
      duration: Number(newService.duration), 
      price: Number(newService.price),
      business_slug: CURRENT_BUSINESS_SLUG 
    }]);

    if (!error) {
      setNewService({ name: '', duration: 30, price: '' });
      await fetchServices();
    }
    setLoading(false);
  };

  const deleteService = async (id: string) => {
    if(!confirm("Bu hizmet silinsin mi?")) return;
    await supabase.from('services').delete().eq('id', id);
    fetchServices();
  };

  return (
    <div className="space-y-10">
      
      {/* LUNA'NIN YENİLİKÇİ EKLEME FORMU */}
      <div className="bg-white/70 backdrop-blur-xl border border-white p-1 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem]">
        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white"><Sparkles size={18}/></div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Hizmet Menüsünü Düzenle</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-1 block">Hizmet Adı</label>
              <input type="text" placeholder="Örn: Saç Kesimi" className="w-full bg-slate-100 border-none p-4 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
            </div>
            
            <div className="relative">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-1 block">Süre (Dk)</label>
              <div className="relative">
                <input type="number" placeholder="30" className="w-full bg-slate-100 border-none p-4 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={newService.duration} onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})} />
                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              </div>
            </div>

            <div className="relative">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-1 block">Ücret (₺)</label>
              <div className="relative">
                <input type="number" placeholder="250" className="w-full bg-slate-100 border-none p-4 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} />
                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              </div>
            </div>

            <button onClick={addService} disabled={loading} className="md:mt-5 bg-slate-900 text-white rounded-2xl font-black uppercase italic py-4 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> SİSTEME EKLE</>}
            </button>
          </div>
        </div>
      </div>

      {/* LUNA'NIN YENİ NESİL HİZMET KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10">
        {services.map(s => (
          <div key={s.id} className="relative bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
              <Scissors size={100} />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full w-max uppercase tracking-widest mb-3">
                  Aktif Hizmet
                </div>
                <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{s.name}</h4>
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-[12px]">
                    <Clock size={14}/> <span>{s.duration} dk</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-600 font-black text-[16px]">
                    <CreditCard size={16}/> <span>₺{s.price}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => deleteService(s.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
