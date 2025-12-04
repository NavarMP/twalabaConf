"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FiDownload, FiMapPin, FiCalendar } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";

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
  const supabase = createClient();

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
      if (galleryData) setGalleryItems(galleryData);
    };
    fetchData();
  }, []);

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
              <div className="relative w-32 h-32 md:w-48 md:h-48">
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
              <span className="font-cooper">SKSSF</span> Twalaba Conference 2025
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-lg md:text-xl text-foreground/80 mb-10"
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-accent" />
                <span>05, 06 DEC 2025 -FRI, SAT</span>
              </div>
              <div className="hidden md:block w-2 h-2 bg-foreground/20 rounded-full"></div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-accent" />
                <span>CBMS Islamic Academy, Vilayil-Parappur, Malappuram</span>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <a
                href="#schedule"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
              >
                View Schedule
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
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">About The Conference</h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                The SKSSF Twalaba Conference 2025 is a premier gathering of students and scholars, fostering intellectual growth and spiritual development. Join us for two days of inspiring sessions, discussions, and community building at the prestigious CBMS Islamic Academy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="py-20 bg-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Program Schedule</h2>
              <p className="text-lg text-foreground/80">
                Explore the detailed timeline of events, sessions, and speakers.
              </p>
            </motion.div>

            {/* Day 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-anek text-foreground/90">
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
                  <h5 className="text-lg font-bold text-primary mb-2 font-anek">മുതഅല്ലിമീയം ട്രഡീഷൻ</h5>
                  <p className="text-foreground/70 italic mb-4 font-anek">ഉജ്ജ്വലിച്ച ഉസ്താദിന്റെ ഉത്ഥാന ഗാഥകൾ</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-anek text-foreground/90 text-sm">
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
                  <h5 className="text-lg font-bold text-primary mb-2 font-anek">റസൂലിയം ഫോക്ലോർ</h5>
                  <div className="font-anek text-foreground/90 text-sm">
                    <p className="mb-2"><span className="font-bold text-primary">ആമുഖം:</span> അലി അദ്ഹം ലക്ഷദ്വീപ്</p>
                    <p className="mb-2"><span className="font-bold text-primary">നേതൃത്വം:</span> മൻസൂർ പുത്തനത്താണി</p>
                    <p className="mb-2"><span className="font-bold text-primary">നന്ദി:</span> ഫവാസ് കരുവാരക്കുണ്ട്</p>
                  </div>
                </div>

                {/* Alumni Meet */}
                <div className="p-6 bg-accent/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">10.30 PM</span>
                    <h4 className="text-xl font-bold text-primary font-anek">അലുംനി മീറ്റ്</h4>
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
                  <h5 className="text-lg font-bold text-primary mb-2 font-anek">സ്റ്റാർട്ട് അപ്പ്</h5>
                  <div className="font-anek text-foreground/90 text-sm">
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
                  <h5 className="text-lg font-bold text-primary mb-2 font-anek">ഉമ്മത്തീയം (ബൈനോക്കുലർ)</h5>
                  <p className="text-foreground/70 italic mb-4 font-anek">&apos;നമ്മുടേതും കൂടിയാണ് സമൂഹം&apos;</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-anek text-foreground/90 text-sm">
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
                  <h5 className="text-lg font-bold text-primary mb-2 font-anek">ആദർശം, സംഘാടനം</h5>
                  <div className="font-anek text-foreground/90 text-sm">
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
                  <h5 className="text-lg font-bold text-primary mb-2 font-anek">വിജ്ഞാനീയം - സയൻസ്</h5>
                  <p className="text-foreground/70 italic mb-4 font-anek">കൃത്രിമ ബുദ്ധി: ശാസ്ത്രം, സമൂഹം, അഖീദ - ഫിഖ്ഹ്</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-anek text-foreground/90 text-sm">
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
                    <h4 className="text-xl font-bold text-primary font-anek">സമാപനം</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-anek text-foreground/90">
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
            >
              <a
                href="/assets/Brochure.pdf"
                download
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25"
              >
                <FiDownload className="text-xl" />
                Download Full Brochure
              </a>
            </motion.div>
          </div>
        </section>

        {/* Guests Section */}
        <section id="guests" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">Distinguished Guests</h2>
            {guests.length === 0 ? (
              <p className="text-center text-foreground/60">Guest information coming soon...</p>
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
        <section id="location" className="py-20 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">Location & Route</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Route Text (Malayalam) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-anek space-y-6 text-lg text-foreground/90 bg-background p-8 rounded-2xl shadow-sm border border-primary/10"
              >
                <h3 className="text-2xl font-bold text-accent mb-4">എങ്ങനെ എത്തിച്ചേരാം?</h3>

                <div>
                  <h4 className="font-bold text-primary">കോഴിക്കോട് ഭാഗത്തു നിന്ന് വരുന്നവർ:</h4>
                  <p>കോഴിക്കോട് -&gt; എടവണ്ണപ്പാറ -&gt; വിളയിൽ ഭാഗത്തേക്കുള്ള ബസ് കയറി കോട്ടമ്മൽ ഇറങ്ങുക. അവിടെ നിന്ന് സ്ഥാപനത്തിലേക്ക് 500 മീറ്റർ.</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">അരീക്കോട് ഭാഗത്തു നിന്ന് വരുന്നവർ:</h4>
                  <p>അരീക്കോട് -&gt; കൊണ്ടോട്ടി ബസിൽ കയറി ഹാജിയാർ പടി ഇറങ്ങുക. അവിടെ നിന്ന് ഓട്ടോ മാർഗം സ്ഥാപനത്തിൽ എത്താം.</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">മഞ്ചേരി ഭാഗത്തു നിന്ന് വരുന്നവർ:</h4>
                  <p>മഞ്ചേരി -&gt; കിഴിശേരി -&gt; അരീക്കോട് ബസ് കയറി ഹാജിയാർ പടി ഇറങ്ങി ഓട്ടോ മാർഗം സ്ഥാപനത്തിൽ എത്താം.</p>
                </div>

                <div>
                  <h4 className="font-bold text-primary">മലപ്പുറം ഭാഗത്തു നിന്ന് വരുന്നവർ:</h4>
                  <p>മലപ്പുറം -&gt; കൊണ്ടോട്ടി -&gt; വിളയിൽ മാർഗം പോകുന്ന എടവണ്ണപ്പാറ ബസിൽ കയറി വിളയിൽ ഇറങ്ങുക. അവിടെ നിന്ന് സ്ഥാപനത്തിലേക്ക് 500 മീറ്റർ.</p>
                </div>

                <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="font-bold">NB:</span> കൊണ്ടോട്ടിയിൽ നിന്ന് വിളയിൽ ഭാഗത്തേക്ക് അപൂർവം സമയങ്ങളിലാണ് ബസ് ഉള്ളത്. ഇല്ലാത്ത സാഹചര്യത്തിൽ കൊണ്ടോട്ടിയിൽ നിന്ന് അരീക്കോട് ബസിൽ കയറി ഹാജിയർപാടി ഇറങ്ങുകയും അവിടെ നിന്ന് ഓട്ടോ മാർഗം സ്ഥാപനത്തിൽ എത്താവുന്നതുമാണ്.
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">Gallery</h2>
            {galleryItems.length === 0 ? (
              <p className="text-center text-foreground/60">Photos and videos coming soon...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative group"
                  >
                    {item.media_type === 'photo' ? (
                      <img src={item.media_url} alt={item.title || 'Gallery'} className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.media_url} controls className="w-full h-full object-cover" />
                    )}
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                        {item.title}
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
