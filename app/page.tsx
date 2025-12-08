"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Views
import PreConferenceView from "@/components/views/PreConferenceView";
import ConferenceView from "@/components/views/ConferenceView";
import PostConferenceView from "@/components/views/PostConferenceView";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'pre' | 'conference' | 'post'>('conference');
  const [settings, setSettings] = useState<any[]>([]);

  const supabase = createClient();
  const { t } = useLanguage(); // keeping hook usage if needed for global context

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        setSettings(data);
        const modeSetting = data.find(s => s.key === 'conference_mode');
        if (modeSetting) setMode(modeSetting.value as any);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <Navbar showDock={mode !== 'post'} isTransparent={mode === 'post'} />

      <main className="flex-grow">
        {mode === 'pre' && <PreConferenceView settings={settings} />}
        {mode === 'conference' && <ConferenceView settings={settings} />}
        {mode === 'post' && <PostConferenceView settings={settings} />}
      </main>

      <Footer simple={mode === 'post'} />
    </div>
  );
}
