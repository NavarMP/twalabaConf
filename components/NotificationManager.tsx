'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiBell, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationPayload = {
    message: string;
    timestamp: number;
    id: string;
};

export default function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [showToast, setShowToast] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<NotificationPayload | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }

        // Subscribe to changes in settings table
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'settings',
                    filter: 'key=eq.notification_broadcast'
                },
                (payload) => {
                    const newData = payload.new as { value: string };
                    try {
                        const parsed = JSON.parse(newData.value) as NotificationPayload;

                        // Check if this is a fresh notification (within last 5 minutes)
                        // to avoid re-showing old messages on page load if we were fetching initially,
                        // but here we are listening to REALTIME updates, so it's always "new" event.
                        // However, we check timestamp just in case.
                        if (Date.now() - parsed.timestamp < 300000) { // 5 mins
                            handleNewNotification(parsed);
                        }
                    } catch (e) {
                        console.error('Failed to parse notification', e);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNewNotification = (notification: NotificationPayload) => {
        setCurrentNotification(notification);
        setShowToast(true);

        // System Notification
        if (Notification.permission === 'granted') {
            new Notification('SKSSF Conference Update', {
                body: notification.message,
                icon: '/assets/Logo.svg' // Assuming logo exists
            });
        }
    };

    const requestPermission = async () => {
        if (!('Notification' in window)) return;
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            new Notification('Notifications Enabled', {
                body: 'You will now receive conference updates.',
                icon: '/assets/Logo.svg'
            });
        }
    };

    // Auto-hide toast
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    return (
        <>
            {/* Permission Request Floating Button - Only if default */}
            {permission === 'default' && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={requestPermission}
                    className="fixed bottom-24 left-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all group"
                    title="Enable Notifications"
                >
                    <FiBell className="w-6 h-6 group-hover:animate-swing" />
                    <span className="absolute left-full ml-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        Get Updates
                    </span>
                </motion.button>
            )}

            {/* In-App Toast */}
            <AnimatePresence>
                {showToast && currentNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md"
                    >
                        <div className="bg-background/80 backdrop-blur-md border border-primary/20 text-foreground p-4 rounded-2xl shadow-2xl flex items-start gap-3">
                            <div className="bg-accent/20 p-2 rounded-full text-accent mt-0.5">
                                <FiBell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-primary uppercase mb-1">Update</h4>
                                <p className="text-sm font-medium leading-relaxed">
                                    {currentNotification.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowToast(false)}
                                className="text-foreground/40 hover:text-foreground transition-colors p-1"
                            >
                                <FiX />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
