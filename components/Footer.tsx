"use client";

import { FaInstagram, FaWhatsapp, FaTelegram } from "react-icons/fa";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-primary text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="text-xl font-bold font-poppins">{t.hero.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{t.hero.date}</p>
                        <p className="text-sm text-gray-300">{t.hero.location}</p>
                    </div>

                    <div className="flex space-x-6">
                        <a
                            href="https://www.instagram.com/twalaba_conference/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="Instagram"
                        >
                            <FaInstagram className="h-6 w-6" />
                        </a>
                        <a
                            href="https://whatsapp.com/channel/0029VbBEjzSJJhzPu3LsS03W"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="WhatsApp"
                        >
                            <FaWhatsapp className="h-6 w-6" />
                        </a>
                        <a
                            href="https://t.me/twalaba_conference"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="Telegram"
                        >
                            <FaTelegram className="h-6 w-6" />
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
                    {t.footer.copyright}
                </div>
            </div>
        </footer>
    );
}
