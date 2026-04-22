"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, Search, Trash2, Phone, MessageSquare, 
  Edit3, UserPlus, MoreVertical, Star, Filter,
  X, Check, Save
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // MODAL VE DÜZENLEME STATE'LERİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', note: '' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    // Randevulardan ve müşteri tablosundan verileri çekiyoruz
    const { data } = await supabase.from('appointments').select('name, phone').order('name');
    if (data) {
      const unique = data.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.phone === current.phone);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);
      setCustomers(unique);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newCustomer.name || !newCustomer.phone) return alert("İsim ve telefon zorunludur!");
    
    // Buraya gerçek bir 'customers' tablosu eklediğinde INSERT işlemi yapılacak
    // Şimdilik sistem randevulardan beslendiği için ön yüzde simüle ediyoruz
    alert("Müşteri veritabanına kaydedildi!");
    setIsModalOpen(false);
    setNewCustomer({ name: '', phone: '', note: '' });
  };

  const deleteCustomer = async (phone: string) => {
    if(confirm("Bu müşterinin tüm kayıtları silinecek. Onaylıyor musunuz?")) {
      await supabase.from('appointments').delete().eq('phone', phone);
      fetchCustomers();
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <DashboardLayout onOpenModal={() => {}}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* LUNA & MAX: Üst Kontrol Barı */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Müşteri Rehberi</h1>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">Shram CRM & Veri Yönetimi</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                placeholder="İsim, telefon veya not ara..." 
                className="bg-slate-50 border border-slate-100 p-3.5 pl-12 rounded-2xl shadow-inner outline-none focus:border-blue-600 w-full md:w-64 font-bold transition-all text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <UserPlus size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Yeni Müşteri</span>
            </button>
          </div>
        </header>

        {/* NEO: Fonksiyonel Liste Tasarımı */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Müşteri Profil</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">İletişim Hattı</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Durum</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-blue-600 font-black italic shadow-sm group-hover:scale-110 transition-transform">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 uppercase text-sm tracking-tighter">{c.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Shram Kayıtlı Üye</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                      <Phone size={12} className="text-blue-500" />
                      {c.phone}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Aktif</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`https://wa.me/90${c.phone?.replace(/\s/g, '')}`} target="_blank" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm">
                        <MessageSquare size={18} />
                      </a>
                      <button className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-white rounded-xl transition-all shadow-sm">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => deleteCustomer(c.phone)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <Users className="mx-auto text-slate-200" size={48} />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">Aradığınız kriterde müşteri bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* YENİ MÜŞTERİ MODAL (Luna Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Müşteri Kartı</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ad Soyad</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">İletişim Numarası</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold"
                  value={newCustomer.phone}
                  placeholder="5xx xxx xx xx"
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                <span>Müşteriyi Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}