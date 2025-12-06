"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DockNav from "./DockNav";
import TopMenu from "./TopMenu";
import Search from "./Search";
import { createClient } from "@/lib/supabase/client";
import { Guest, GalleryItem } from "@/types/database";

export default function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data for search
    const [guests, setGuests] = useState<Guest[]>([]);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const supabase = createClient();

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Fetch data for search
        const fetchData = async () => {
            const { data: guestsData } = await supabase.from('guests').select('*');
            if (guestsData) setGuests(guestsData);

            const { data: galleryData } = await supabase.from('gallery').select('*');
            if (galleryData) setGalleryItems(galleryData);
        };
        fetchData();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Logo - Top Left */}
            <div
                className={`fixed top-6 left-6 z-50 transition-all duration-300 ${scrolled ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'
                    }`}
            >
                <Link href="/" onClick={() => window.scrollTo(0, 0)}>
                    <div className="relative h-12 w-12 drop-shadow-lg cursor-pointer hover:scale-105 transition-transform">
                        <Image
                            src="/assets/Logo.svg"
                            alt="SKSSF Twalaba Conf Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>
            </div>

            <DockNav />
            <TopMenu onSearchClick={() => setIsSearchOpen(true)} />

            <Search
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                guests={guests}
                galleryItems={galleryItems}
            />
        </>
    );
}
