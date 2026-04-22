"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Banknote, Users, TrendingUp, ArrowUpRight, PieChart } from 'lucide-react';

export default function FinancePage() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalAppts: 0, avgTicket: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinance = async () => {
      const { data: appts } = await supabase.from('appointments').select('*');
      const { data: svcs } = await supabase.from('services').select('*');
      if (appts && svcs) {
        const priceMap: any = {}; svcs.forEach(s => priceMap[s.name] = s.price);
        let revenue = 0; appts.forEach(app => revenue += priceMap[app.service] || 300);
        setStats({ totalRevenue: revenue, totalAppts: appts.length, avgTicket: appts.length > 0 ? Math.round(revenue / appts.length) : 0 });
        setRecentSales(appts.slice(-6).reverse());
      }
    };
    fetchFinance();
  }, []);

  return (
    <DashboardLayout onOpenModal={() => {}}>
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
        <header><h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Finans</h1><p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Ciro Analizi</p></header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard title="Gelir" val={`₺${stats.totalRevenue}`} icon={<Banknote />} color="text-emerald-600" />
          <StatCard title="Randevu" val={stats.totalAppts} icon={<Users />} color="text-blue-600" />
          <StatCard title="Ortalama" val={`₺${stats.avgTicket}`} icon={<TrendingUp />} color="text-purple-600" />
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic">Son Tahsilatlar</h3>
           <div className="space-y-4">
              {recentSales.map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><ArrowUpRight size={20} /></div>
                    <div><p className="font-bold text-slate-800 uppercase text-sm">{sale.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase">{sale.service}</p></div>
                  </div>
                  <p className="font-black text-emerald-600 text-lg">₺{sale.price || '---'}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, val, icon, color }: any) {
  return (
    <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm group hover:shadow-xl hover:shadow-blue-100 transition-all">
      <div className={`${color} mb-6`}>{icon}</div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <p className="text-4xl font-black text-slate-900 mt-2">{val}</p>
    </div>
  );
}