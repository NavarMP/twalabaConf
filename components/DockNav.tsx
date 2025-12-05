"use client";

import { motion } from "framer-motion";
import { FiHome, FiCalendar, FiMapPin, FiImage, FiUsers } from "react-icons/fi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useState } from "react";

export default function DockNav() {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState("hero");

    const navItems = [
        { name: t.nav.home, icon: FiHome, href: "#hero", id: "hero" },
        { name: t.nav.schedule, icon: FiCalendar, href: "#schedule", id: "schedule" },
        { name: t.nav.location, icon: FiMapPin, href: "#location", id: "location" },
        { name: t.nav.guests, icon: FiUsers, href: "#guests", id: "guests" },
        { name: t.nav.gallery, icon: FiImage, href: "#gallery", id: "gallery" },
    ];

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Auto hide/show based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);

            // Active section logic
            const sections = navItems.map(item => item.id);
            const scrollPosition = window.scrollY + 200; // Offset

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [navItems, lastScrollY]);

    return (
        <>
            {/* Desktop Dock (Left) */}
            <motion.div
                className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-4 bg-background/80 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => scrollToSection(item.href)}
                        className={`p-3 rounded-xl transition-all duration-300 relative group ${activeSection === item.id ? 'bg-primary text-white shadow-lg scale-110' : 'text-foreground/70 hover:bg-white/10 hover:text-primary hover:scale-105'}`}
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="absolute left-full ml-4 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm">
                            {item.name}
                        </span>
                    </button>
                ))}
            </motion.div>

            {/* Mobile Dock (Bottom) */}
            <motion.div
                className="md:hidden fixed left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-background/80 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full shadow-2xl items-center transition-all duration-300"
                style={{ bottom: isVisible ? '1.5rem' : '-100px' }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => scrollToSection(item.href)}
                        className={`p-2 rounded-full transition-all duration-300 relative ${activeSection === item.id ? 'bg-primary text-white shadow-lg -translate-y-2 scale-110' : 'text-foreground/70 hover:text-primary'}`}
                    >
                        <item.icon className="w-6 h-6" />
                    </button>
                ))}
            </motion.div>
        </>
    );
}
