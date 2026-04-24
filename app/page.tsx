"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { TrendingUp, Clock, CheckCircle2, MessageCircle, Mail, MoreHorizontal } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function DashboardHome() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayStr] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
    const channel = supabase.channel('global-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments(); 
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', todayStr)
      .eq('business_slug', CURRENT_BUSINESS_SLUG);
    if (data) setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KARŞILAMA ALANI */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">İyi Günler, Patron! 👋</h1>
          <p className="text-[12px] text-slate-500 font-bold mt-1">Sistemin kalbi tıkır tıkır atıyor.</p>
        </div>

        {/* LUNA'NIN YENİ PREMIUM FİNANS KARTLARI */}
        <div className="grid grid-cols-2 gap-4">
          {/* KOYU TEMA CİRO KARTI */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><TrendingUp size={120} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aylık Ciro</p>
            <h3 className="text-2xl md:text-3xl font-black mt-2 tracking-tighter text-white">₺45.200</h3>
            <div className="mt-6 flex items-center space-x-1 text-[9px] font-bold bg-white/10 w-max px-3 py-1.5 rounded-full text-emerald-400 backdrop-blur-sm border border-white/5">
              <TrendingUp size={12} /> <span>Geçen aya göre %12 arttı</span>
            </div>
          </div>

          {/* SADE VE ŞIK BEKLENEN GELİR KARTI */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm relative group hover:border-blue-200 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Beklenen Gelir</p>
            <h3 className="text-2xl md:text-3xl font-black mt-2 tracking-tighter text-slate-800">₺12.500</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-6 leading-tight border-t border-slate-100 pt-3">
              Onaylanmış<br/>randevulara göre.
            </p>
          </div>
        </div>

        {/* LUNA'NIN YENİ RANDEVU LİSTESİ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 tracking-tighter">Bugünün Randevuları</h2>
            <span className="bg-slate-100 text-slate-600 font-black text-[10px] px-3 py-1 rounded-full">{appointments.length} Kayıt</span>
          </div>

          <div className="space-y-3 pb-6">
            {appointments.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                <Clock className="mx-auto text-slate-300 mb-4" size={36} />
                <p className="text-slate-400 font-bold text-sm">Bugün için henüz randevu yok.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 p-4 rounded-[1.5rem] flex items-center justify-between group hover:border-blue-300 hover:shadow-md transition-all">
                  
                  <div className="flex items-center space-x-4">
                    {/* SAAT KUTUSU (Daha soft renkler) */}
                    <div className="bg-blue-50 text-blue-600 font-black text-lg w-16 h-14 flex items-center justify-center rounded-2xl border border-blue-100/50">
                      {app.time}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm md:text-base">{app.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{app.service || 'Genel Hizmet'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {/* YENİ NESİL ETİKET */}
                    <div className="flex items-center space-x-1 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 size={12} /> <span className="hidden sm:inline">Onaylandı</span>
                    </div>
                    {/* MİNİMAL İKONLAR */}
                    <div className="flex items-center space-x-3 text-slate-300">
                      <MessageCircle size={14} className="hover:text-blue-500 cursor-pointer transition-colors" />
                      <Mail size={14} className="hover:text-blue-500 cursor-pointer transition-colors" />
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
      
   <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={async (newApp: any) => {
          // 1. Randevuyu kaydet
          await supabase.from('appointments').insert([{ 
            ...newApp, 
            appointment_date: newApp.date, 
            business_slug: CURRENT_BUSINESS_SLUG 
          }]);
          
          // 2. Müşteriyi CRM'e ekle (HATALI KISIM KALDIRILDI)
          await supabase.from('customers').insert([{ 
            name: newApp.name, 
            phone: newApp.phone, 
            business_slug: CURRENT_BUSINESS_SLUG 
          }]);
          
          setIsModalOpen(false); 
          fetchAppointments();
        }} 
      />
    </DashboardLayout>
  );
}
