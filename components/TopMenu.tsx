"use client";

import { useState, useRef, useEffect } from "react";
import { FiMenu, FiX, FiSearch, FiMonitor, FiSun, FiMoon, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TopMenuProps {
    onSearchClick: () => void;
}

export default function TopMenu({ onSearchClick }: TopMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    // Scroll visibility
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Outside click
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    const scrollToSection = (href: string) => {
        setIsOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Auto hide/show based on scroll direction logic for mobile
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
                setIsOpen(false); // Close menu on scroll down
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [lastScrollY]);

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-32'}`}>
            {/* Search Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchClick}
                className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:text-primary transition-colors"
            >
                <FiSearch className="w-5 h-5" />
            </motion.button>

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMenu}
                    className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:text-primary transition-colors"
                >
                    {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-4 w-64 bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                        >
                            <div className="space-y-1">
                                {/* About Link */}
                                <button
                                    onClick={() => scrollToSection('#about')}
                                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <FiInfo className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-sm">About Conference</span>
                                </button>

                                {/* Theme Toggle */}
                                <div className="p-3 rounded-xl bg-secondary/5">
                                    <span className="text-xs font-semibold text-foreground/60 block mb-2 uppercase tracking-wider">Theme</span>
                                    <div className="flex bg-background/50 rounded-lg p-1">
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`flex-1 p-1.5 rounded-md flex justify-center ${theme === 'system' ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}`}
                                        >
                                            <FiMonitor className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`flex-1 p-1.5 rounded-md flex justify-center ${theme === 'light' ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}`}
                                        >
                                            <FiSun className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`flex-1 p-1.5 rounded-md flex justify-center ${theme === 'dark' ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}`}
                                        >
                                            <FiMoon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Language Toggle */}
                                <div className="p-3 rounded-xl bg-secondary/5">
                                    <span className="text-xs font-semibold text-foreground/60 block mb-2 uppercase tracking-wider">Language</span>
                                    <div className="flex bg-background/50 rounded-lg p-1">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => setLanguage('ml')}
                                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${language === 'ml' ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}`}
                                        >
                                            Malayalam
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
