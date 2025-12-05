"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FiDownload, FiMapPin, FiCalendar, FiHeart } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
  const [filteredGallery, setFilteredGallery] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');
  const supabase = createClient();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      const { data: guestsData } = await supabase
        .from('guests')
        .select('*')
        .order('display_order', { ascending: true });
      if (guestsData) setGuests(guestsData);

      const { data: galleryData } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });
      if (galleryData) {
        setGalleryItems(galleryData);
        setFilteredGallery(galleryData);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...galleryItems];

    // Filter
    if (activeTab !== 'all') {
      result = result.filter(item => item.media_type === activeTab);
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
  }, [galleryItems, activeTab, sortBy]);

  const handleLike = async (id: string, currentLikes: number) => {
    // Optimistic update
    setGalleryItems(prev => prev.map(item =>
      item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
    ));

    await supabase.rpc('increment_likes', { row_id: id });
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-gradient-to-br from-background to-primary/10"
        >
          <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10">
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

            <motion.div variants={fadeInUp}>
              <a
                href="#schedule"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
              >
                {t.hero.viewSchedule}
              </a>
            </motion.div>
          </motion.div>
        </section>

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
        <section id="schedule" lang="ml" className="py-20 bg-secondary/5 ml">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t.schedule.title}</h2>
              <p className="text-lg text-foreground/80">
                {t.schedule.description}
              </p>
            </motion.div>

            {/* Download Brochure - Moved to Top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
              className="mb-16"
            >
              <div className="bg-primary text-white py-4 px-6 rounded-t-xl">
                <h3 className="text-2xl font-bold">December 05, Friday</h3>
              </div>
              <div className="bg-background border border-primary/20 rounded-b-xl overflow-hidden">
                {/* Registration & Inauguration */}
                <div className="p-6 border-b border-primary/10">
                  <div className="flex flex-wrap gap-4 mb-4 text-sm font-semibold">
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full">3.00 PM - രജിസ്ട്രേഷൻ</span>
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full">4.00 PM - പതാക ഉയർത്തൽ</span>
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full">4.15 PM - ഉദ്ഘാടനം</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-noto text-foreground/90">
                    <div>
                      <p className="mb-2"><span className="font-bold text-primary">പതാക ഉയർത്തൽ:</span> ശൈഖുനാ കോട്ടുമല മൊയ്‌തീൻ കുട്ടി മുസ്ലിയാർ</p>
                      <p className="mb-2"><span className="font-bold text-primary">പ്രാർത്ഥന:</span> സയ്യിദ് നിയാസലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</p>
                      <p className="mb-2"><span className="font-bold text-primary">സ്വാഗതം:</span> അബ്ദുൽ സത്താർ ദാരിമി</p>
                      <p className="mb-2"><span className="font-bold text-primary">അധ്യക്ഷൻ:</span> ഷാജഹാൻ റഹ്മാനി കമ്പളക്കാട്</p>
                      <p className="mb-2"><span className="font-bold text-primary">ഉദ്ഘാടനം:</span> ശൈഖ് അബ്ദുൽ ഹമീദ് ഹസ്രത്ത്</p>
                      <p className="mb-2"><span className="font-bold text-primary">അനുഗ്രഹ പ്രഭാഷണം:</span> സയ്യിദ് ഹമീദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</p>
                      <p className="mb-2"><span className="font-bold text-primary">മുഖ്യപ്രഭാഷണം:</span> ശൈഖുനാ ഒളവണ്ണ അബൂബക്കർ ദാരിമി</p>
                      <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> ശുക്കൂർ വെട്ടത്തൂർ</p>
                    </div>
                    <div>
                      <p className="font-bold text-primary mb-2">പ്രസീഡിയം:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>സയ്യിദ് ഹാരിസലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</li>
                        <li>സയ്യിദ് ഫൈനാസലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</li>
                        <li>ഒ.എം. സൈനുൽ ആബിദ് തങ്ങൾ മേലാറ്റൂർ</li>
                        <li>സയ്യിദ് കുഞ്ഞി സീതിക്കോയ തങ്ങൾ</li>
                        <li>കെ. മോയിൻ കുട്ടി മാസ്റ്റർ</li>
                        <li>റഷീദ് ഫൈസി വെള്ളായിക്കോട്</li>
                        <li>ഫാറൂഖ് ഫൈസി മണിമൂളി</li>
                        <li>മുസ്തഫ ഹുദവി ആക്കോട്</li>
                        <li>യൂനുസ് ഫൈസി വെട്ടുപാറ</li>
                        <li>മുഹ്സിൻ മാസ്റ്റർ വെള്ളില</li>
                        <li>അലവി ഹാജി പള്ളിമുക്ക്</li>
                        <li>ജബ്ബാർ ഹാജി ചെറിയപറമ്പ്</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Session 01 */}
                <div className="p-6 border-b border-primary/10 bg-secondary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">7.00 - 9.00 AM</span>
                    <h4 className="text-xl font-bold text-accent">SESSION 01</h4>
                  </div>
                  <h5 className="text-lg font-bold text-primary mb-2 font-noto">മുതഅല്ലിമീയം ട്രഡീഷൻ</h5>
                  <p className="text-foreground/70 italic mb-4 font-noto">ഉജ്ജ്വലിച്ച ഉസ്താദിന്റെ ഉത്ഥാന ഗാഥകൾ</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-noto text-foreground/90 text-sm">
                    <div>
                      <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> മുസ്തഫ മാരായമംഗലം</p>
                      <p className="mb-2"><span className="font-bold text-primary">മോഡറേറ്റർ:</span> സ്വാദിഖ് ഫൈസി താനൂർ</p>
                      <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> അനസ് പുത്തൻതെരുവ്</p>
                    </div>
                    <div>
                      <p className="font-bold text-primary mb-2">Topics:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>സമസ്തയുടെ നൂറ്റാണ്ട്; ആക്ടിവിസത്തിന്റെ മാതൃക - മുജ്തബ ഫൈസി ആനക്കര</li>
                        <li>സ്വതന്ത്ര ഇന്ത്യ: രാഷ്ട്രനിർമ്മിതിയുടെ ഭാഗമായ ഉസ്താദുമാർ - ബാസിത് ഹുദവി ചെമ്പ്ര</li>
                        <li>തദ്‌രീസ്: സമന്വയത്തിന്റെ കൈക്രിയകൾ - സുഹൈൽ ഹൈതമി പള്ളിക്കര</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Session 02 */}
                <div className="p-6 border-b border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">9.30 - 10.30 AM</span>
                    <h4 className="text-xl font-bold text-accent">SESSION 02</h4>
                  </div>
                  <h5 className="text-lg font-bold text-primary mb-2 font-noto">റസൂലിയം ഫോക്ലോർ</h5>
                  <div className="font-noto text-foreground/90 text-sm">
                    <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> അലി അദ്ഹം ലക്ഷദ്വീപ്</p>
                    <p className="mb-2"><span className="font-bold text-primary">നേതൃത്വം:</span> മൻസൂർ പുത്തനത്താണി</p>
                    <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> ഫവാസ് കരുവാരക്കുണ്ട്</p>
                  </div>
                </div>

                {/* Alumni Meet */}
                <div className="p-6 bg-accent/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">10.30 PM</span>
                    <h4 className="text-xl font-bold text-primary font-noto">അലുംനി മീറ്റ്</h4>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Day 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="bg-primary text-white py-4 px-6 rounded-t-xl">
                <h3 className="text-2xl font-bold">December 06, Saturday</h3>
              </div>
              <div className="bg-background border border-primary/20 rounded-b-xl overflow-hidden">
                {/* Session 03 */}
                <div className="p-6 border-b border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">8.00 - 9.00 AM</span>
                    <h4 className="text-xl font-bold text-accent">SESSION 03</h4>
                  </div>
                  <h5 className="text-lg font-bold text-primary mb-2 font-noto">സ്റ്റാർട്ട് അപ്പ്</h5>
                  <div className="font-noto text-foreground/90 text-sm">
                    <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> സുഹൈൽ ആലിപ്പറമ്പ്, അസ്‌ലം അസ്‌ഹരി പൊയ്ത്‌തുംകടവ്</p>
                    <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> ശാഫി തരുവണ</p>
                  </div>
                </div>

                {/* Session 04 */}
                <div className="p-6 border-b border-primary/10 bg-secondary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">9.00 - 11.00 AM</span>
                    <h4 className="text-xl font-bold text-accent">SESSION 04</h4>
                  </div>
                  <h5 className="text-lg font-bold text-primary mb-2 font-noto">ഉമ്മത്തീയം (ബൈനോക്കുലർ)</h5>
                  <p className="text-foreground/70 italic mb-4 font-noto">&apos;നമ്മുടേതും കൂടിയാണ് സമൂഹം&apos;</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-noto text-foreground/90 text-sm">
                    <div>
                      <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> വാഹിദ് നിലാമുറ്റം</p>
                      <p className="mb-2"><span className="font-bold text-primary">മോഡറേറ്റർ:</span> അൻവർ മുഹ്യുദ്ധീൻ ഹുദവി</p>
                      <p className="mb-2"><span className="font-bold text-primary">ഉദ്ഘാടനം:</span> സയ്യിദ് ഹമീദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</p>
                      <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> ശംസാൻ വാഴക്കാട്</p>
                    </div>
                    <div>
                      <p className="font-bold text-primary mb-2">Topics:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>വേഷവും ചിഹ്നവും: കേരളത്തിന്റെ മുസ്ലിമാനുഭവം - ഷഫീഖ് റഹ്മാനി വഴിപ്പാറ</li>
                        <li>വാർത്താ നിർമ്മാണം; നീതിയുടെ നിലവിളി - എ.സജീവൻ</li>
                        <li>ഇസ്ലാമോഫോബിയ; വിതക്കുന്നവരും കൊയ്യുന്നവരും - സത്താർ പന്തല്ലൂർ</li>
                        <li>ഡിജിറ്റൽ മുതഅല്ലിം: സമൂഹം കാണുന്നത് - യു.എം മുഖ്‌താർ</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Session 05 */}
                <div className="p-6 border-b border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">11.00 AM - 12.00 PM</span>
                    <h4 className="text-xl font-bold text-accent">SESSION 05</h4>
                  </div>
                  <h5 className="text-lg font-bold text-primary mb-2 font-noto">ആദർശം, സംഘാടനം</h5>
                  <div className="font-noto text-foreground/90 text-sm">
                    <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> സയ്യിദ് റുശൈദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</p>
                    <p className="mb-2"><span className="font-bold text-primary">പ്രസീഡിയം:</span> അബ്ദുൽ വഹാബ് ഹൈതമി, ബഷീർ അസ്അദി</p>
                    <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> സ്വാലിഹ് തൃശ്ശൂർ</p>
                  </div>
                </div>

                {/* Session 06 */}
                <div className="p-6 border-b border-primary/10 bg-secondary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">1.30 - 3.30 PM</span>
                    <h4 className="text-xl font-bold text-accent">SESSION 06</h4>
                  </div>
                  <h5 className="text-lg font-bold text-primary mb-2 font-noto">വിജ്ഞാനീയം - സയൻസ്</h5>
                  <p className="text-foreground/70 italic mb-4 font-noto">കൃത്രിമ ബുദ്ധി: ശാസ്ത്രം, സമൂഹം, അഖീദ - ഫിഖ്ഹ്</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-noto text-foreground/90 text-sm">
                    <div>
                      <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> റഹ്മത്തുള്ള ഏലംകുളം</p>
                      <p className="mb-2"><span className="font-bold text-primary">മോഡറേറ്റർ:</span> ശുഐബുൽ ഹൈതമി</p>
                      <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> സഫ്‌വാൻ നീലഗിരി</p>
                    </div>
                    <div>
                      <p className="font-bold text-primary mb-2">Topics:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>എന്താണ്, എങ്ങനെയാണ് AI? - അൻസാർ എം.പി</li>
                        <li>AI: തക്ലീഫ്, തഖ്ലീദ്; മൻഹജുനാ - ബഷീർ ഫൈസി അരിപ്ര</li>
                        <li>2050 എങ്ങനെയാവും, &apos;മാ യകൂനു? വിഭാവന - ഡോ.മുനവ്വർ ഹാനിഹ്</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Closing Ceremony */}
                <div className="p-6 bg-accent/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">3.30 PM</span>
                    <h4 className="text-xl font-bold text-primary font-noto">സമാപനം</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-noto text-foreground/90">
                    <div>
                      <p className="mb-2"><span className="font-bold text-primary">പ്രാർത്ഥന:</span> സയ്യിദ് സാബിഖലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</p>
                      <p className="mb-2"><span className="font-bold text-primary">സ്വാഗതം:</span> അനസ് ഒളവറ</p>
                      <p className="mb-2"><span className="font-bold text-primary">അധ്യക്ഷൻ:</span> ഒ.പി. അഷ്റഫ് കുറ്റിക്കടവ്</p>
                      <p className="mb-2"><span className="font-bold text-primary">ഉദ്ഘാടനം:</span> സയ്യിദ് മുഹമ്മദ് ജിഫ്രി മുത്തുക്കോയ തങ്ങൾ</p>
                      <p className="mb-2"><span className="font-bold text-primary">അനുഗ്രഹ പ്രഭാഷണം:</span> ശൈഖുനാ എം.ടി അബ്ദുള്ള മുസ്‌ലിയാർ</p>
                      <p className="mb-2"><span className="font-bold text-primary">മുഖ്യപ്രഭാഷണം:</span> മുസ്തഫ അഷ്റഫി കക്കുപ്പടി</p>
                      <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> ശിബിലി പൊൻമുണ്ടം</p>
                    </div>
                    <div>
                      <p className="font-bold text-primary mb-2">പ്രസീഡിയം:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>സയ്യിദ് ഫഖ്റുദ്ധീൻ തങ്ങൾ കണ്ണന്തളി</li>
                        <li>സയ്യിദ് ശുഐബ് തങ്ങൾ യു.എ.ഇ</li>
                        <li>സയ്യിദ് അബ്ദു റഷീദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</li>
                        <li>സയ്യിദ് മുബശ്ശിർ തങ്ങൾ ജമലുല്ലൈലി</li>
                        <li>സയ്യിദ് ഹാശിറലി ശിഹാബ് തങ്ങൾ പാണക്കാട്</li>
                        <li>അയ്യൂബ് മാസ്റ്റർ മുട്ടിൽ</li>
                        <li>ബഷീർ അസ്അദി നമ്പ്രം</li>
                        <li>എം.പി കടുങ്ങല്ലൂർ</li>
                        <li>മമ്മു ദാരിമി</li>
                        <li>ഉമർ ദർസി</li>
                        <li>വലിയുദ്ധീൻ ഫൈസി വാഴക്കാട്</li>
                        <li>മുസ്തഫ ഹുദവി ആക്കോട്</li>
                        <li>സലീം യമാനി കാഞ്ഞിരം</li>
                        <li>അലവി ഹാജി പള്ളിമുക്ക്</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Download Brochure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
