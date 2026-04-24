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
