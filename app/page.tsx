"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { TrendingUp, Clock, CheckCircle2, MessageCircle, Mail, AlertCircle } from 'lucide-react';

export default function DashboardHome() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayStr] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTodayAppointments();
    const channel = supabase.channel('global-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchTodayAppointments(); 
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTodayAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').eq('appointment_date', todayStr);
    if (data) setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
        
        {/* LUNA'NIN KARŞILAMA VE MAX'İN FİNANS KARTLARI */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">İyi Günler, Patron! 👋</h1>
            <p className="text-[12px] text-slate-500 font-bold mt-1">İşte bugünün operasyon özeti.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* AYLIK CİRO KARTI */}
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] p-5 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><TrendingUp size={100} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Aylık Ciro</p>
              <h3 className="text-2xl font-black mt-2 tracking-tighter">₺45.200</h3>
              <div className="mt-4 flex items-center space-x-1 text-[9px] font-bold bg-white/20 w-max px-2 py-1 rounded-full">
                <TrendingUp size={10} /> <span>Geçen aya göre %12 arttı</span>
              </div>
            </div>

            {/* BEKLENEN GELİR KARTI */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Beklenen</p>
              <h3 className="text-2xl font-black mt-2 tracking-tighter text-slate-800">₺12.500</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-4 leading-tight">Bu haftaki onaylanmış<br/>randevulara göre.</p>
            </div>
          </div>
        </div>

        {/* LUNA'NIN RANDEVU LİSTESİ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 tracking-tighter">Bugünün Randevuları</h2>
            <span className="bg-blue-100 text-blue-600 font-black text-[10px] px-3 py-1 rounded-full">{appointments.length} Kayıt</span>
          </div>

          <div className="space-y-3 pb-6">
            {appointments.length === 0 ? (
              <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <Clock className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-400 font-bold text-sm">Bugün için henüz randevu yok.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                  
                  <div className="flex items-center space-x-4">
                    {/* SAAT */}
                    <div className="bg-slate-50 text-blue-600 font-black text-lg px-4 py-3 rounded-2xl border border-slate-100 shadow-inner">
                      {app.time}
                    </div>
                    {/* MÜŞTERİ BİLGİSİ */}
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-tight">{app.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{app.service || 'Genel Hizmet'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {/* DURUM ETİKETİ (Örnek: Şimdilik hepsi onaylandı görünüyor, veritabanına eklenebilir) */}
                    <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                      <CheckCircle2 size={10} /> <span>Onaylandı</span>
                    </div>
                    {/* OTOMASYON İKONLARI */}
                    <div className="flex space-x-2 text-slate-300">
                      <MessageCircle size={14} className="text-blue-400" />
                      <Mail size={14} className="text-slate-300" />
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
        initialTime="09:00"
        onSave={async (newApp: any) => {
          await supabase.from('appointments').insert([{ ...newApp, appointment_date: todayStr }]);
          await supabase.from('customers').insert([{ name: newApp.name, phone: newApp.phone }]).onConflict('phone').ignore();
          setIsModalOpen(false); fetchTodayAppointments();
        }} 
      />
    </DashboardLayout>
  );
}
