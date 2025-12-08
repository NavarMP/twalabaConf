"use client";

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiMessageSquare, FiImage } from 'react-icons/fi'
import { Great_Vibes } from 'next/font/google'
import { useLanguage } from "@/lib/i18n/LanguageContext"

const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'] })

export default function PostConferenceView({ settings }: { settings: any[] }) {
    const { t } = useLanguage()
    const settingMsg = settings?.find(s => s.key === 'thank_you_message')?.value
    const thankYouMessage = (settingMsg && settingMsg.trim() !== "Thank You" && settingMsg.trim() !== "")
        ? settingMsg
        : t.postConference.thankYou

    const bgImage = settings?.find(s => s.key === 'post_conf_bg_image')?.value || null

    const words = thankYouMessage.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.04 * words.length }
        }
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    } as const;

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
            {/* Background Image */}
            {bgImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 blur-sm scale-105"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            )}
            <div className="absolute inset-0 bg-black/60 z-10" />

            <div className="relative z-20 text-center px-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-full min-h-[80vh]">
                {/* Signature Animation - Huge and Centered */}
                <motion.div
                    className={`${greatVibes.className} text-7xl md:text-9xl lg:text-[10rem] text-white leading-none mb-12 drop-shadow-2xl`}
                    variants={container}
                    initial="hidden"
                    animate="visible"
                >
                    {words.map((word: string, index: number) => (
                        <motion.span variants={child} style={{ marginRight: "0.25em" }} key={index} className="inline-block">
                            {word}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="flex flex-col items-center gap-4"
                >
                    <p className="text-white/50 uppercase tracking-widest text-sm font-bold mb-2">{t.postConference.conferenceLabel}</p>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex flex-row items-center gap-4">
                            {/* Gallery Button */}
                            <Link
                                href="/2025/#gallery"
                                className="group inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105"
                            >
                                <FiImage />
                                <span>{t.postConference.gallery}</span>
                            </Link>

                            {/* Feedback Button */}
                            <Link
                                href="/feedback"
                                className="group inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105"
                            >
                                <FiMessageSquare />
                                <span>{t.postConference.feedback}</span>
                            </Link>
                        </div>

                        {/* Full Site / Archive Button */}
                        <Link
                            href="/2025"
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-primary/25"
                        >
                            <span>{t.postConference.visitFullSite}</span>
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
