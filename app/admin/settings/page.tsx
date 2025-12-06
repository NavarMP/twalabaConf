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
                <div className="max-w-2xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                    <FiSettings className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Settings Moved</h2>
                    <p className="text-foreground/70 mb-6">
                        Live Streaming and Session settings have been moved to the Schedule page for easier access.
                    </p>
                    <Link
                        href="/admin/schedule"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                    >
                        Go to Schedule Settings
                    </Link>
                </div>
            </main>
        </div>
    )
}
