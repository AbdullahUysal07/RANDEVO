"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Phone, User, CalendarDays, ShieldCheck } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // Sadece kalıcı müşteriler tablosundan çeker
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* ÜST BİLGİ VE ARAMA */}
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Müşteri Veritabanı</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1"><ShieldCheck size={12}/> Tüm kayıtlar güvenle saklanmaktadır.</p>
            
            <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="İsim veya Telefon ile ara..." 
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 p-4 pl-12 rounded-2xl font-bold outline-none focus:bg-white/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MÜŞTERİ LİSTESİ */}
        <div className="space-y-3 pb-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Kayıtlı Müşteriler</h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{filteredCustomers.length} Kişi</span>
          </div>

          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl border border-slate-100">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{customer.name}</h4>
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 mt-0.5">
                    <CalendarDays size={10} /> 
                    <span>Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* TELEFON ARAMA BUTONU (Mobilde direkt arama yapar) */}
              <a href={`tel:${customer.phone}`} className="bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center space-x-2 active:scale-95 transition-all">
                <Phone size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">{customer.phone}</span>
              </a>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
