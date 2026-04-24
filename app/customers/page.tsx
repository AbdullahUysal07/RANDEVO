"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, UserPlus, Phone, Trash2, Edit2, User, Star, Zap, X, Loader2, CheckCircle2 } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Düzenleme durumu için state'ler
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // 1. Müşterileri çek
    const { data: custData, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('business_slug', CURRENT_BUSINESS_SLUG);
    
    if (custError) console.error("Müşteri çekme hatası:", custError);

    // 2. Etiketleme için randevu sayılarını çek (Otomatik Etiket Algoritması)
    const { data: appData } = await supabase
      .from('appointments')
      .select('phone')
      .eq('business_slug', CURRENT_BUSINESS_SLUG);

    if (custData) {
      const enriched = custData.map(cust => {
        const visitCount = appData?.filter(a => a.phone === cust.phone).length || 0;
        let tag = { label: 'Yeni', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <Zap size={10}/> };
        
        if (visitCount > 3) tag = { label: 'Sürekli', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Star size={10}/> };
        if (visitCount > 10) tag = { label: 'VIP', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: <Star size={10}/> };
        
        return { ...cust, visitCount, tag };
      });
      setCustomers(enriched.sort((a, b) => b.visitCount - a.visitCount));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    setLoading(true);
    let error;

    if (editingCustomer) {
      // DÜZENLEME MODU (UPDATE)
      const { error: updateError } = await supabase
        .from('customers')
        .update({ name: formData.name, phone: formData.phone })
        .eq('id', editingCustomer.id);
      error = updateError;
    } else {
      // YENİ KAYIT MODU (INSERT)
      const { error: insertError } = await supabase
        .from('customers')
        .insert([{ ...formData, business_slug: CURRENT_BUSINESS_SLUG }]);
      error = insertError;
    }

    if (error) {
      alert("Hata oluştu: " + error.message);
    } else {
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '' });
      await fetchCustomers(); // Listeyi güncelle
    }
    setLoading(false);
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("⚠️ Bu müşteriyi silmek istediğinize emin misiniz? (Randevuları silinmez, sadece CRM kaydı kalkar)")) return;
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Silme işlemi başarısız: " + error.message);
    } else {
      await fetchCustomers(); // Listeyi tazele
    }
  };

  const openEditModal = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone });
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700 pb-24">
        
        {/* ÜST BAR VE ARAMA (TASARIM KORUNDU) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Müşteri Portföyü</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Müşteri Sadakati ve CRM Takibi</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="İsim veya telefon ile hızlı ara..." 
                className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingCustomer(null); setFormData({name:'', phone:''}); setIsModalOpen(true); }}
              className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-600 active:scale-90 transition-all"
            >
              <UserPlus size={24} />
            </button>
          </div>
        </div>

        {/* MÜŞTERİ KARTLARI (LUNA'NIN ÖZEL TASARIMI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold uppercase tracking-widest italic">
              Aranan müşteri bulunamadı...
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                {/* Arka Plan Dekoratif İkon */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-slate-900">
                  <User size={180} />
                </div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${customer.tag.color}`}>
                    {customer.tag.icon} {customer.tag.label}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => openEditModal(customer)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button 
                      onClick={() => deleteCustomer(customer.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>

                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight pr-10">{customer.name}</h3>
                  
                  <div className="space-y-4 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-4 text-slate-500 font-black text-sm uppercase italic">
                      <div className="p-3 bg-slate-50 rounded-xl text-blue-600"><Phone size={16}/></div>
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 font-black text-sm uppercase italic">
                      <div className="p-3 bg-slate-50 rounded-xl text-emerald-500"><CheckCircle2 size={16}/></div>
                      <span>{customer.visitCount} Randevu</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MÜŞTERİ EKLE/DÜZENLE MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-center mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                  {editingCustomer ? 'Müşteriyi Güncelle' : 'Rehbere Ekle'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Müşteri Kimlik Kartı</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Müşteri Ad Soyad</label>
                <input 
                  type="text" 
                  placeholder="Ahmet Yılmaz" 
                  className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-[1.5rem] font-black text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">İletişim Hattı</label>
                <input 
                  type="tel" 
                  placeholder="05XX XXX XX XX" 
                  className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-[1.5rem] font-black text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl uppercase italic mt-6 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : editingCustomer ? 'Güncellemeleri Kaydet' : 'Sisteme Tanımla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
