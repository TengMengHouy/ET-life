'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Translation dictionaries ────────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navbar
    'nav.features': 'Features',
    'nav.security': 'Security',
    'nav.scale': 'Scale',
    'nav.getStarted': 'Get Started',

    // Hero
    'hero.headline': 'The Future of Academic Forms',
    'hero.sub': 'Build, secure, and scale academic forms with an all-in-one platform designed for education.',
    'hero.cta': 'Get Started',
    'hero.secondary': 'Learn More',

    // Section 2 — Drag & Drop
    'canvas.headline': 'Build Forms Effortlessly',
    'canvas.sub': 'Drag and drop powerful UI components onto a visual canvas. No code needed — just creativity.',
    'canvas.tag': 'Drag & Drop Interface',
    'canvas.item.text': 'Text Field',
    'canvas.item.checkbox': 'Checkbox',
    'canvas.item.dropdown': 'Dropdown',
    'canvas.item.radio': 'Radio Group',
    'canvas.item.date': 'Date Picker',
    'canvas.item.upload': 'File Upload',

    // Section 3 — Security
    'vault.headline': 'Fortress-Grade Security',
    'vault.sub': 'Every form is protected by multiple layers of active anti-cheating technology.',
    'vault.tag': 'Security Suite',
    'vault.feature1.title': 'Anti-Plagiarism Lock',
    'vault.feature1.desc': 'Advanced detection algorithms that flag copied or duplicated submissions in real-time.',
    'vault.feature2.title': 'Screenshot Shield',
    'vault.feature2.desc': 'Active protection that blocks screen captures and prevents content leaks during exams.',
    'vault.feature3.title': 'Session Integrity',
    'vault.feature3.desc': 'Monitors browser focus and detects tab switching to ensure test integrity.',
    'vault.demo.label': 'Protected Content',
    'vault.demo.text': 'This is a confidential exam question that cannot be copied, screenshotted, or shared...',
    'vault.demo.denied': 'Access Denied',

    // Section 4 — Ecosystem
    'eco.headline': 'Scale Across Your Institution',
    'eco.sub': 'From a single classroom to an entire university — ET-form grows with you.',
    'eco.tag': 'Enterprise Scale',
    'eco.stat1.value': '1,000+',
    'eco.stat1.label': 'Concurrent Users',
    'eco.stat2.value': '99.9%',
    'eco.stat2.label': 'Uptime SLA',
    'eco.stat3.value': 'Real-time',
    'eco.stat3.label': 'Analytics',

    // CTA
    'cta.headline': 'Ready to Transform Your Academic Workflow?',
    'cta.sub': 'Join thousands of educators who have already modernized their form experience.',
    'cta.button': 'Start Building for Free',

    // Footer
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.copyright': '© 2026 ET-form. All rights reserved.',

    // Login
    'login.signin': 'Sign In',
    'login.signup': 'Sign Up',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.name': 'Full Name',
    'login.confirmPassword': 'Confirm Password',
    'login.forgot': 'Forgot Password?',
    'login.signinBtn': 'Sign In',
    'login.signupBtn': 'Create Account',
    'login.backHome': '← Back to Home',
    'login.welcome': 'Welcome Back',
    'login.welcomeSub': 'Sign in to continue to your dashboard',
    'login.joinUs': 'Join ET-form',
    'login.joinSub': 'Create an account to start building secure forms',
  },
  km: {
    // Navbar
    'nav.features': 'មុខងារ',
    'nav.security': 'សុវត្ថិភាព',
    'nav.scale': 'ពង្រីក',
    'nav.getStarted': 'ចាប់ផ្តើម',

    // Hero
    'hero.headline': 'អនាគតនៃទម្រង់បែបបទអប់រំ',
    'hero.sub': 'បង្កើត ការពារ និងពង្រីកទម្រង់បែបបទអប់រំជាមួយវេទិកាទាំងមូលដែលរចនាសម្រាប់ការអប់រំ។',
    'hero.cta': 'ចាប់ផ្តើម',
    'hero.secondary': 'ស្វែងយល់បន្ថែម',

    // Section 2
    'canvas.headline': 'បង្កើតទម្រង់បែបបទយ៉ាងងាយស្រួល',
    'canvas.sub': 'អូស និងទម្លាក់សមាសធាតុ UI ដ៏មានអានុភាពទៅកាន់ផ្ទាំងក្រាហ្វិក។ មិនត្រូវការកូដទេ។',
    'canvas.tag': 'ចំណុចប្រទាក់អូស និងទម្លាក់',
    'canvas.item.text': 'ប្រអប់អត្ថបទ',
    'canvas.item.checkbox': 'ប្រអប់ធីក',
    'canvas.item.dropdown': 'ម៉ឺនុយទម្លាក់',
    'canvas.item.radio': 'ក្រុមរេដ្យូ',
    'canvas.item.date': 'ជ្រើសកាលបរិច្ឆេទ',
    'canvas.item.upload': 'បង្ហោះឯកសារ',

    // Section 3
    'vault.headline': 'សុវត្ថិភាពកម្រិតខ្ពស់',
    'vault.sub': 'ទម្រង់បែបបទនីមួយៗត្រូវបានការពារដោយស្រទាប់បច្ចេកវិទ្យាប្រឆាំងការបោកប្រាស់ជាច្រើន។',
    'vault.tag': 'ឈុតសុវត្ថិភាព',
    'vault.feature1.title': 'សោប្រឆាំងការចម្លង',
    'vault.feature1.desc': 'ក្បួនដោះស្រាយរកឃើញកម្រិតខ្ពស់ដែលសម្គាល់ការដាក់ស្នើដែលត្រូវបានចម្លង។',
    'vault.feature2.title': 'ខែលការពារថតអេក្រង់',
    'vault.feature2.desc': 'ការការពារសកម្មដែលរារាំងការថតអេក្រង់ និងការលេចធ្លាយមាតិកា។',
    'vault.feature3.title': 'សុចរិតភាពវគ្គ',
    'vault.feature3.desc': 'តាមដានការផ្តោតអារម្មណ៍របស់កម្មវិធីរុករក និងរកឃើញការប្តូរផ្ទាំង។',
    'vault.demo.label': 'មាតិកាដែលត្រូវបានការពារ',
    'vault.demo.text': 'នេះជាសំណួរប្រឡងសម្ងាត់ដែលមិនអាចចម្លង ថតអេក្រង់ ឬចែករំលែកបានទេ...',
    'vault.demo.denied': 'ការចូលប្រើត្រូវបានបដិសេធ',

    // Section 4
    'eco.headline': 'ពង្រីកទូទាំងស្ថាប័នរបស់អ្នក',
    'eco.sub': 'ពីថ្នាក់រៀនតែមួយដល់សកលវិទ្យាល័យទាំងមូល — ET-form រីកចម្រើនជាមួយអ្នក។',
    'eco.tag': 'ខ្នាតសហគ្រាស',
    'eco.stat1.value': '១,០០០+',
    'eco.stat1.label': 'អ្នកប្រើប្រាស់ក្នុងពេលតែមួយ',
    'eco.stat2.value': '៩៩.៩%',
    'eco.stat2.label': 'ពេលវេលាដំណើរការ',
    'eco.stat3.value': 'ពេលវេលាជាក់ស្តែង',
    'eco.stat3.label': 'ការវិភាគ',

    // CTA
    'cta.headline': 'ត្រៀមខ្លួនប្រែក្លាយលំហូរការងារអប់រំរបស់អ្នក?',
    'cta.sub': 'ចូលរួមជាមួយអ្នកអប់រំរាប់ពាន់នាក់ដែលបានធ្វើទំនើបកម្មបទពិសោធន៍ទម្រង់បែបបទរបស់ពួកគេ។',
    'cta.button': 'ចាប់ផ្តើមបង្កើតដោយឥតគិតថ្លៃ',

    // Footer
    'footer.about': 'អំពី',
    'footer.contact': 'ទំនាក់ទំនង',
    'footer.privacy': 'ឯកជនភាព',
    'footer.copyright': '© ២០២៦ ET-form។ រក្សាសិទ្ធិគ្រប់យ៉ាង។',

    // Login
    'login.signin': 'ចូល',
    'login.signup': 'ចុះឈ្មោះ',
    'login.email': 'អ៊ីមែល',
    'login.password': 'ពាក្យសម្ងាត់',
    'login.name': 'ឈ្មោះពេញ',
    'login.confirmPassword': 'បញ្ជាក់ពាក្យសម្ងាត់',
    'login.forgot': 'ភ្លេចពាក្យសម្ងាត់?',
    'login.signinBtn': 'ចូល',
    'login.signupBtn': 'បង្កើតគណនី',
    'login.backHome': '← ត្រឡប់ទៅទំព័រដើម',
    'login.welcome': 'សូមស្វាគមន៍មកវិញ',
    'login.welcomeSub': 'ចូលដើម្បីបន្តទៅផ្ទាំងគ្រប់គ្រងរបស់អ្នក',
    'login.joinUs': 'ចូលរួម ET-form',
    'login.joinSub': 'បង្កើតគណនីដើម្បីចាប់ផ្តើមបង្កើតទម្រង់បែបបទសុវត្ថិភាព',
  },
};

// ─── Context ─────────────────────────────────────────────────────────
type Language = 'en' | 'km';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('et-lang') as Language | null;
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('et-lang', newLang);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
