"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GalleryItem } from "@/types/database";
import { useState, useEffect } from "react";

interface GalleryCarouselProps {
    items: GalleryItem[];
    onItemClick: (item: GalleryItem) => void;
}

export default function GalleryCarousel({ items, onItemClick }: GalleryCarouselProps) {
    // 1. Filter for carousel tag
    let carouselItems = items.filter(item =>
        item.tags && item.tags.some(t => t.toLowerCase() === 'carousel')
    );

    // Fallback: If no carousel items, take top 5 newest photos
    if (carouselItems.length === 0) {
        carouselItems = items
            .filter(item => item.media_type === 'photo')
            .slice(0, 5);
    }

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (carouselItems.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
        }, 3000); // 3 seconds

        return () => clearInterval(timer);
    }, [carouselItems.length]);

    if (carouselItems.length === 0) return null;

    return (
        <div className="w-full relative h-[300px] md:h-[400px] lg:h-[500px] bg-black/5 rounded-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={carouselItems[currentIndex].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onItemClick(carouselItems[currentIndex])}
                >
                    <img
                        src={carouselItems[currentIndex].media_url}
                        alt={carouselItems[currentIndex].title || "Gallery Highlight"}
                        className="w-full h-full object-contain bg-black/90 backdrop-blur-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        {carouselItems[currentIndex].title && (
                            <h3 className="text-white text-xl md:text-2xl font-bold">{carouselItems[currentIndex].title}</h3>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            {carouselItems.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    {carouselItems.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
