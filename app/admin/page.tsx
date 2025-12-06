'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FiUsers, FiCalendar, FiImage, FiLogOut, FiHome, FiSettings, FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from 'next-themes'

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/admin/login')
            } else {
                setLoading(false)
            }
        }
        checkUser()
    }, [router, supabase.auth])

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const menuItems = [
        { href: '/admin/guests', icon: FiUsers, label: 'Guests', description: 'Manage distinguished guests' },
        { href: '/admin/schedule', icon: FiCalendar, label: 'Schedule', description: 'Edit program schedule' },
        { href: '/admin/gallery', icon: FiImage, label: 'Gallery', description: 'Manage photos & videos' },
        { href: '/admin/settings', icon: FiSettings, label: 'Settings', description: 'Manage site settings' },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary text-white py-4 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-white/70 text-sm">SKSSF Twalaba Conference 2025</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                            </button>
                        )}
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <FiHome className="w-5 h-5" />
                            <span>View Site</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors"
                        >
                            <FiLogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-6">

                {/* Notification Broadcaster */}
                <div className="mb-12 bg-primary/5 border border-primary/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <FiSettings className="w-5 h-5 text-primary" />
                        Broadcast Notification
                    </h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Message</label>
                            <input
                                type="text"
                                id="notification-input"
                                placeholder="e.g. Session 3 Starting Now!"
                                className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background"
                            />
                        </div>
                        <button
                            onClick={async () => {
                                const input = document.getElementById('notification-input') as HTMLInputElement;
                                if (!input.value) return;

                                const payload = {
                                    message: input.value,
                                    timestamp: Date.now(),
                                    id: crypto.randomUUID()
                                };

                                const { error } = await supabase.from('settings').upsert({
                                    key: 'notification_broadcast',
                                    value: JSON.stringify(payload)
                                });

                                if (!error) {
                                    alert('Notification Sent!');
                                    input.value = '';
                                } else {
                                    alert('Error: ' + error.message);
                                }
                            }}
                            className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Send Alert
                        </button>
                    </div>
                    <p className="text-xs text-foreground/50 mt-2">
                        This will show a toast notification to all currently open users.
                    </p>
                </div>

                <h2 className="text-xl font-semibold text-foreground mb-8">Manage Content</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group p-6 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                            </div>
                            <p className="text-foreground/60">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
