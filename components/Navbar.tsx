"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Schedule", href: "#schedule" },
    { name: "Guests", href: "#guests" },
    { name: "Location", href: "#location" },
    { name: "Gallery", href: "#gallery" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
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

                    {/* Theme Toggle & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        {mounted && (
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
    );
}
