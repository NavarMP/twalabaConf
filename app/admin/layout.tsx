'use client';

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FiHome, FiLogOut, FiSun, FiMoon, FiMonitor } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const supabase = createClient()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="bg-primary text-white py-4 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative hidden sm:block">
                            <Image src="/assets/Logo.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                            <p className="text-white/70 text-sm">SKSSF Twalaba Conference 2025</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        {mounted && (
                            <div className="flex bg-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`p-1.5 rounded-md flex justify-center transition-colors ${theme === 'system' ? 'bg-white text-primary shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    title="System Theme"
                                >
                                    <FiMonitor className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-1.5 rounded-md flex justify-center transition-colors ${theme === 'light' ? 'bg-white text-primary shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    title="Light Theme"
                                >
                                    <FiSun className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-1.5 rounded-md flex justify-center transition-colors ${theme === 'dark' ? 'bg-white text-primary shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    title="Dark Theme"
                                >
                                    <FiMoon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                        >
                            <FiHome className="w-4 h-4" />
                            <span className="hidden sm:inline">View Site</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors text-sm"
                        >
                            <FiLogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    )
}
