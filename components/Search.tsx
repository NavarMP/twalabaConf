"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { scheduleData } from "@/lib/data/scheduleData";
import { Guest, GalleryItem } from "@/types/database";

type SearchProps = {
    isOpen: boolean;
    onClose: () => void;
    guests: Guest[];
    galleryItems: GalleryItem[];
};

type SearchResult = {
    id: string;
    type: 'schedule' | 'guest' | 'gallery';
    title: string;
    subtitle?: string;
    link?: string;
};

export default function Search({ isOpen, onClose, guests, galleryItems }: SearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const { language, t } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const newResults: SearchResult[] = [];

        // Search Schedule
        scheduleData.forEach((day, dayIndex) => {
            day.events.forEach((event, eventIndex) => {
                const title = event.title[language] || event.title.en;
                const subtitle = event.subtitle ? (event.subtitle[language] || event.subtitle.en) : "";

                if (title.toLowerCase().includes(lowerQuery) || subtitle.toLowerCase().includes(lowerQuery)) {
                    newResults.push({
                        id: `schedule-${dayIndex}-${eventIndex}`,
                        type: 'schedule',
                        title: title,
                        subtitle: `${day.date[language]} - ${event.time}`,
                        link: '#schedule'
                    });
                }

                // Search details
                event.details?.forEach(detail => {
                    const content = detail.content[language] || detail.content.en;
                    if (content.toLowerCase().includes(lowerQuery)) {
                        newResults.push({
                            id: `schedule-detail-${dayIndex}-${eventIndex}-${content}`,
                            type: 'schedule',
                            title: content,
                            subtitle: `${title} (${detail.label[language]})`,
                            link: '#schedule'
                        });
                    }
                });

                // Search lists
                event.list?.forEach(list => {
                    list.items.forEach(item => {
                        const itemText = item[language] || item.en;
                        if (itemText.toLowerCase().includes(lowerQuery)) {
                            newResults.push({
                                id: `schedule-list-${dayIndex}-${eventIndex}-${itemText}`,
                                type: 'schedule',
                                title: itemText,
                                subtitle: `${title}`,
                                link: '#schedule'
                            });
                        }
                    })
                })
            });
        });

        // Search Guests
        guests.forEach(guest => {
            if (guest.name.toLowerCase().includes(lowerQuery) || (guest.title && guest.title.toLowerCase().includes(lowerQuery))) {
                newResults.push({
                    id: `guest-${guest.id}`,
                    type: 'guest',
                    title: guest.name,
                    subtitle: guest.title || t.guests.title,
                    link: '#guests'
                });
            }
        });

        // Search Gallery
        galleryItems.forEach(item => {
            if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
                newResults.push({
                    id: `gallery-${item.id}`,
                    type: 'gallery',
                    title: item.title,
                    subtitle: t.gallery.title,
                    link: '#gallery'
                });
            }
        });

        setResults(newResults);
    }, [query, guests, galleryItems, language, t]);

    const handleResultClick = (link?: string) => {
        if (link) {
            const element = document.querySelector(link);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        onClose();
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
                >
                    <div className="w-full max-w-2xl bg-secondary/10 rounded-2xl shadow-2xl border border-primary/20 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 flex items-center gap-4 border-b border-primary/10">
                            <FiSearch className="text-2xl text-primary" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search schedule, guests, gallery..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-xl text-foreground placeholder:text-foreground/50"
                            />
                            <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                                <FiX className="text-2xl text-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {results.length > 0 ? (
                                <div className="space-y-2">
                                    {results.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result.link)}
                                            className="w-full text-left p-4 rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <h4 className="font-bold text-lg text-primary group-hover:text-accent transition-colors">{result.title}</h4>
                                                <p className="text-sm text-foreground/70">{result.subtitle}</p>
                                            </div>
                                            <span className="text-xs uppercase font-bold bg-secondary/20 text-secondary px-2 py-1 rounded">
                                                {result.type}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : query.trim() ? (
                                <div className="text-center py-12 text-foreground/50">
                                    No results found for "{query}"
                                </div>
                            ) : (
                                <div className="text-center py-12 text-foreground/50">
                                    Start typing to search...
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
