'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FiArrowLeft, FiSave, FiSettings } from 'react-icons/fi'

export default function SettingsManagement() {
    const [liveUrl, setLiveUrl] = useState('')
    const [sessionTitle, setSessionTitle] = useState('')
    const [nextSessionDetails, setNextSessionDetails] = useState('')
    const [upcomingStreamUrl, setUpcomingStreamUrl] = useState('')
    const [previousSessions, setPreviousSessions] = useState<{ title: string, url: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('settings')
            .select('*')
            .in('key', ['live_streaming_url', 'current_session_title', 'previous_sessions', 'next_session_details', 'upcoming_stream_url'])

        if (data) {
            data.forEach(item => {
                if (item.key === 'live_streaming_url') setLiveUrl(item.value)
                if (item.key === 'current_session_title') setSessionTitle(item.value)
                if (item.key === 'next_session_details') setNextSessionDetails(item.value)
                if (item.key === 'upcoming_stream_url') setUpcomingStreamUrl(item.value)
                if (item.key === 'previous_sessions') {
                    try {
                        setPreviousSessions(JSON.parse(item.value))
                    } catch (e) {
                        setPreviousSessions([])
                    }
                }
            })
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        const updates = [
            { key: 'live_streaming_url', value: liveUrl, description: 'URL for the live streaming button' },
            { key: 'current_session_title', value: sessionTitle, description: 'Title of the current session' },
            { key: 'next_session_details', value: nextSessionDetails, description: 'Details about the upcoming session' },
            { key: 'upcoming_stream_url', value: upcomingStreamUrl, description: 'URL for the upcoming scheduled stream' },
            { key: 'previous_sessions', value: JSON.stringify(previousSessions), description: 'List of previous sessions' }
        ]

        let errors: string[] = []

        for (const update of updates) {
            const { data: existing, error: fetchError } = await supabase
                .from('settings')
                .select('key')
                .eq('key', update.key)
                .maybeSingle()

            if (fetchError) {
                errors.push(`Check failed for ${update.key}: ${fetchError.message}`)
                continue
            }

            if (existing) {
                const { error } = await supabase
                    .from('settings')
                    .update({ value: update.value })
                    .eq('key', update.key)
                if (error) errors.push(`Update failed for ${update.key}: ${error.message}`)
            } else {
                const { error } = await supabase
                    .from('settings')
                    .insert([update])
                if (error) errors.push(`Insert failed for ${update.key}: ${error.message}`)
            }
        }

        if (errors.length > 0) {
            setMessage({ type: 'error', text: `Failed: ${errors.join(', ')}` })
            console.error(errors)
        } else {
            setMessage({ type: 'success', text: 'Settings saved successfully' })
        }
        setSaving(false)
    }

    const addPreviousSession = () => {
        setPreviousSessions([...previousSessions, { title: '', url: '' }])
    }

    const removePreviousSession = (index: number) => {
        setPreviousSessions(previousSessions.filter((_, i) => i !== index))
    }

    const updatePreviousSession = (index: number, field: 'title' | 'url', value: string) => {
        const newSessions = [...previousSessions]
        newSessions[index] = { ...newSessions[index], [field]: value }
        setPreviousSessions(newSessions)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-primary text-white py-4 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">General Settings</h1>
                            <p className="text-white/70 text-sm">Manage global website configurations</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                <div className="max-w-2xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6 text-primary">
                        <FiSettings className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Live Streaming</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Live Stream URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://youtube.com/..."
                                value={liveUrl}
                                onChange={(e) => setLiveUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <p className="text-xs text-foreground/50 mt-2">
                                Leave empty to hide the &quot;Live Streaming&quot; button on the homepage.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Upcoming Stream Link (Optional)
                            </label>
                            <input
                                type="url"
                                placeholder="https://youtube.com/live/..."
                                value={upcomingStreamUrl}
                                onChange={(e) => setUpcomingStreamUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <p className="text-xs text-foreground/50 mt-2">
                                If provided, this link will be shown with the "Next Session" details.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Next Session Details (Displayed when no Live URL)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Starts Tomorrow at 9:00 AM"
                                value={nextSessionDetails}
                                onChange={(e) => setNextSessionDetails(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Current Session Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Inaugural Session"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium opacity-80">
                                    Previous Sessions
                                </label>
                                <button
                                    onClick={addPreviousSession}
                                    className="text-xs bg-secondary/10 hover:bg-secondary/20 text-secondary px-2 py-1 rounded transition-colors"
                                >
                                    + Add Session
                                </button>
                            </div>

                            <div className="space-y-3">
                                {previousSessions.map((session, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Session Title"
                                                value={session.title}
                                                onChange={(e) => updatePreviousSession(index, 'title', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                            />
                                            <input
                                                type="url"
                                                placeholder="YouTube URL"
                                                value={session.url}
                                                onChange={(e) => updatePreviousSession(index, 'url', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removePreviousSession(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiArrowLeft className="w-4 h-4 rotate-45" /> {/* Using generic icon as delete */}
                                        </button>
                                    </div>
                                ))}
                                {previousSessions.length === 0 && (
                                    <p className="text-sm text-foreground/50 italic text-center py-4 border border-dashed border-primary/20 rounded-xl">
                                        No previous sessions added.
                                    </p>
                                )}
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FiSave className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