=======
              className="text-center mb-12"
>>>>>>> Stashed changes
=======
              className="text-center mb-12"
>>>>>>> Stashed changes
=======
              className="text-center mb-12"
>>>>>>> Stashed changes
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

            {/* Dynamic Schedule Rendering */}
            {scheduleData.map((day, dayIndex) => (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="bg-primary text-white py-4 px-6 rounded-t-xl">
                  <h3 className={`text-2xl font-bold ${language === 'ml' ? 'font-anek' : ''}`}>{day.date[language]}</h3>
                </div>
                <div className="bg-background border border-primary/20 rounded-b-xl overflow-hidden">
                  {day.events.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`p-6 border-b border-primary/10 ${event.type === 'session' ? 'bg-secondary/5' : event.type === 'special' ? 'bg-accent/10' : ''}`}
                    >
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${event.type === 'special' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                          {event.time}
                        </span>
                        <h4 className={`text-xl font-bold ${event.type === 'special' ? 'text-primary' : 'text-accent'} ${language === 'ml' ? 'font-anek' : ''}`}>
                          {event.title[language]}
                        </h4>
                      </div>

                      {event.subtitle && (
                        <h5 className={`text-lg font-bold text-primary mb-2 ${language === 'ml' ? 'font-anek' : ''}`}>
                          {event.subtitle[language]}
                        </h5>
                      )}

                      {event.details && (
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground/90 ${language === 'ml' ? 'font-anek' : ''}`}>
                          <div>
                            {event.details.map((detail, i) => (
                              <p key={i} className="mb-2">
                                <span className="font-bold text-primary">{detail.label[language]}:</span> {detail.content[language]}
                              </p>
                            ))}
                          </div>
                          {event.list && (
                            <div>
                              {event.list.map((list, i) => (
                                <div key={i}>
                                  {list.title && <p className="font-bold text-primary mb-2">{list.title[language]}:</p>}
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {list.items.map((item, j) => (
                                      <li key={j}>{item[language]}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Handle lists without details (like Session 1 topics) */}
                      {!event.details && event.list && (
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground/90 text-sm ${language === 'ml' ? 'font-anek' : ''}`}>
                          {event.list.map((list, i) => (
                            <div key={i}>
                              {list.title && <p className="font-bold text-primary mb-2">{list.title[language]}:</p>}
                              <ol className="list-decimal list-inside space-y-1">
                                {list.items.map((item, j) => (
                                  <li key={j}>{item[language]}</li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Download Brochure */}
            {/* Download Brochure - Removed from Bottom */}\

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

        {/* Location Section */}
        <section id="location" lang="ml" className="py-20 bg-primary/5 ml">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">{t.location.title}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Route Text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-noto space-y-6 text-lg text-foreground/90 bg-background p-8 rounded-2xl shadow-sm border border-primary/10"
              >
                <h3 className="text-2xl font-bold text-accent mb-4">{t.location.howToReach}</h3>

                <div>
                  <h4 className="font-bold text-primary">{t.location.fromKozhikode.title}</h4>
                  <p>{t.location.fromKozhikode.desc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">{t.location.fromAreekode.title}</h4>
                  <p>{t.location.fromAreekode.desc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">{t.location.fromManjeri.title}</h4>
                  <p>{t.location.fromManjeri.desc}</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">{t.location.fromMalappuram.title}</h4>
                  <p>{t.location.fromMalappuram.desc}</p>
                </div>

                <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="font-bold">NB:</span> {t.location.note}
                </div>

                {/* Bus Timings */}
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <h4 className="font-bold text-primary mb-2">{t.location.busTimings.kondotty}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-4">
                    <span>1:35 PM</span>
                    <span>2:50 PM</span>
                    <span>3:15 PM</span>
                    <span>3:55 PM</span>
                    <span>4:50 PM</span>
                    <span>5:50 PM</span>
                    <span>6:05 PM</span>
                    <span>6:55 PM</span>
                  </div>

                  <h4 className="font-bold text-primary mb-2">{t.location.busTimings.edavannappara}</h4>
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

            {filteredGallery.length === 0 ? (
              <p className="text-center text-foreground/60">{t.gallery.comingSoon}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredGallery.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-background rounded-xl overflow-hidden shadow-sm border border-primary/10 group"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {item.media_type === 'photo' ? (
                        <img src={item.media_url} alt={item.title || 'Gallery'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <video src={item.media_url} controls className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <button
                          onClick={() => handleLike(item.id, item.likes || 0)}
                          className="text-white hover:text-accent transition-colors flex items-center gap-1"
                        >
                          <FiHeart className={`text-xl ${item.likes ? 'fill-accent text-accent' : ''}`} />
                          <span className="text-sm font-bold">{item.likes || 0}</span>
                        </button>
                        <a
                          href={item.media_url}
                          download
                          className="text-white hover:text-secondary transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiDownload className="text-xl" />
                        </a>
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
