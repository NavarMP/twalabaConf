'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiHome, FiLock, FiAlertCircle } from 'react-icons/fi'
import { Feedback } from '@/types/database'
import FeedbackList from '@/components/feedback/FeedbackList'
import StatCard from '@/components/feedback/StatCard'
import { exportToCSV, exportAllPDF } from '@/lib/utils/export'
import ExportDropdown from '@/components/feedback/ExportDropdown'

export default function ResultsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [accessCode, setAccessCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [stats, setStats] = useState({
        total: 0,
        overall: 0,
        sessions: 0,
        media: 0,
        volunteers: 0,
        venue: 0,
    })

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to unlock dashboard')
            }

            const feedbackData = data.feedbacks as Feedback[]
            setFeedbacks(feedbackData)

            // Calculate stats
            const total = feedbackData.length
            if (total > 0) {
                setStats({
                    total,
                    overall: feedbackData.reduce((acc, f) => acc + f.overall_rating, 0) / total,
                    sessions: feedbackData.filter(f => f.sessions_rating).reduce((acc, f) => acc + (f.sessions_rating || 0), 0) / feedbackData.filter(f => f.sessions_rating).length || 0,
                    media: feedbackData.filter(f => f.media_rating).reduce((acc, f) => acc + (f.media_rating || 0), 0) / feedbackData.filter(f => f.media_rating).length || 0,
                    volunteers: feedbackData.filter(f => f.volunteers_rating).reduce((acc, f) => acc + (f.volunteers_rating || 0), 0) / feedbackData.filter(f => f.volunteers_rating).length || 0,
                    venue: feedbackData.filter(f => f.venue_rating).reduce((acc, f) => acc + (f.venue_rating || 0), 0) / feedbackData.filter(f => f.venue_rating).length || 0,
                })
            }

            setIsAuthenticated(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 relative mx-auto mb-4">
                            <Image src="/assets/Logo.svg" alt="Logo" fill className="object-contain logo-dark-adaptive" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Feedback Results</h1>
                        <p className="text-foreground/60">Enter access code to view results</p>
                    </div>

                    <form onSubmit={handleUnlock} className="bg-background border border-primary/20 rounded-2xl p-6 shadow-xl">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-foreground/70 mb-1">Access Code</label>
                            <input
                                type="password"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                placeholder="Enter code..."
                                required
                            />
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-500 text-sm">
                                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiLock className="w-4 h-4" />
                                    Unlock Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <Link href="/" className="text-sm text-foreground/50 hover:text-primary transition-colors flex items-center justify-center gap-2">
                            <FiHome className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-green-600 text-white py-4 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative hidden sm:block">
                            <Image src="/assets/Logo.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Results Dashboard</h1>
                            <p className="text-white/80 text-xs">Read-Only View</p>
                        </div>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm flex items-center gap-2">
                        <FiHome className="w-4 h-4" />
                        Home
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Stats Overview */}
                {stats.total > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">Average Ratings ({stats.total} responses)</h2>
                            <div className="flex items-center gap-2">
                                <ExportDropdown
                                    onExportCSV={() => exportToCSV(feedbacks)}
                                    onExportPDF={() => exportAllPDF(feedbacks)}
                                    label="Export All"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <StatCard label="Overall" value={stats.overall} />
                            <StatCard label="Sessions" value={stats.sessions} />
                            <StatCard label="Media" value={stats.media} />
                            <StatCard label="Volunteers" value={stats.volunteers} />
                            <StatCard label="Venue" value={stats.venue} />
                        </div>
                    </div>
                )}

                <FeedbackList feedbacks={feedbacks} readOnly={true} />
            </main>
        </div>
    )
}
