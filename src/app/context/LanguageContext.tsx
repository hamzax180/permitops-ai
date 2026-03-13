'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    navbar_home: 'Home',
    navbar_chat: 'AI Advisor',
    navbar_dashboard: 'My Permits',
    navbar_get_started: 'Get Started',
    home_hero_greeting: 'Hello there.',
    home_hero_subtitle_direct: 'How can I help with Istanbul permits today?',
    home_hero_question: 'Where should we start?',
    how_it_works_label: 'How it works',
    chat_placeholder: 'Ask PermitOps AI...',
    process_title: 'The Process',
    process_subtitle: "Getting permits shouldn't be a mystery.",
    process_step1_title: '1. Describe',
    process_step1_desc: 'Enter your business type or permit requirement in plain Turkish or English. Our AI understands municipal nuance.',
    process_step2_title: '2. Analyze',
    process_step2_desc: 'PermitOps AI cross-references 450+ municipal protocols to determine your exact path and required files.',
    process_step3_title: '3. Automate',
    process_step3_desc: 'Our RPA bot handles the heavy lifting on e-Devlet, filling forms and tracking status while you focus on business.',
    dashboard_title: 'Permit Dashboard',
    dashboard_sync: 'Sync',
    dashboard_ask_ai: 'Ask AI',
    dashboard_upload: 'Upload Docs',
    dashboard_updated: 'Updated',
    dashboard_no_session: 'No active session',
    dashboard_processing: 'Processing...',
    dashboard_compliance_score: 'Compliance Score',
    dashboard_steps_complete: 'Steps Complete',
    dashboard_est_days: 'Est. Days Left',
    dashboard_active_agents: 'Active AI Agents',
    dashboard_overall_progress: 'Overall Progress',
    dashboard_workflow_steps: 'Workflow Steps',
    dashboard_action_required: 'Action Required',
    dashboard_whats_next: 'What\'s next',
    chat_new: 'New Chat',
    chat_greeting: 'Hello there.',
    chat_subtitle: 'How can I help with Istanbul permits today?',
    chat_placeholder: 'Ask PermitOps AI...',
  },
  tr: {
    navbar_home: 'Ana Sayfa',
    navbar_chat: 'Yapay Zeka Danışmanı',
    navbar_dashboard: 'İzinlerim',
    navbar_get_started: 'Başla',
    home_hero_greeting: 'Selam.',
    home_hero_subtitle_direct: 'Bugün İstanbul izinleri konusunda nasıl yardımcı olabilirim?',
    home_hero_question: 'Nereden başlayalım?',
    how_it_works_label: 'Nasıl çalışır',
    chat_placeholder: 'PermitOps AI\'ya sor...',
    process_title: 'Süreç',
    process_subtitle: 'Ruhsat almak bir gizem olmamalı.',
    process_step1_title: '1. Tarif Et',
    process_step1_desc: 'İş türünüzü veya izin gereksiniminizi Türkçe veya İngilizce olarak belirtin. Yapay zekamız belediye mevzuatlarını anlar.',
    process_step2_title: '2. Analiz Et',
    process_step2_desc: 'PermitOps AI, tam yolunuzu ve gerekli dosyaları belirlemek için 450+ belediye protokolünü tarar.',
    process_step3_title: '3. Otomatize Et',
    process_step3_desc: 'RPA botumuz e-Devlet üzerindeki ağır işleri halleder, formları doldurur ve durumu sizin yerinize takip eder.',
    dashboard_title: 'İzin Paneli',
    dashboard_sync: 'Senkronize Et',
    dashboard_ask_ai: 'AI\'ya Sor',
    dashboard_upload: 'Belge Yükle',
    dashboard_updated: 'Güncellendi',
    dashboard_no_session: 'Aktif oturum yok',
    dashboard_processing: 'İşleniyor...',
    dashboard_compliance_score: 'Uyum Skoru',
    dashboard_steps_complete: 'Tamamlanan Adımlar',
    dashboard_est_days: 'Tahmini Kalan Gün',
    dashboard_active_agents: 'Aktif AI Ajanları',
    dashboard_overall_progress: 'Genel İlerleme',
    dashboard_workflow_steps: 'İş Akışı Adımları',
    dashboard_action_required: 'Eylem Gerekiyor',
    dashboard_whats_next: 'Sıradaki ne?',
    chat_new: 'Yeni Sohbet',
    chat_greeting: 'Selam.',
    chat_subtitle: 'Bugün İstanbul izinleri konusunda nasıl yardımcı olabilirim?',
  },
  ar: {
    navbar_home: 'الرئيسية',
    navbar_chat: 'مستشار الذكاء الاصطناعي',
    navbar_dashboard: 'تصاريحي',
    navbar_get_started: 'ابدأ الآن',
    home_hero_greeting: 'أهلاً بك.',
    home_hero_subtitle_direct: 'كيف يمكنني مساعدتك في تصاريح إسطنبول اليوم؟',
    home_hero_question: 'من أين نبدأ؟',
    how_it_works_label: 'كيف يعمل',
    chat_placeholder: 'اسأل PermitOps AI...',
    process_title: 'العملية',
    process_subtitle: 'لا ينبغي أن يكون الحصول على التصاريح لغزاً.',
    process_step1_title: '١. صف عملك',
    process_step1_desc: 'أدخل نوع عملك أو متطلبات التصريح باللغة التركية أو الإنجليزية أو العربية. يفهم الذكاء الاصطناعي لدينا الفروق التابعة للبلديات.',
    process_step2_title: '٢. التحليل',
    process_step2_desc: 'يقوم PermitOps AI بمراجعة أكثر من ٤٥٠ بروتوكولاً بلدياً لتحديد مسارك الدقيق والملفات المطلوبة.',
    process_step3_title: '٣. الأتمتة',
    process_step3_desc: 'يقوم بوت RPA الخاص بنا بالمهام الصعبة على e-Devlet، حيث يملأ النماذج ويتتبع الحالة بينما تركز أنت على عملك.',
    dashboard_title: 'لوحة التحكم',
    dashboard_sync: 'مزامنة',
    dashboard_ask_ai: 'اسأل الذكاء الاصطناعي',
    dashboard_upload: 'رفع المستندات',
    dashboard_updated: 'تم التحديث',
    dashboard_no_session: 'لا توجد جلسة نشطة',
    dashboard_processing: 'جاري المعالجة...',
    dashboard_compliance_score: 'درجة الامتثال',
    dashboard_steps_complete: 'الخطوات المكتملة',
    dashboard_est_days: 'الأيام المتبقية المتوقعة',
    dashboard_active_agents: 'وكلاء الذكاء الاصطناعي النشطون',
    dashboard_overall_progress: 'التقدم العام',
    dashboard_workflow_steps: 'خطوات سير العمل',
    dashboard_action_required: 'إجراء مطلوب',
    dashboard_whats_next: 'ماذا بعد؟',
    chat_new: 'دردشة جديدة',
    chat_greeting: 'أهلاً بك.',
    chat_subtitle: 'كيف يمكنني مساعدتك في تصاريح إسطنبول اليوم؟',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'ar', 'tr'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
