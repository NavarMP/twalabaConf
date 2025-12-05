'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FiArrowLeft, FiSave, FiSettings } from 'react-icons/fi'

export default function SettingsManagement() {
    const [liveUrl, setLiveUrl] = useState('')
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
            .eq('key', 'live_streaming_url')
            .maybeSingle()

        if (data) {
            setLiveUrl(data.value)
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        // Check if exists
        const { data: existing } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'live_streaming_url')
            .maybeSingle()

        let error;

        if (existing) {
            const { error: updateError } = await supabase
                .from('settings')
                .update({ value: liveUrl })
                .eq('key', 'live_streaming_url')
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from('settings')
                .insert([{
                    key: 'live_streaming_url',
                    value: liveUrl,
                    description: 'URL for the live streaming button'
                }])
            error = insertError
        }

        if (error) {
            setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` })
            console.error(error)
        } else {
            setMessage({ type: 'success', text: 'Settings saved successfully' })
        }
        setSaving(false)
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

                    <div className="space-y-4">
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
