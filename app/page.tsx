"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentModal from '@/components/AppointmentModal';
import { TrendingUp, Clock, CheckCircle2, MessageCircle, Mail, Wallet } from 'lucide-react';

const CURRENT_BUSINESS_SLUG = 'shram-events';

export default function DashboardHome() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [finances, setFinances] = useState({ approved: 0, pending: 0 }); // GERÇEK CİRO VERİSİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayStr] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboardData();
    // Veritabanında değişim olduğunda rakamları anında güncelle
    const channel = supabase.channel('finance-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchDashboardData(); 
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDashboardData = async () => {
    // 1. BUGÜNÜN RANDEVULARINI ÇEK (Listeleme için)
    const { data: todayApps } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', todayStr)
      .eq('business_slug', CURRENT_BUSINESS_SLUG);
    
    if (todayApps) setAppointments(todayApps.sort((a, b) => a.time.localeCompare(b.time)));

    // 2. FİNANSAL HESAPLAMA MOTORU (Neo'nun Müdahalesi)
    const { data: allApps } = await supabase
      .from('appointments')
      .select('appointment_date, service')
      .eq('business_slug', CURRENT_BUSINESS_SLUG);

    const { data: services } = await supabase
      .from('services')
      .select('name, price')
      .eq('business_slug', CURRENT_BUSINESS_SLUG);

    if (allApps && services) {
      let approvedTotal = 0;
      let pendingTotal = 0;

      allApps.forEach(app => {
        // Hizmet ismine göre fiyatı bul (Neo: Eşleşme hatasını önledim)
        const serviceData = services.find(s => s.name === app.service);
        const price = serviceData ? Number(serviceData.price) : 0;

        if (app.appointment_date < todayStr) {
          // TARİHİ GEÇENLER (Onaylanan Ciro)
          approvedTotal += price;
        } else {
          // İLERİ TARİHLİLER (Beklenen Gelir)
          pendingTotal += price;
        }
      });

      setFinances({ approved: approvedTotal, pending: pendingTotal });
    }
  };

  return (
    <DashboardLayout onOpenModal={() => setIsModalOpen(true)}>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">İyi Günler, Patron! 👋</h1>
          <p className="text-[12px] text-slate-500 font-bold mt-1 tracking-widest uppercase">Sistemin kalbi tıkır tıkır atıyor.</p>
        </div>

        {/* GÜNCELLENEN CİRO ÇİZELGESİ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ONAYLANAN CİRO (Geçmiş Randevular) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp size={140} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Aylık Ciro (Kasa)</span>
              </div>
              <h3 className="text-4xl font-black tracking-tighter">₺{finances.approved.toLocaleString('tr-TR')}</h3>
              <div className="mt-6 flex items-center space-x-2 text-[9px] font-bold bg-white/10 w-max px-3 py-1.5 rounded-full border border-white/5">
                <span className="text-emerald-400">● Tamamlanmış İşler</span>
              </div>
            </div>
          </div>

          {/* BEKLENEN GELİR (Gelecek Randevular) */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative group hover:border-blue-200 transition-all">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
              <Clock size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Beklenen Gelir</span>
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-slate-800">₺{finances.pending.toLocaleString('tr-TR')}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-6 border-t border-slate-50 pt-4 italic">
              * İleri tarihlerdeki randevuların toplam tutarıdır.
            </p>
          </div>
        </div>

        {/* BUGÜNÜN RANDEVU LİSTESİ (Tasarım Aynen Korundu) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-slate-800 tracking-tighter uppercase italic">Bugünün Randevuları</h2>
            <span className="bg-slate-100 text-slate-500 font-black text-[10px] px-4 py-1.5 rounded-full border border-slate-200">
              {appointments.length} Kayıt
            </span>
          </div>

          <div className="space-y-3 pb-20">
            {appointments.map((app) => (
              <div key={app.id} className="bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:border-blue-200 transition-all">
                <div className="flex items-center space-x-6">
                  <div className="bg-blue-50 text-blue-600 font-black text-xl w-20 h-16 flex items-center justify-center rounded-[1.5rem] border border-blue-100 shadow-inner">
                    {app.time}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase text-base tracking-tight">{app.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{app.service}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center space-x-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">
                    <CheckCircle2 size={12} /> <span>Onaylandı</span>
                  </div>
                  <div className="flex space-x-4 text-slate-200">
                    <MessageCircle size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
                    <Mail size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* MODAL GÜNCELLEMESİ (Tarihi korumak için) */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
     onSave={async (newApp: any) => {
  // 1. Randevuyu Kaydet
  const { error: appError } = await supabase.from('appointments').insert([{ 
    ...newApp, 
    business_slug: CURRENT_BUSINESS_SLUG 
  }]);

  // 2. Müşteriyi CRM'e İşle
  const { error: custError } = await supabase.from('customers').upsert({ 
    name: newApp.name, 
    phone: newApp.phone, 
    business_slug: CURRENT_BUSINESS_SLUG 
  }, { onConflict: 'phone, business_slug' });

  // NEO'NUN HATA YAKALAMA SİSTEMİ:
  if (appError || custError) {
    const errMsg = appError?.message || custError?.message;
    alert("❌ Veritabanı Hatası: " + errMsg); // ARTIK GERÇEK HATAYI GÖRECEĞİZ
  } else {
    setIsModalOpen(false); 
    if (typeof fetchAppointments === 'function') fetchAppointments();
    if (typeof fetchDashboardData === 'function') fetchDashboardData();
  }
}}
      />
    </DashboardLayout>
  );
}
