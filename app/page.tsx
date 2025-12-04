"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FiDownload, FiMapPin, FiCalendar } from "react-icons/fi";

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
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6"
            >
              SKSSF Twalaba Conference 2025
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-lg md:text-xl text-foreground/80 mb-10"
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-accent" />
                <span>December 5 & 6, 2025</span>
              </div>
              <div className="hidden md:block w-2 h-2 bg-foreground/20 rounded-full"></div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-accent" />
                <span>CBMS Islamic Academy, Vilayil-Parappur</span>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">Program Schedule</h2>
              <p className="text-lg text-foreground/80 mb-10">
                Explore the detailed timeline of events, sessions, and speakers.
              </p>
              <a
                href="/assets/Brochure.pdf"
                download
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25"
              >
                <FiDownload className="text-xl" />
                Download Brochure
              </a>
            </motion.div>
          </div>
        </section>

        {/* Guests Section */}
        <section id="guests" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">Distinguished Guests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: item * 0.1 }}
                  className="bg-secondary/10 rounded-xl p-6 text-center hover:shadow-xl transition-shadow border border-secondary/20"
                >
                  <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden relative">
                    {/* Placeholder for Guest Image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Guest {item}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Guest Name</h3>
                  <p className="text-sm text-primary">Designation / Title</p>
                </motion.div>
              ))}
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative group"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:bg-black/20 transition-colors">
                    Photo {item}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
