'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FiArrowLeft, FiSave, FiSettings, FiUpload, FiImage, FiTrash2, FiPlus, FiYoutube, FiEdit2 } from 'react-icons/fi'
import imageCompression from 'browser-image-compression';
import ImageUploader from '@/components/ImageUploader';

export default function SettingsManagement() {
    const [settings, setSettings] = useState<any>({
        conference_mode: 'conference',
        registration_url: '',
        theme_song_url: '',
        thank_you_message: '',
        post_conf_bg_image: '',
        conference_date: '',
        previous_sessions: '[]' // JSON string
    })
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Session Form State
    const [newSession, setNewSession] = useState({ title: '', url: '', thumbnail: '' })
    const [isAddingSession, setIsAddingSession] = useState(false)
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const formRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isAddingSession && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isAddingSession, editIndex])

    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('settings')
            .select('*')
            .in('key', ['conference_mode', 'registration_url', 'theme_song_url', 'thank_you_message', 'post_conf_bg_image', 'conference_date', 'previous_sessions'])

        if (data) {
            const newSettings: any = { ...settings }
            data.forEach(item => {
                newSettings[item.key] = item.value
            })
            setSettings(newSettings)

            try {
                if (newSettings.previous_sessions) {
                    setSessions(JSON.parse(newSettings.previous_sessions))
                }
            } catch (e) {
                console.error("Failed to parse sessions", e)
                setSessions([])
            }
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            // Update settings with current sessions state
            const finalSettings = {
                ...settings,
                previous_sessions: JSON.stringify(sessions)
            }

            const updates = Object.keys(finalSettings).map(key => ({
                key,
                value: finalSettings[key]
            }))

            const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' })

            if (error) throw error
            setMessage({ type: 'success', text: 'Settings saved successfully!' })
        } catch (error: any) {
            console.error(error)
            setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
            const compressedFile = await imageCompression(file, options);
            const formData = new FormData();
            formData.append('file', compressedFile);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                setSettings((prev: any) => ({ ...prev, post_conf_bg_image: data.url }));
                setMessage({ type: 'success', text: 'Image uploaded successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Upload failed: ' + data.error });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Upload failed.' });
        } finally {
            setUploading(false);
        }
    };

    // --- Session Management Logic ---

    const extractYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    const handleSessionUrlChange = (url: string) => {
        setNewSession(prev => ({ ...prev, url }));
        const videoId = extractYouTubeId(url);
        if (videoId && !newSession.thumbnail) {
            setNewSession(prev => ({
                ...prev,
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            }));
        }
    }

    const handleSessionThumbnailUpload = async (file: File) => {
        setUploading(true);
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true }
            const compressedFile = await imageCompression(file, options);
            const formData = new FormData();
            formData.append('file', compressedFile);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                setNewSession(prev => ({ ...prev, thumbnail: data.url }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    }

    const addSession = () => {
        if (!newSession.title || !newSession.url) return;

        if (editIndex !== null) {
            const updatedSessions = [...sessions];
            updatedSessions[editIndex] = { ...newSession, id: updatedSessions[editIndex].id || Date.now().toString() };
            setSessions(updatedSessions);
            setEditIndex(null);
        } else {
            setSessions([...sessions, { ...newSession, id: Date.now().toString() }]);
        }

        setNewSession({ title: '', url: '', thumbnail: '' });
        setIsAddingSession(false);
    }

    const startEdit = (index: number) => {
        setNewSession(sessions[index]);
        setEditIndex(index);
        setIsAddingSession(true);
    }

    const removeSession = (index: number) => {
        const newSessions = [...sessions];
        newSessions.splice(index, 1);
        setSessions(newSessions);
        if (editIndex === index) {
            setEditIndex(null);
            setIsAddingSession(false);
            setNewSession({ title: '', url: '', thumbnail: '' });
        }
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
                <div className="grid gap-8">
                    {/* Conference Mode Card */}
                    <div className="bg-background border border-primary/20 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FiSettings className="text-primary" />
                            Conference Mode
                        </h2>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Current Mode</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'pre', label: 'Pre-Conference' },
                                        { id: 'conference', label: 'Live Conference' },
                                        { id: 'post', label: 'Post-Conference' }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setSettings({ ...settings, conference_mode: mode.id })}
                                            className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${settings.conference_mode === mode.id
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-primary/10 hover:border-primary/30 text-foreground/70'
                                                }`}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pre-Conference Settings */}
                            {settings.conference_mode === 'pre' && (
                                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10 grid gap-4 animate-in fade-in slide-in-from-top-4">
                                    <h3 className="font-bold text-secondary">Pre-Conference Configuration</h3>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">Conference Date</label>
                                        <input
                                            type="datetime-local"
                                            value={settings.conference_date || ''}
                                            onChange={(e) => setSettings({ ...settings, conference_date: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-background border border-primary/10 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">Registration URL (Fallback / Optional)</label>
                                        <input
                                            type="text"
                                            value={settings.registration_url || ''}
                                            onChange={(e) => setSettings({ ...settings, registration_url: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-background border border-primary/10 focus:border-primary outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">Theme Song URL</label>
                                        <input
                                            type="text"
                                            value={settings.theme_song_url || ''}
                                            onChange={(e) => setSettings({ ...settings, theme_song_url: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-background border border-primary/10 focus:border-primary outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Post-Conference Settings */}
                            {settings.conference_mode === 'post' && (
                                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10 grid gap-4 animate-in fade-in slide-in-from-top-4">
                                    <h3 className="font-bold text-secondary">Post-Conference Configuration</h3>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">Thank You Message</label>
                                        <textarea
                                            value={settings.thank_you_message || ''}
                                            onChange={(e) => setSettings({ ...settings, thank_you_message: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-background border border-primary/10 focus:border-primary outline-none min-h-[100px]"
                                            placeholder="Thank you for making history with us..."
                                        />
                                    </div>

                                    {/* BG Image Upload */}
                                    <div className="mt-2">
                                        <div className="flex flex-col gap-2">
                                            <ImageUploader
                                                label="Background Image"
                                                currentImage={settings.post_conf_bg_image}
                                                onUpload={handleImageUpload}
                                                uploading={uploading}
                                            />
                                            <div className="mt-2">
                                                <label className="text-xs font-bold uppercase text-foreground/30 mb-1 block">Or enter URL directly</label>
                                                <input
                                                    type="text"
                                                    value={settings.post_conf_bg_image || ''}
                                                    onChange={(e) => setSettings({ ...settings, post_conf_bg_image: e.target.value })}
                                                    className="w-full px-3 py-1.5 text-sm rounded-lg bg-background border border-primary/10 focus:border-primary outline-none text-foreground/50 placeholder:text-foreground/20"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sessions Archive Management */}
                    <div className="bg-background border border-primary/20 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FiUpload className="text-primary" />
                            Sessions Archive
                        </h2>

                        <div className="space-y-4">
                            {/* List Existing Sessions */}
                            {sessions.length > 0 && (
                                <div className="grid gap-3">
                                    {sessions.map((session, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-secondary/5 rounded-lg border border-secondary/10 group">
                                            <div className="w-24 h-16 bg-black/20 rounded-md overflow-hidden relative flex-shrink-0">
                                                {session.thumbnail ? (
                                                    <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-foreground/20"><FiImage /></div>
                                                )}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-bold truncate">{session.title}</h4>
                                                <p className="text-xs text-foreground/60 truncate">{session.url}</p>
                                            </div>
                                            <div className="flex gap-1 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(idx)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => removeSession(idx)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Session */}
                            {!isAddingSession ? (
                                <button
                                    onClick={() => setIsAddingSession(true)}
                                    className="w-full py-3 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 hover:border-primary/40 transition-all"
                                >
                                    <FiPlus /> Add Previous Session
                                </button>
                            ) : (
                                <div ref={formRef} className="p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in zoom-in-95">
                                    <h4 className="font-bold text-sm mb-4">{editIndex !== null ? 'Edit Session' : 'Add New Session'}</h4>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">Session Title</label>
                                            <input
                                                type="text"
                                                value={newSession.title}
                                                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-background border border-primary/10 focus:border-primary outline-none"
                                                placeholder="e.g. Opening Ceremony"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">YouTube URL / Video Link</label>
                                            <input
                                                type="text"
                                                value={newSession.url}
                                                onChange={(e) => handleSessionUrlChange(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg bg-background border border-primary/10 focus:border-primary outline-none"
                                                placeholder="https://youtube.com/..."
                                            />
                                            <p className="text-[10px] text-foreground/40 mt-1">YouTube thumbnails are extracted automatically.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-foreground/50 mb-1">Thumbnail (Optional)</label>
                                            <ImageUploader
                                                label="Upload Custom Thumbnail"
                                                currentImage={newSession.thumbnail}
                                                onUpload={handleSessionThumbnailUpload}
                                                uploading={uploading}
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <button
                                                onClick={() => { setIsAddingSession(false); setEditIndex(null); setNewSession({ title: '', url: '', thumbnail: '' }); }}
                                                className="px-4 py-2 text-sm font-bold text-foreground/60 hover:bg-black/5 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={addSession}
                                                disabled={!newSession.title || !newSession.url}
                                                className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {editIndex !== null ? 'Update Session' : 'Add Session'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <FiSave /> Save Changes
                                </>
                            )}
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
