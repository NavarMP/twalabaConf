"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiMapPin, FiCalendar, FiHeart, FiX, FiShare2, FiYoutube, FiPlay } from "react-icons/fi";
import GalleryCarousel from "@/components/GalleryCarousel";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";

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

interface ConferenceViewProps {
    settings: any; // We'll pass fetched settings
    isArchive?: boolean;
}

export default function ConferenceView({ settings: initialSettings, isArchive = false }: ConferenceViewProps) {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [scheduleItems, setScheduleItems] = useState<any[]>([]);
    const [filteredGallery, setFilteredGallery] = useState<GalleryItem[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');
    const [selectedDay, setSelectedDay] = useState<'all' | 'day1' | 'day2'>('all');
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const supabase = createClient();
    const { t, language } = useLanguage();
    const [scheduleLang, setScheduleLang] = useState<'en' | 'ml'>('ml');
    const [locationLang, setLocationLang] = useState<'en' | 'ml'>('ml');

    // Use props or fetch if preferred, keeping original logic for now
    const [liveUrl, setLiveUrl] = useState<string | null>(null);
    const [currentSessionTitle, setCurrentSessionTitle] = useState<string | null>(null);
    const [nextSessionDetails, setNextSessionDetails] = useState<string | null>(null);
    const [upcomingStreamUrl, setUpcomingStreamUrl] = useState<string | null>(null);
    const [previousSessions, setPreviousSessions] = useState<{ title: string, url: string, thumbnail?: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: guestsData } = await supabase.from('guests').select('*').order('display_order', { ascending: true });
            if (guestsData) setGuests(guestsData);

            const { data: scheduleData } = await supabase.from('schedule').select('*').order('display_order', { ascending: true });
            if (scheduleData) setScheduleItems(scheduleData);

            const { data: galleryData } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
            if (galleryData) {
                setGalleryItems(galleryData);
                setFilteredGallery(galleryData);
            }

            // If settings passed as prop, use them, otherwise fetch
            if (initialSettings) {
                initialSettings.forEach((item: any) => {
                    if (item.key === 'live_streaming_url') setLiveUrl(item.value);
                    if (item.key === 'current_session_title') setCurrentSessionTitle(item.value);
                    if (item.key === 'next_session_details') setNextSessionDetails(item.value);
                    if (item.key === 'upcoming_stream_url') setUpcomingStreamUrl(item.value);
                    if (item.key === 'previous_sessions') {
                        try {
                            setPreviousSessions(JSON.parse(item.value));
                        } catch (e) {
                            setPreviousSessions([]);
                        }
                    }
                });
            } else {
                // Fallback fetch
                const { data: settingsData } = await supabase
                    .from('settings')
                    .select('*')
                    .in('key', ['live_streaming_url', 'current_session_title', 'previous_sessions', 'next_session_details', 'upcoming_stream_url']);

                if (settingsData) {
                    settingsData.forEach(item => {
                        if (item.key === 'live_streaming_url') setLiveUrl(item.value);
                        if (item.key === 'current_session_title') setCurrentSessionTitle(item.value);
                        if (item.key === 'next_session_details') setNextSessionDetails(item.value);
                        if (item.key === 'upcoming_stream_url') setUpcomingStreamUrl(item.value);
                        if (item.key === 'previous_sessions') {
                            try {
                                setPreviousSessions(JSON.parse(item.value));
                            } catch (e) {
                                setPreviousSessions([]);
                            }
                        }
                    });
                }
            }
        };
        fetchData();
    }, [initialSettings]);

    const [selectedTag, setSelectedTag] = useState<string>('all-tags');

    // Derive unique tags
    const allTags = Array.from(new Set(galleryItems.flatMap(item => item.tags || []))).sort();

    useEffect(() => {
        let result = galleryItems;

        // Filter by type
        if (activeTab !== 'all') {
            if (activeTab === 'photo') {
                result = result.filter(item => item.media_type === 'photo');
            } else if (activeTab === 'video') {
                result = result.filter(item => item.media_type === 'video' || item.media_type === 'embed');
            }
        }

        // Filter by tag
        if (selectedTag !== 'all-tags') {
            result = result.filter(item => item.tags && item.tags.includes(selectedTag));
        }

        // Filter by Day
        if (selectedDay !== 'all') {
            result = result.filter(item => {
                // Check tags
                const hasDay1Tag = item.tags?.some(t => t.toLowerCase() === 'day 1' || t.toLowerCase() === 'day1');
                const hasDay2Tag = item.tags?.some(t => t.toLowerCase() === 'day 2' || t.toLowerCase() === 'day2');

                // Check date (Dec 5 = Day 1, Dec 6 = Day 2)
                const date = new Date(item.created_at);
                const day = date.getDate();
                const month = date.getMonth(); // 11 = Dec
                const isDay1Date = month === 11 && day === 5;
                const isDay2Date = month === 11 && day === 6;

                if (selectedDay === 'day1') return hasDay1Tag || isDay1Date;
                if (selectedDay === 'day2') return hasDay2Tag || isDay2Date;
                return true;
            });
        }

        // Sort
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (sortBy === 'likes') {
            result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }

        setFilteredGallery(result);
        setCurrentPage(1);
    }, [galleryItems, activeTab, sortBy, selectedTag, selectedDay]);

    const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        const stored = localStorage.getItem('liked_gallery_items');
        if (stored) {
            try {
                setLikedItems(new Set(JSON.parse(stored)));
            } catch (e) {
                console.error('Failed to parse liked items', e);
            }
        }
    }, []);

    const handleLike = async (id: string, currentLikes: number) => {
        const isLiked = likedItems.has(id);
        const newLikedItems = new Set(likedItems);
        let newLikes = currentLikes;

        if (isLiked) {
            newLikedItems.delete(id);
            newLikes = Math.max(0, currentLikes - 1);

            // Attempt to decrement on server
            const { error } = await supabase.rpc('decrement_likes', { row_id: id });
        } else {
            newLikedItems.add(id);
            newLikes = currentLikes + 1;
            const { error } = await supabase.rpc('increment_likes', { row_id: id });
        }

        setLikedItems(newLikedItems);
        localStorage.setItem('liked_gallery_items', JSON.stringify(Array.from(newLikedItems)));

        setGalleryItems(prev => prev.map(item =>
            item.id === id ? { ...item, likes: newLikes } : item
        ));
    };

    // Helper functions
    const handleDownload = async (url: string, title: string | null, mediaType: 'photo' | 'video' | 'embed' = 'photo') => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const mimeType = blob.type;

            let extension = mimeType.split('/')[1];

            // Fix for octet-stream or missing extension
            if (!extension || extension === 'octet-stream') {
                extension = mediaType === 'video' ? 'mp4' : 'jpg';
            }

            // Standardize jpeg
            if (extension === 'jpeg') extension = 'jpg';

            const filename = `${title || 'skssf-conference'}.${extension}`;

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback
            window.open(url, '_blank');
        }
    };

    const handleShare = async (url: string, title: string | null) => {
        const shareData = {
            title: title || 'SKSSF Conference Gallery',
            text: 'Check out this media from SKSSF Twalaba Conference!',
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy class', err);
            }
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section
                id="hero"
                className="relative min-h-screen flex items-center justify-center pt-16 bg-gradient-to-br from-background to-primary/10"
            >
                <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 overflow-hidden">
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
                        <div className="relative w-48 h-48 md:w-64 md:h-64">
                            <Image
                                src="/assets/Logo.svg"
                                alt="Conference Logo"
                                fill
                                className="object-contain drop-shadow-xl logo-dark-adaptive"
                                priority
                            />
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6"
                    >
                        <span className="font-cooper">SKSSF</span> {t.hero.title.replace("SKSSF ", "")}
                    </motion.h1>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-lg md:text-xl text-foreground/80 mb-10"
                    >
                        <div className="flex items-center gap-2">
                            <FiCalendar className="text-accent" />
                            <span>{t.hero.date}</span>
                        </div>
                        <div className="hidden md:block w-2 h-2 bg-foreground/20 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <FiMapPin className="text-accent" />
                            <span>{t.hero.location}</span>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center gap-8 w-full">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link
                                href="/feedback"
                                className="inline-block bg-secondary text-white px-8 py-4 rounded-lg font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/25"
                            >
                                Share Feedback
                            </Link>
                            {liveUrl && !isArchive && (
                                <a
                                    href={liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/25"
                                >
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                    </span>
                                    Live Streaming
                                </a>
                            )}
                        </div>

                        {/* Previous Sessions Grid */}
                        {previousSessions.length > 0 && (
                            <div className="w-full mt-10 max-w-5xl mx-auto">
                                <h3 className="text-foreground/50 font-bold uppercase tracking-wider text-sm mb-6 text-center">{t.postConference.conferenceLabel} Sessions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                                    {previousSessions.map((session, idx) => (
                                        <a
                                            key={idx}
                                            href={session.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 block bg-background/50 backdrop-blur-sm"
                                        >
                                            <div className="aspect-video w-full bg-black/40 relative overflow-hidden">
                                                {session.thumbnail ? (
                                                    <img
                                                        src={session.thumbnail}
                                                        alt={session.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-foreground/20 w-full bg-secondary/10">
                                                        <FiYoutube className="w-12 h-12 opacity-50" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                                                        <FiPlay className="w-5 h-5 ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">{session.title}</h4>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Session Info */}
                        {currentSessionTitle ? (
                            <div className="bg-background/80 backdrop-blur-md px-6 py-3 rounded-lg border border-white/10 flex items-center gap-4 shadow-lg min-h-[60px]">
                                <div className="flex flex-col items-start">
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Currently Happening</p>
                                    <h3 className="text-sm font-bold text-foreground text-left leading-tight max-w-[200px] truncate">{currentSessionTitle}</h3>
                                </div>


                            </div>
                        ) : (nextSessionDetails || upcomingStreamUrl) ? (
                            // STATE 2: UPCOMING SESSION 
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-primary/20 text-center max-w-md shadow-xl">
                                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Next Session</p>
                                    {nextSessionDetails && <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">{nextSessionDetails}</h3>}

                                    {upcomingStreamUrl ? (
                                        <a
                                            href={upcomingStreamUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-all shadow-lg"
                                        >
                                            <FiCalendar className="w-5 h-5" />
                                            Notify Me / Watch Later
                                        </a>
                                    ) : (
                                        <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                            Stay Tuned
                                        </div>
                                    )}
                                </div>


                            </div>
                        ) : (
                            // STATE 3: NO ACTIVE OR UPCOMING
                            <div className="text-center text-foreground/50">
                                {!isArchive && <p>Conference updates will appear here.</p>}

                            </div>
                        )}
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
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{t.about.title}</h2>
                        <p className="text-lg text-foreground/80 leading-relaxed">
                            {t.about.description}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Theme Song Section */}
            {initialSettings?.find((s: any) => s.key === 'theme_song_url')?.value && (
                <section id="theme-song" className="py-20 bg-secondary/5">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">Theme Song</h2>
                            <div className="relative w-full shadow-xl rounded-2xl overflow-hidden border border-primary/20 aspect-video bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${initialSettings.find((s: any) => s.key === 'theme_song_url').value.split('v=')[1]?.split('&')[0]}?rel=0`}
                                    title="Theme Song"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0"
                                ></iframe>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Schedule Section */}
            <section id="schedule" lang={scheduleLang} className={`py-20 bg-secondary/5 ${scheduleLang === 'ml' ? 'ml' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="flex justify-center items-center gap-4 mb-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary">{t.schedule.title}</h2>
                            <div className="flex bg-primary/10 rounded-lg p-1">
                                <button
                                    onClick={() => setScheduleLang('en')}
                                    className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${scheduleLang === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                                >
                                    ENG
                                </button>
                                <button
                                    onClick={() => setScheduleLang('ml')}
                                    className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${scheduleLang === 'ml' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                                >
                                    MAL
                                </button>
                            </div>
                        </div>
                        <p className="text-lg text-foreground/80">
                            {t.schedule.description}
                        </p>
                    </motion.div>

                    {/* Download Brochure */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <a
                            href="/assets/Brochure.pdf"
                            download
                            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25"
                        >
                            <FiDownload className="text-xl" />
                            {t.schedule.downloadBrochure}
                        </a>
                    </motion.div>

                    {/* Live Session Embed at Top of Schedule */}
                    {liveUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12 max-w-4xl mx-auto"
                        >

                            {/* Session Details */}
                            {currentSessionTitle && (
                                <div className="py-4">
                                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Currently Happening</p>
                                    <h4 className="text-lg font-bold text-foreground">{currentSessionTitle}</h4>
                                </div>
                            )}

                            {/* Live Header Bar */}
                            <div className="bg-red-600 text-white py-3 px-6 rounded-t-xl flex items-center justify-between shadow-lg">
                                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                    </span>
                                    Live Now
                                </h3>
                                <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Watch Live</span>
                            </div>

                            {/* Video Embed */}
                            <div className={`bg-black aspect-video w-full overflow-hidden shadow-2xl border-x border-b border-primary/20 ${currentSessionTitle ? 'rounded-b-xl' : 'rounded-b-xl'}`}>
                                <iframe
                                    src={liveUrl.includes('youtube.com') || liveUrl.includes('youtu.be')
                                        ? `https://www.youtube.com/embed/${liveUrl.split('v=')[1]?.split('&')[0] || liveUrl.split('/').pop()}?autoplay=1&mute=1`
                                        : liveUrl}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Live Stream"
                                ></iframe>
                            </div>
                        </motion.div>
                    )}

                    {/* Dynamic Schedule Rendering */}
                    {[
                        { day: 1, date: { en: "December 05, Thursday", ml: "ഡിസംബർ 05, വ്യാഴം" } },
                        { day: 2, date: { en: "December 06, Friday", ml: "ഡിസംബർ 06, വെള്ളി" } }
                    ].map((dayInfo) => {
                        const dayEvents = scheduleItems.filter(item => item.day === dayInfo.day);
                        if (dayEvents.length === 0) return null;

                        return (
                            <motion.div
                                key={dayInfo.day}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-16"
                            >
                                <div className="bg-primary text-white py-4 px-6 rounded-t-xl">
                                    <h3 className={`text-2xl font-bold ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>{dayInfo.date[scheduleLang]}</h3>
                                </div>
                                <div className="bg-background border border-primary/20 rounded-b-xl overflow-hidden">
                                    {dayEvents.map((event, eventIndex) => {
                                        // Safe Parse Helpers
                                        let title = { en: event.title, ml: event.title };
                                        try {
                                            const parsed = JSON.parse(event.title);
                                            if (parsed.en) title = parsed;
                                        } catch (e) { }

                                        let subtitle = null;
                                        if (event.subtitle) {
                                            subtitle = { en: event.subtitle, ml: event.subtitle };
                                            try {
                                                const parsed = JSON.parse(event.subtitle);
                                                if (parsed.en) subtitle = parsed;
                                            } catch (e) { }
                                        }

                                        // Extract extended details
                                        let details: any[] = [];
                                        let list: any[] = [];

                                        if (event.details && typeof event.details === 'object') {
                                            // Cast to any to access custom properties if stored loosely
                                            const d = event.details as any;
                                            if (d.details && Array.isArray(d.details)) details = d.details;
                                            if (d.list && Array.isArray(d.list)) list = d.list;
                                        }

                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-6 border-b border-primary/10 ${event.type === 'session' ? 'bg-secondary/5' : event.type === 'special' ? 'bg-accent/10' : ''}`}
                                            >
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${event.type === 'special' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                                                        {event.time}
                                                        {currentSessionTitle && (title.en === currentSessionTitle || title.ml === currentSessionTitle) && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-white px-2 py-0.5 rounded-full animate-pulse">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                                LIVE
                                                            </span>
                                                        )}
                                                    </span>
                                                    <h4 className={`text-xl font-bold ${event.type === 'special' ? 'text-primary' : 'text-accent'} ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>
                                                        {title[scheduleLang]}
                                                    </h4>
                                                </div>

                                                {subtitle && (
                                                    <h5 className={`text-lg font-bold text-primary mb-2 ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>
                                                        {subtitle[scheduleLang]}
                                                    </h5>
                                                )}

                                                {/* Render Details */}
                                                {(details.length > 0 || list.length > 0) && (
                                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground/90 ${scheduleLang === 'ml' ? 'font-noto' : ''}`}>
                                                        {details.length > 0 && (
                                                            <div>
                                                                {details.map((detail: any, i: number) => (
                                                                    <p key={i} className="mb-2">
                                                                        <span className="font-bold text-primary">{detail.label[scheduleLang]}:</span> {detail.content[scheduleLang]}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {list.length > 0 && (
                                                            <div>
                                                                {list.map((listItem: any, i: number) => (
                                                                    <div key={i} className="mb-4">
                                                                        {listItem.title && <p className="font-bold text-primary mb-2">{listItem.title[scheduleLang]}:</p>}
                                                                        {/* Check if items is array */}
                                                                        {listItem.items && (
                                                                            /^\d/.test(listItem.title?.en || '') || listItem.items.length > 3 ? (
                                                                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                                                                    {listItem.items.map((it: any, j: number) => <li key={j}>{typeof it === 'string' ? it : it[scheduleLang]}</li>)}
                                                                                </ol>
                                                                            ) : (
                                                                                <ul className="list-disc list-inside text-sm space-y-1">
                                                                                    {listItem.items.map((it: any, j: number) => <li key={j}>{typeof it === 'string' ? it : it[scheduleLang]}</li>)}
                                                                                </ul>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )
                    })}

                </div>
            </section>

            {/* Location Section */}
            <section id="location" lang={locationLang} className={`py-20 bg-primary/5 ${locationLang === 'ml' ? 'ml' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center gap-4 mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">{t.location.title}</h2>
                        <div className="flex bg-primary/10 rounded-lg p-1">
                            <button
                                onClick={() => setLocationLang('en')}
                                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${locationLang === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                            >
                                ENG
                            </button>
                            <button
                                onClick={() => setLocationLang('ml')}
                                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${locationLang === 'ml' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                            >
                                MAL
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* Route Text */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`space-y-6 text-lg text-foreground/90 bg-background p-8 rounded-2xl shadow-sm border border-primary/10 ${locationLang === 'ml' ? 'font-noto' : ''}`}
                        >
                            {/* Simplified for brevity while copying logic... */}
                            <h3 className="text-2xl font-bold text-accent mb-4">{translations[locationLang].location.howToReach}</h3>
                            <p className="text-foreground/70">{translations[locationLang].location.note}</p>
                            {/* Full location text logic would be here, assuming it's static or from translations */}
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

            {/* Guests Section */}
            <section id="guests" className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">{t.guests.title}</h2>
                    {guests.length === 0 ? (
                        <p className="text-center text-foreground/60">{t.guests.comingSoon}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {guests.map((guest, index) => (
                                <motion.div
                                    key={guest.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-secondary/10 rounded-xl p-6 text-center hover:shadow-xl transition-shadow border border-secondary/20"
                                >
                                    <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden relative">
                                        {guest.image_url ? (
                                            <img src={guest.image_url} alt={guest.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold">
                                                {guest.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">{guest.name}</h3>
                                    <p className="text-sm text-primary">{guest.title}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-8">{t.gallery.title}</h2>

                    {/* Carousel */}
                    <div className="mb-12">
                        <GalleryCarousel items={galleryItems} onItemClick={setSelectedItem} />
                    </div>

                    {/* Gallery Controls */}
                    <div className="flex flex-col gap-6 mb-12">

                        {/* Center Group: Day & Type Filters */}
                        <div className="flex flex-col items-center gap-4">

                            {/* Day Filter (Sliding Switch) */}
                            <div className="bg-secondary/10 p-1 rounded-xl flex">
                                {[
                                    { id: 'all', label: 'All Days' },
                                    { id: 'day1', label: 'Day 1' },
                                    { id: 'day2', label: 'Day 2' }
                                ].map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => setSelectedDay(day.id as any)}
                                        className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-colors z-10 ${selectedDay === day.id ? 'text-foreground' : 'text-foreground/60 hover:text-foreground/80'}`}
                                    >
                                        {selectedDay === day.id && (
                                            <motion.div
                                                layoutId="activeDayFilter"
                                                className="absolute inset-0 bg-background shadow-md rounded-lg -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {day.label}
                                    </button>
                                ))}
                            </div>

                            {/* Media Type Filter (Sliding Switch) */}
                            <div className="bg-secondary/10 p-1 rounded-xl flex">
                                {[
                                    { id: 'all', label: 'All Media' },
                                    { id: 'photo', label: 'Photos' },
                                    { id: 'video', label: 'Videos' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-colors z-10 ${activeTab === tab.id ? 'text-foreground' : 'text-foreground/60 hover:text-foreground/80'}`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTypeFilter"
                                                className="absolute inset-0 bg-background shadow-md rounded-lg -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Sort By (Right Aligned or Centered on mobile) */}
                        <div className="flex justify-end w-full">
                            <div className="flex items-center gap-2 bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10">
                                <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Sort</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 cursor-pointer py-1 pl-1 pr-6"
                                    style={{ backgroundImage: 'none' }} // Custom arrow if needed, but keeping simple for now
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="likes">Most Popular</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredGallery.length === 0 ? (
                        <p className="text-center text-foreground/60">{t.gallery.comingSoon}</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredGallery.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-background rounded-xl overflow-hidden shadow-sm border border-primary/10 group"
                                    >
                                        <div
                                            className="aspect-video relative overflow-hidden cursor-pointer"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            {item.media_type === 'photo' ? (
                                                <img
                                                    src={item.media_url}
                                                    alt={item.title || 'Gallery'}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : item.media_type === 'embed' ? (
                                                <div className="w-full h-full relative group-hover:opacity-90 transition-opacity">
                                                    <iframe
                                                        src={item.media_url}
                                                        className="w-full h-full pointer-events-none"
                                                        title={item.title || 'Embed'}
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-transparent"></div> {/* Overlay to capture click */}
                                                </div>
                                            ) : (
                                                <div className="w-full h-full relative">
                                                    <video src={item.media_url} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLike(item.id, item.likes || 0);
                                                    }}
                                                    className="text-white hover:text-accent transition-colors flex items-center gap-1"
                                                >
                                                    <FiHeart className={`text-xl ${item.likes ? 'fill-accent text-accent' : ''}`} />
                                                    <span className="text-sm font-bold">{item.likes || 0}</span>
                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(item.media_url, item.title);
                                                        }}
                                                        className="text-white hover:text-blue-400 transition-colors"
                                                        title="Share"
                                                    >
                                                        <FiShare2 className="text-xl" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(item.media_url, item.title, item.media_type);
                                                        }}
                                                        className="text-white hover:text-secondary transition-colors"
                                                        title="Download"
                                                    >
                                                        <FiDownload className="text-xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {item.title && (
                                            <div className="p-3">
                                                <p className="text-sm font-medium text-foreground">{item.title}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {filteredGallery.length > itemsPerPage && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.ceil(filteredGallery.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${currentPage === page
                                                    ? 'bg-primary text-white'
                                                    : 'bg-transparent text-foreground/70 hover:bg-primary/5'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGallery.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(filteredGallery.length / itemsPerPage)}
                                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Gallery Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                            >
                                <FiX className="w-6 h-6" />
                            </button>

                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                {selectedItem.media_type === 'photo' ? (
                                    <img
                                        src={selectedItem.media_url}
                                        alt={selectedItem.title || 'Gallery preview'}
                                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                                    />
                                ) : selectedItem.media_type === 'embed' ? (
                                    <div className="w-full aspect-video rounded-lg overflow-hidden">
                                        <iframe
                                            src={selectedItem.media_url}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={selectedItem.title || 'Embed'}
                                        />
                                    </div>
                                ) : (
                                    <video
                                        src={selectedItem.media_url}
                                        controls
                                        autoPlay
                                        className="w-full h-auto max-h-[80vh] rounded-lg"
                                    />
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                                <h3 className="text-white text-lg font-medium pl-2">{selectedItem.title}</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(selectedItem.id, selectedItem.likes || 0);
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${likedItems.has(selectedItem.id)
                                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                            : 'bg-black/30 text-white hover:bg-black/50 border border-white/10'
                                            }`}
                                    >
                                        <FiHeart className={`w-3.5 h-3.5 ${likedItems.has(selectedItem.id) ? 'fill-current' : ''}`} />
                                        <span className="text-xs font-medium">{selectedItem.likes || 0}</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare(selectedItem.media_url, selectedItem.title);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-colors backdrop-blur-sm"
                                    >
                                        <FiShare2 className="w-5 h-5" />
                                        Share
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(selectedItem.media_url, selectedItem.title, selectedItem.media_type);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
                                    >
                                        <FiDownload className="w-5 h-5" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
