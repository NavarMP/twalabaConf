"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import AIAssistant from "@/components/AIAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiMapPin, FiCalendar, FiHeart, FiX, FiShare2 } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { scheduleData } from "@/lib/data/scheduleData";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [filteredGallery, setFilteredGallery] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const supabase = createClient();
  const { t, language } = useLanguage();
  const [scheduleLang, setScheduleLang] = useState<'en' | 'ml'>('ml');
  const [locationLang, setLocationLang] = useState<'en' | 'ml'>('ml');

  const [currentSessionTitle, setCurrentSessionTitle] = useState<string | null>(null);
  const [nextSessionDetails, setNextSessionDetails] = useState<string | null>(null);
  const [upcomingStreamUrl, setUpcomingStreamUrl] = useState<string | null>(null);
  const [previousSessions, setPreviousSessions] = useState<{ title: string, url: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // ... (guests and gallery fetch omitted for brevity in diff, but kept in file) ...
      const { data: guestsData } = await supabase.from('guests').select('*').order('display_order', { ascending: true });
      if (guestsData) setGuests(guestsData);

      const { data: scheduleData } = await supabase.from('schedule').select('*').order('display_order', { ascending: true });
      if (scheduleData) setScheduleItems(scheduleData);

      const { data: galleryData } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
      if (galleryData) {
        setGalleryItems(galleryData);
        setFilteredGallery(galleryData);
      }

      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['live_streaming_url', 'current_session_title', 'previous_sessions', 'next_session_details', 'upcoming_stream_url']);

      if (settingsData) {
        settingsData.forEach(item => {
          if (item.key === 'live_streaming_url') setLiveUrl(item.value);
          if (item.key === 'current_session_title') setCurrentSessionTitle(item.value);
          if (item.key === 'next_session_details') setNextSessionDetails(item.value);
          if (item.key === 'upcoming_stream_url') setUpcomingStreamUrl(item.value);
          if (item.key === 'previous_sessions') {
            try {
              setPreviousSessions(JSON.parse(item.value));
            } catch (e) {
              console.error("Failed to parse previous sessions", e);
              setPreviousSessions([]);
            }
          }
        });
      }
    };
    fetchData();
  }, []);

  const [selectedTag, setSelectedTag] = useState<string>('all-tags');

  // Derive unique tags
  const allTags = Array.from(new Set(galleryItems.flatMap(item => item.tags || []))).sort();

  useEffect(() => {
    let result = galleryItems;

    // Filter by type
    if (activeTab !== 'all') {
      if (activeTab === 'photo') {
        result = result.filter(item => item.media_type === 'photo');
      } else if (activeTab === 'video') {
        result = result.filter(item => item.media_type === 'video' || item.media_type === 'embed');
      }
    }

    // Filter by tag
    if (selectedTag !== 'all-tags') {
      result = result.filter(item => item.tags && item.tags.includes(selectedTag));
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredGallery(result);
    setCurrentPage(1);
  }, [galleryItems, activeTab, sortBy, selectedTag]);

  const handleLike = async (id: string, currentLikes: number) => {
    // Optimistic update
    setGalleryItems(prev => prev.map(item =>
      item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
    ));

    await supabase.rpc('increment_likes', { row_id: id });
  };

  // Helper functions
  const handleDownload = async (url: string, title: string | null) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const mimeType = blob.type;
      const extension = mimeType.split('/')[1] || 'jpg';
      const filename = `${title || 'skssf-conference'}.${extension}`;

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback
      window.open(url, '_blank');
    }
  };

  const handleShare = async (url: string, title: string | null) => {
    const shareData = {
      title: title || 'SKSSF Conference Gallery',
      text: 'Check out this media from SKSSF Twalaba Conference!',
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy class', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center pt-16 bg-gradient-to-br from-background to-primary/10"
        >
          <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          <motion.div
            className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="/assets/Logo.svg"
                  alt="Conference Logo"
                  fill
                  className="object-contain drop-shadow-xl logo-dark-adaptive"
                  priority
                />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6"
            >
              <span className="font-cooper">SKSSF</span> {t.hero.title.replace("SKSSF ", "")}
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-lg md:text-xl text-foreground/80 mb-10"
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-accent" />
                <span>{t.hero.date}</span>
              </div>
              <div className="hidden md:block w-2 h-2 bg-foreground/20 rounded-full"></div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-accent" />
                <span>{t.hero.location}</span>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href="#schedule"
                className="inline-block bg-secondary text-white px-8 py-4 rounded-lg font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/25"
              >
                {t.hero.viewSchedule}
              </a>
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/25"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  Live Streaming
                </a>
              )}

              {/* Current Session Info - Always show if available, regardless of Live URL */}
              {currentSessionTitle ? (
                <div className="bg-background/80 backdrop-blur-md px-6 py-3 rounded-lg border border-white/10 flex items-center gap-4 shadow-lg min-h-[60px]">
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Currently Happening</p>
                    <h3 className="text-sm font-bold text-foreground text-left leading-tight max-w-[200px] truncate">{currentSessionTitle}</h3>
                  </div>

                  {/* Previous Sessions Dropdown */}
                  {previousSessions.length > 0 && (
                    <div className="relative group border-l border-white/10 pl-4">
                      <button className="text-sm text-foreground/70 hover:text-primary flex items-center justify-center gap-1 transition-colors" title="Previous Sessions">
                        <span className="sr-only">Previous Sessions</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="absolute top-full right-0 mt-4 w-64 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        {previousSessions.map((session, idx) => (
                          <a
                            key={idx}
                            href={session.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary text-left border-b border-white/5 last:border-0"
                          >
                            {session.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (nextSessionDetails || upcomingStreamUrl) ? (
                // STATE 2: UPCOMING SESSION (Only if no current session)
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-primary/20 text-center max-w-md shadow-xl">
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Next Session</p>
                    {nextSessionDetails && <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">{nextSessionDetails}</h3>}

                    {upcomingStreamUrl ? (
                      <a
                        href={upcomingStreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-all shadow-lg"
                      >
                        <FiCalendar className="w-5 h-5" />
                        Notify Me / Watch Later
                      </a>
                    ) : (
                      <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                        Stay Tuned
                      </div>
                    )}
                  </div>

                  {/* Reuse Previous Sessions Dropdown if exists */}
                  {previousSessions.length > 0 && (
                    <div className="relative group">
                      <button className="text-sm text-foreground/80 hover:text-foreground flex items-center justify-center gap-1 mx-auto transition-colors bg-white/10 px-4 py-2 rounded-full">
                        Watch Previous Sessions
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        {previousSessions.map((session, idx) => (
                          <a
                            key={idx}
                            href={session.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary text-left border-b border-white/5 last:border-0"
                          >
                            {session.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // STATE 3: NO ACTIVE OR UPCOMING (End of Conference or Offline)
                <div className="text-center text-white/50">
                  <p>Conference updates will appear here.</p>
                  {previousSessions.length > 0 && (
                    <div className="mt-4 relative group inline-block">
                      <button className="text-sm text-white/80 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors bg-white/10 px-4 py-2 rounded-full">
                        Access Previous Sessions Archive
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        {previousSessions.map((session, idx) => (
                          <a
                            key={idx}
                            href={session.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary text-left border-b border-white/5 last:border-0"
                          >
                            {session.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* <AIAssistant /> */}

        {/* About Section */}
        <section id="about" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{t.about.title}</h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                {t.about.description}
              </p>
            </motion.div>
          </div>
        </section>



        {/* Schedule Section */}
        <section id="schedule" lang={scheduleLang} className={`py-20 bg-secondary/5 ${scheduleLang === 'ml' ? 'ml' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="flex justify-center items-center gap-4 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">{t.schedule.title}</h2>
                <div className="flex bg-primary/10 rounded-lg p-1">
                  <button
                    onClick={() => setScheduleLang('en')}
                    className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${scheduleLang === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                  >
                    ENG
                  </button>
                  <button
                    onClick={() => setScheduleLang('ml')}
                    className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${scheduleLang === 'ml' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                  >
                    MAL
                  </button>
                </div>
              </div>
              <p className="text-lg text-foreground/80">
                {t.schedule.description}
              </p>
            </motion.div>

            {/* Download Brochure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <a
                href="/assets/Brochure.pdf"
                download
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25"
              >
                <FiDownload className="text-xl" />
                {t.schedule.downloadBrochure}
              </a>
            </motion.div>

            {/* Live Session Embed at Top of Schedule */}
            {liveUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 max-w-4xl mx-auto"
              >
                <div className="bg-red-600 text-white py-3 px-6 rounded-t-xl flex items-center justify-between shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Live Now
                  </h3>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Watch Live</span>
                </div>
                <div className="bg-black aspect-video w-full rounded-b-xl overflow-hidden shadow-2xl border-x border-b border-primary/20">
                  <iframe
                    src={liveUrl.includes('youtube.com') || liveUrl.includes('youtu.be')
                      ? `https://www.youtube.com/embed/${liveUrl.split('v=')[1]?.split('&')[0] || liveUrl.split('/').pop()}?autoplay=1&mute=1`
                      : liveUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Live Stream"
                  ></iframe>
                </div>
              </motion.div>
            )}

            {/* Dynamic Schedule Rendering */}
            {[
              { day: 1, date: { en: "December 05, Friday", ml: "ഡിസംബർ 05, വെള്ളി" } },
              { day: 2, date: { en: "December 06, Saturday", ml: "ഡിസംബർ 06, ശനി" } }
            ].map((dayInfo) => {
              const dayEvents = scheduleItems.filter(item => item.day === dayInfo.day);
              if (dayEvents.length === 0) return null;

              return (
                <motion.div
                  key={dayInfo.day}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16"
                >
                  <div className="bg-primary text-white py-4 px-6 rounded-t-xl">
                    <h3 className={`text-2xl font-bold ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>{dayInfo.date[scheduleLang]}</h3>
                  </div>
                  <div className="bg-background border border-primary/20 rounded-b-xl overflow-hidden">
                    {dayEvents.map((event, eventIndex) => {
                      // Safe Parse Helpers
                      let title = { en: event.title, ml: event.title };
                      try {
                        const parsed = JSON.parse(event.title);
                        if (parsed.en) title = parsed;
                      } catch (e) { }

                      let subtitle = null;
                      if (event.subtitle) {
                        subtitle = { en: event.subtitle, ml: event.subtitle };
                        try {
                          const parsed = JSON.parse(event.subtitle);
                          if (parsed.en) subtitle = parsed;
                        } catch (e) { }
                      }

                      // Extract extended details
                      let details: any[] = [];
                      let list: any[] = [];

                      if (event.details && typeof event.details === 'object') {
                        // Cast to any to access custom properties if stored loosely
                        const d = event.details as any;
                        if (d.details && Array.isArray(d.details)) details = d.details;
                        if (d.list && Array.isArray(d.list)) list = d.list;
                      }

                      return (
                        <div
                          key={event.id}
                          className={`p-6 border-b border-primary/10 ${event.type === 'session' ? 'bg-secondary/5' : event.type === 'special' ? 'bg-accent/10' : ''}`}
                        >
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${event.type === 'special' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                              {event.time}
                              {currentSessionTitle && (title.en === currentSessionTitle || title.ml === currentSessionTitle) && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-white px-2 py-0.5 rounded-full animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                  LIVE
                                </span>
                              )}
                            </span>
                            <h4 className={`text-xl font-bold ${event.type === 'special' ? 'text-primary' : 'text-accent'} ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>
                              {title[scheduleLang]}
                            </h4>
                          </div>

                          {subtitle && (
                            <h5 className={`text-lg font-bold text-primary mb-2 ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>
                              {subtitle[scheduleLang]}
                            </h5>
                          )}

                          {/* Render Details */}
                          {(details.length > 0 || list.length > 0) && (
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground/90 ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>
                              {details.length > 0 && (
                                <div>
                                  {details.map((detail: any, i: number) => (
                                    <p key={i} className="mb-2">
                                      <span className="font-bold text-primary">{detail.label[scheduleLang]}:</span> {detail.content[scheduleLang]}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {list.length > 0 && (
                                <div>
                                  {list.map((listItem: any, i: number) => (
                                    <div key={i} className="mb-4">
                                      {listItem.title && <p className="font-bold text-primary mb-2">{listItem.title[scheduleLang]}:</p>}
                                      {/* Check if items is array */}
                                      {listItem.items && (
                                        /^\d/.test(listItem.title?.en || '') || listItem.items.length > 3 ? (
                                          <ol className="list-decimal list-inside space-y-1 text-sm">
                                            {listItem.items.map((it: any, j: number) => <li key={j}>{typeof it === 'string' ? it : it[scheduleLang]}</li>)}
                                          </ol>
                                        ) : (
                                          <ul className="list-disc list-inside text-sm space-y-1">
                                            {listItem.items.map((it: any, j: number) => <li key={j}>{typeof it === 'string' ? it : it[scheduleLang]}</li>)}
                                          </ul>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}

          </div>
        </section>

        {/* Location Section */}
        <section id="location" lang={locationLang} className={`py-20 bg-primary/5 ${locationLang === 'ml' ? 'ml' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center gap-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">{t.location.title}</h2>
              <div className="flex bg-primary/10 rounded-lg p-1">
                <button
                  onClick={() => setLocationLang('en')}
                  className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${locationLang === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                >
                  ENG
                </button>
                <button
                  onClick={() => setLocationLang('ml')}
                  className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${locationLang === 'ml' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                >
                  MAL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Route Text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`space-y-6 text-lg text-foreground/90 bg-background p-8 rounded-2xl shadow-sm border border-primary/10 ${locationLang === 'ml' ? 'font-noto' : ''}`}
              >
                <h3 className="text-2xl font-bold text-accent mb-4">{translations[locationLang].location.howToReach}</h3>

                <div>
                  <h4 className="font-bold text-primary">{translations[locationLang].location.fromKozhikode.title}</h4>
                  <p>{translations[locationLang].location.fromKozhikode.desc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">{translations[locationLang].location.fromAreekode.title}</h4>
                  <p>{translations[locationLang].location.fromAreekode.desc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">{translations[locationLang].location.fromManjeri.title}</h4>
                  <p>{translations[locationLang].location.fromManjeri.desc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">{translations[locationLang].location.fromMalappuram.title}</h4>
                  <p>{translations[locationLang].location.fromMalappuram.desc}</p>
                </div>

                <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="font-bold">NB:</span> {translations[locationLang].location.note}
                </div>

                {/* Bus Timings */}
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <h4 className="font-bold text-primary mb-2">{translations[locationLang].location.busTimings.kondotty}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-4">
                    <span>1:35 PM</span>
                    <span>2:50 PM</span>
                    <span>3:15 PM</span>
                    <span>3:55 PM</span>
                    <span>4:50 PM</span>
                    <span>5:50 PM</span>
                    <span>6:05 PM</span>
                    <span>6:55 PM</span>
                    <span>6:05 PM</span>
                  </div>

                  <h4 className="font-bold text-primary mb-2">{translations[locationLang].location.busTimings.edavannappara}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <span>1:25 PM</span>
                    <span>2:10 PM</span>
                    <span>2:45 PM</span>
                    <span>3:55 PM</span>
                    <span>4:15 PM</span>
                    <span>4:35 PM</span>
                    <span>4:55 PM</span>
                    <span>5:45 PM</span>
                  </div>
                </div>
              </motion.div>

              {/* Route Map Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-primary/10"
              >
                <Image
                  src="/assets/CBMS Route Map.jpeg"
                  alt="Route Map"
                  fill
                  className="object-contain bg-white"
                />
              </motion.div>
            </div>

            {/* Google Map Embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-primary/10"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.828626616644!2d76.0267893!3d11.1994643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6450050857321%3A0x66633cf20f3e3a89!2sCBMS%20Islamic%20Academy!5e0!3m2!1sen!2sin!4v1701700000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </section>

        {/* Guests Section */}
        <section id="guests" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">{t.guests.title}</h2>
            {guests.length === 0 ? (
              <p className="text-center text-foreground/60">{t.guests.comingSoon}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {guests.map((guest, index) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-secondary/10 rounded-xl p-6 text-center hover:shadow-xl transition-shadow border border-secondary/20"
                  >
                    <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden relative">
                      {guest.image_url ? (
                        <img src={guest.image_url} alt={guest.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold">
                          {guest.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{guest.name}</h3>
                    <p className="text-sm text-primary">{guest.title}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-8">{t.gallery.title}</h2>

            {/* Gallery Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex space-x-2 bg-secondary/10 p-1 rounded-lg">
                {['all', 'photo', 'video'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {allTags.length > 0 && (
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-secondary/10 border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  >
                    <option value="all-tags">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/70">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-secondary/10 border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="likes">Most Likes</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredGallery.length === 0 ? (
              <p className="text-center text-foreground/60">{t.gallery.comingSoon}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredGallery.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-background rounded-xl overflow-hidden shadow-sm border border-primary/10 group"
                    >
                      <div
                        className="aspect-video relative overflow-hidden cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.media_type === 'photo' ? (
                          <img
                            src={item.media_url}
                            alt={item.title || 'Gallery'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : item.media_type === 'embed' ? (
                          <div className="w-full h-full relative group-hover:opacity-90 transition-opacity">
                            <iframe
                              src={item.media_url}
                              className="w-full h-full pointer-events-none"
                              title={item.title || 'Embed'}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-transparent"></div> {/* Overlay to capture click */}
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <video src={item.media_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(item.id, item.likes || 0);
                            }}
                            className="text-white hover:text-accent transition-colors flex items-center gap-1"
                          >
                            <FiHeart className={`text-xl ${item.likes ? 'fill-accent text-accent' : ''}`} />
                            <span className="text-sm font-bold">{item.likes || 0}</span>
                          </button>
                          <div className="flex gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(item.media_url, item.title);
                              }}
                              className="text-white hover:text-blue-400 transition-colors"
                              title="Share"
                            >
                              <FiShare2 className="text-xl" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.media_url, item.title);
                              }}
                              className="text-white hover:text-secondary transition-colors"
                              title="Download"
                            >
                              <FiDownload className="text-xl" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {item.title && (
                        <div className="p-3">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {filteredGallery.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(filteredGallery.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${currentPage === page
                            ? 'bg-primary text-white'
                            : 'bg-transparent text-foreground/70 hover:bg-primary/5'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGallery.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredGallery.length / itemsPerPage)}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                <FiX className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {selectedItem.media_type === 'photo' ? (
                  <img
                    src={selectedItem.media_url}
                    alt={selectedItem.title || 'Gallery preview'}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                ) : selectedItem.media_type === 'embed' ? (
                  <div className="w-full aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={selectedItem.media_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedItem.title || 'Embed'}
                    />
                  </div>
                ) : (
                  <video
                    src={selectedItem.media_url}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[80vh] rounded-lg"
                  />
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                <h3 className="text-white text-lg font-medium pl-2">{selectedItem.title}</h3>
                <a
                  href={selectedItem.media_url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiDownload className="w-5 h-5" />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
