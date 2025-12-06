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
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'SKSSF Twalaba Conference 2025',
                                        text: 'Join us for the SKSSF Twalaba Conference 2025!',
                                        url: window.location.href,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="Share"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
                    {t.footer.copyright}
                </div>
            </div>
        </footer>
    );
}
