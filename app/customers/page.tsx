"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, UserPlus, MoreVertical, Phone, Trash2, Edit2, User, Star, Zap, X } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // 1. Müşterileri çek
    const { data: custData } = await supabase.from('customers').select('*').eq('business_slug', CURRENT_BUSINESS_SLUG);
    
    // 2. Etiketleme için randevu sayılarını çek (Neo'nun Akıllı Algoritması)
    const { data: appData } = await supabase.from('appointments').select('phone').eq('business_slug', CURRENT_BUSINESS_SLUG);

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
    if (editingCustomer) {
      await supabase.from('customers').update(formData).eq('id', editingCustomer.id);
    } else {
      await supabase.from('customers').insert([{ ...formData, business_slug: CURRENT_BUSINESS_SLUG }]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '' });
    fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    if (confirm("Müşteriyi silmek üzeresiniz. Randevuları kalacaktır. Onaylıyor musunuz?")) {
      await supabase.from('customers').delete().eq('id', id);
      fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* ÜST BAR VE ARAMA (SAKIN DEĞİŞTİRME DEDİĞİN ALAN) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Müşteri Portföyü</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Kalıcı CRM Veritabanı</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="İsim veya telefon ile ara..." 
                className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingCustomer(null); setFormData({name:'', phone:''}); setIsModalOpen(true); }}
              className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
            >
              <UserPlus size={24} />
            </button>
          </div>
        </div>

        {/* MÜŞTERİ LİSTESİ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700 text-slate-900">
                <User size={120} />
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${customer.tag.color}`}>
                  {customer.tag.icon} {customer.tag.label}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingCustomer(customer); setFormData({name: customer.name, phone: customer.phone}); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500 transition-all"><Edit2 size={16}/></button>
                  <button onClick={() => deleteCustomer(customer.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">{customer.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                  <div className="p-2 bg-slate-50 rounded-lg"><Phone size={14}/></div>
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                  <div className="p-2 bg-slate-50 rounded-lg"><Zap size={14}/></div>
                  <span>{customer.visitCount} Toplam Randevu</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MÜŞTERİ EKLE/DÜZENLE MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase italic">{editingCustomer ? 'Düzenle' : 'Yeni Müşteri'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-xl"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Ad Soyad" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="Telefon Numarası" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <button 
                onClick={handleSave}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase italic mt-4"
              >
                Bilgileri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
