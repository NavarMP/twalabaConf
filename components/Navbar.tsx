"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiX, FiSun, FiMoon, FiSearch, FiGlobe, FiMonitor } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Search from "./Search";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    // Data for search
    const [guests, setGuests] = useState<Guest[]>([]);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);

        // Fetch data for search
        const fetchData = async () => {
            const { data: guestsData } = await supabase.from('guests').select('*');
            if (guestsData) setGuests(guestsData);

            const { data: galleryData } = await supabase.from('gallery').select('*');
            if (galleryData) setGalleryItems(galleryData);
        };
        fetchData();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: t.nav.home, href: "#hero" },
        { name: t.nav.about, href: "#about" },
        { name: t.nav.schedule, href: "#schedule" },
        { name: t.nav.guests, href: "#guests" },
        { name: t.nav.location, href: "#location" },
        { name: t.nav.gallery, href: "#gallery" },
    ];

    const scrollToSection = (href: string) => {
        setIsOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!mounted) return null;

    return (
        <>
            <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 cursor-pointer">
                            <Link href="/" onClick={() => window.scrollTo(0, 0)}>
                                <div className="relative h-10 w-10">
                                    <Image
                                        src="/assets/Logo.svg"
                                        alt="SKSSF Twalaba Conf Logo"
                                        fill
                                        className="object-contain logo-dark-adaptive"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.href)}
                                    className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    {link.name}
                                </button>
                            ))}

                            {/* Search Trigger */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 rounded-full hover:bg-secondary/10 text-foreground/80 hover:text-primary transition-colors"
                                aria-label="Search"
                            >
                                <FiSearch className="w-5 h-5" />
                            </button>

                            {/* Language Switch */}
                            <div className="relative flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 w-24 h-8">
                                <motion.div
                                    className="absolute bg-white dark:bg-gray-600 rounded-full h-6 w-10 shadow-sm"
                                    animate={{ x: language === 'en' ? 0 : 44 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`relative z-10 w-1/2 text-xs font-bold transition-colors ${language === 'en' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                >
                                    ENG
                                </button>
                                <button
                                    onClick={() => setLanguage('ml')}
                                    className={`relative z-10 w-1/2 text-xs font-bold transition-colors ${language === 'ml' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                >
                                    MAL
                                </button>
                            </div>

                            {/* Theme Switch */}
                            <div className="relative flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 w-24 h-8">
                                <motion.div
                                    className="absolute bg-white dark:bg-gray-600 rounded-full h-6 w-7 shadow-sm"
                                    animate={{ x: theme === 'system' ? 0 : theme === 'light' ? 30 : 60 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`relative z-10 w-1/3 flex justify-center items-center transition-colors ${theme === 'system' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                    title="System"
                                >
                                    <FiMonitor className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`relative z-10 w-1/3 flex justify-center items-center transition-colors ${theme === 'light' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                    title="Light"
                                >
                                    <FiSun className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`relative z-10 w-1/3 flex justify-center items-center transition-colors ${theme === 'dark' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                    title="Dark"
                                >
                                    <FiMoon className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center gap-4">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 rounded-full hover:bg-secondary/10 text-foreground/80 hover:text-primary transition-colors"
                                aria-label="Search"
                            >
                                <FiSearch className="w-5 h-5" />
                            </button>
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
                                aria-label="Open Menu"
                            >
                                {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-background border-b border-white/10 overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-4">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.name}
                                        onClick={() => scrollToSection(link.href)}
                                        className="block w-full text-left py-2 text-foreground/80 hover:text-primary transition-colors font-medium"
                                    >
                                        {link.name}
                                    </button>
                                ))}

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <span className="text-sm font-medium text-foreground/60">Language</span>
                                    <div className="relative flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 w-24 h-8">
                                        <motion.div
                                            className="absolute bg-white dark:bg-gray-600 rounded-full h-6 w-10 shadow-sm"
                                            animate={{ x: language === 'en' ? 0 : 44 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`relative z-10 w-1/2 text-xs font-bold transition-colors ${language === 'en' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                        >
                                            ENG
                                        </button>
                                        <button
                                            onClick={() => setLanguage('ml')}
                                            className={`relative z-10 w-1/2 text-xs font-bold transition-colors ${language === 'ml' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                        >
                                            MAL
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-medium text-foreground/60">Theme</span>
                                    <div className="relative flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 w-24 h-8">
                                        <motion.div
                                            className="absolute bg-white dark:bg-gray-600 rounded-full h-6 w-7 shadow-sm"
                                            animate={{ x: theme === 'system' ? 0 : theme === 'light' ? 30 : 60 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`relative z-10 w-1/3 flex justify-center items-center transition-colors ${theme === 'system' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                            title="System"
                                        >
                                            <FiMonitor className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`relative z-10 w-1/3 flex justify-center items-center transition-colors ${theme === 'light' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                            title="Light"
                                        >
                                            <FiSun className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`relative z-10 w-1/3 flex justify-center items-center transition-colors ${theme === 'dark' ? 'text-primary dark:text-white' : 'text-gray-500'}`}
                                            title="Dark"
                                        >
                                            <FiMoon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav >

            <Search
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                guests={guests}
                galleryItems={galleryItems}
            />
        </>
    );
}
