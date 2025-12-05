"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiX, FiSun, FiMoon, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Search from "./Search";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
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
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Theme Toggle, Language Switcher, Search & Mobile Menu Button */}
                        <div className="flex items-center gap-4">
                            {mounted && (
                                <>
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                        aria-label="Search"
                                    >
                                        <FiSearch className="h-5 w-5 text-foreground" />
                                    </button>
                                    <button
                                        onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                                        className="px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/10 text-sm font-medium transition-colors"
                                    >
                                        {language === 'en' ? 'MAL' : 'ENG'}
                                    </button>
                                    <button
                                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                        aria-label="Toggle Theme"
                                    >
                                        {resolvedTheme === "dark" ? (
                                            <FiSun className="h-5 w-5 text-yellow-400" />
                                        ) : (
                                            <FiMoon className="h-5 w-5 text-primary" />
                                        )}
                                    </button>
                                </>
                            )}

                            <div className="-mr-2 flex md:hidden">
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
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-background border-b border-white/10"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <Search
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                guests={guests}
                galleryItems={galleryItems}
            />
        </>
    );
}

