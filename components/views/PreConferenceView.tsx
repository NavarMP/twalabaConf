"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiMapPin, FiMusic, FiChevronRight, FiX } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

interface PreConferenceViewProps {
    settings: any;
}

export default function PreConferenceView({ settings }: PreConferenceViewProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [regForm, setRegForm] = useState({ name: '', phone: '', city: '' });
    const [regStatus, setRegStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const supabase = createClient();

    const conferenceDateStr = settings?.find((s: any) => s.key === 'conference_date')?.value || '2025-12-05T09:00:00';
    const themeSongUrl = settings?.find((s: any) => s.key === 'theme_song_url')?.value;

    useEffect(() => {
        const targetDate = new Date(conferenceDateStr);

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [conferenceDateStr]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegStatus('submitting');

        // Basic Validation
        if (!regForm.name || !regForm.phone || !regForm.city) {
            setRegStatus('error');
            return;
        }

        const { error } = await supabase.from('registrations').insert([
            { ...regForm, created_at: new Date().toISOString() }
        ]);

        if (error) {
            console.error(error);
            setRegStatus('error');
        } else {
            setRegStatus('success');
            setRegForm({ name: '', phone: '', city: '' });
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center pt-20 pb-20">

            {/* Hero Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-4 max-w-4xl mx-auto w-full"
            >
                <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-8">
                    <Image
                        src="/assets/Logo.svg"
                        alt="Conference Logo"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6 tracking-tight">
                    <span className="font-cooper">SKSSF</span><br />
                    Twalaba Conference '25
                </h1>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-xl text-foreground/70 mb-12 font-medium">
                    <div className="flex items-center gap-2">
                        <FiCalendar className="text-accent" />
                        <span>Dec 05, 06</span>
                    </div>
                    <div className="hidden md:block w-2 h-2 bg-foreground/20 rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <FiMapPin className="text-accent" />
                        <span>Edavanna, Malappuram</span>
                    </div>
                </div>

                {/* Countdown */}
                {timeLeft && (
                    <div className="grid grid-cols-4 gap-4 md:gap-8 mb-16 max-w-3xl mx-auto">
                        {[
                            { label: "Days", value: timeLeft.days },
                            { label: "Hours", value: timeLeft.hours },
                            { label: "Minutes", value: timeLeft.minutes },
                            { label: "Seconds", value: timeLeft.seconds },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center p-4 bg-secondary/5 rounded-2xl border border-secondary/10 shadow-sm">
                                <span className="text-3xl md:text-5xl font-bold text-primary font-mono">{String(item.value).padStart(2, '0')}</span>
                                <span className="text-xs md:text-sm text-foreground/50 uppercase tracking-widest mt-2">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Actions / Registration Form */}
                <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto">
                    {!isRegOpen ? (
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button
                                onClick={() => setIsRegOpen(true)}
                                className="group relative px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all overflow-hidden w-full sm:w-auto flex justify-center items-center"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Register Now <FiChevronRight />
                                </span>
                            </button>
                            {themeSongUrl && (
                                <a
                                    href={themeSongUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-secondary/10 text-secondary rounded-xl font-bold text-lg hover:bg-secondary/20 transition-colors w-full sm:w-auto"
                                >
                                    <FiMusic /> Theme Song
                                </a>
                            )}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-background border border-primary/20 p-6 rounded-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-primary">Registration</h3>
                                <button onClick={() => setIsRegOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><FiX /></button>
                            </div>

                            {regStatus === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiChevronRight className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-green-600 mb-2">Registered Successfully!</h4>
                                    <p className="text-foreground/60">We will contact you soon.</p>
                                    <button onClick={() => setIsRegOpen(false)} className="mt-6 text-primary font-bold hover:underline">Close</button>
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4 text-left">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-foreground/50 block mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={regForm.name}
                                            onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-secondary/5 border border-secondary/10 focus:border-primary outline-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-foreground/50 block mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={regForm.phone}
                                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-secondary/5 border border-secondary/10 focus:border-primary outline-none"
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-foreground/50 block mb-1">City / District</label>
                                        <input
                                            type="text"
                                            required
                                            value={regForm.city}
                                            onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-secondary/5 border border-secondary/10 focus:border-primary outline-none"
                                            placeholder="e.g. Malappuram"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={regStatus === 'submitting'}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 mt-4"
                                    >
                                        {regStatus === 'submitting' ? 'Submitting...' : 'Confirm Registration'}
                                    </button>
                                    {regStatus === 'error' && <p className="text-red-500 text-sm text-center">Something went wrong. Try again.</p>}
                                </form>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
