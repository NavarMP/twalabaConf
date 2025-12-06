'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiShare, FiPlusSquare, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Register Service Worker manually to bypass next-pwa build issues with path
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered', reg))
                .catch(err => console.error('SW failed', err));
        }

        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // Handle beforeinstallprompt for Android/Desktop
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a small delay to not annoy immediately
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show prompt if not in standalone
        if (isIosDevice && !isStandalone) {
            // Check if we've shown it recently (session storage)
            const hasShown = sessionStorage.getItem('pwa-prompt-shown');
            if (!hasShown) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleClose = () => {
        setShowPrompt(false);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
    }

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
                >
                    <div className="bg-background-elevated bg-white dark:bg-gray-900 border border-primary/20 rounded-xl shadow-2xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-accent"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 p-1 text-foreground/50 hover:text-foreground transition-colors"
                        >
                            <FiX />
                        </button>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <FiDownload className="text-2xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">Install App</h3>
                                <p className="text-sm text-foreground/70 mb-3">
                                    {isIOS
                                        ? "Install this web app on your iPhone for the best experience."
                                        : "Install our app for easier access and a better experience."}
                                </p>

                                {isIOS ? (
                                    <div className="text-xs bg-secondary/10 p-2 rounded border border-secondary/20">
                                        <p className="flex items-center gap-2 mb-1">
                                            1. Tap the <FiShare className="text-blue-500" /> Share button
                                        </p>
                                        <p className="flex items-center gap-2">
                                            2. Select <FiPlusSquare /> Add to Home Screen
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleInstallClick}
                                        className="w-full py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Install Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
