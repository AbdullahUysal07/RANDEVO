"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Scissors, Clock, CreditCard, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: 30, price: '' });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_slug', CURRENT_BUSINESS_SLUG)
      .order('created_at', { ascending: false });
    
    if (error) console.error("Veri çekme hatası:", error);
    if (data) setServices(data);
  };

  const addService = async () => {
    // 1. BOŞ ALAN KONTROLÜ
    if (!newService.name || !newService.price) {
      alert("⚠️ Patron, Hizmet Adı ve Fiyat boş bırakılamaz!");
      return;
    }

    setLoading(true);
    
    try {
      // 2. SUPABASE KAYIT OPERASYONU
      const { data, error } = await supabase
        .from('services')
        .insert([{ 
          name: newService.name, 
          duration: Number(newService.duration), 
          price: parseFloat(newService.price), // Sayıya çevirerek gönder
          business_slug: CURRENT_BUSINESS_SLUG 
        }])
        .select();

      if (error) {
        // HATA VARSA DETAYLI SÖYLE
        console.error("Supabase Hatası:", error);
        alert(`❌ Hata Oluştu: ${error.message}\n\nDetay: ${error.details || 'Veritabanı sütunu eksik olabilir.'}`);
      } else {
        // BAŞARILIYSA TEMİZLE VE YENİLE
        setNewService({ name: '', duration: 30, price: '' });
        await fetchServices();
      }
    } catch (err: any) {
      alert("Sistem Hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if(!confirm("Bu hizmet kalıcı olarak silinecek. Onaylıyor musun?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) alert("Silme hatası: " + error.message);
    fetchServices();
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* LUNA'NIN MODERN PREMIUM PANELİ */}
      <div className="bg-white rounded-[3.5rem] p-1 shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={24}/>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Hizmet Envanteri</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase">Yeni kalem ekle veya düzenle</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hizmet Tanımı</label>
              <div className="relative group">
                <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18}/>
                <input type="text" placeholder="Örn: VIP Saç Tasarımı" className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-[1.5rem] font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all outline-none" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">İşlem Süresi</label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18}/>
                <input type="number" placeholder="Dakika" className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-[1.5rem] font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all outline-none" value={newService.duration} onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Birim Fiyat (₺)</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18}/>
                <input type="number" placeholder="250.00" className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-[1.5rem] font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all outline-none" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} />
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={addService} 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black uppercase italic py-4 h-[58px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> KAYDET</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HİZMET KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest">Henüz Hizmet Eklenmemiş</p>
          </div>
        ) : (
          services.map(s => (
            <div key={s.id} className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
              <div className="absolute -right-8 -bottom-8 text-slate-50 opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
                <Scissors size={140} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                    <Scissors size={20}/>
                  </div>
                  <button onClick={() => deleteService(s.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>

                <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-4 pr-10">{s.name}</h4>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-6 mt-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Süre</span>
                    <span className="font-black text-slate-700">{s.duration} Dakika</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ücret</span>
                    <span className="font-black text-2xl text-blue-600 tracking-tighter">₺{s.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
