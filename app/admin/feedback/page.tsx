'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Feedback } from '@/types/database'
import { FiArrowLeft, FiStar, FiUser, FiPhone, FiMail, FiMessageSquare, FiRefreshCw, FiTrash2, FiSettings, FiSave, FiPlus, FiMenu, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

type FeedbackSection = {
    key: string
    label: string
    labelMl: string
    enabled: boolean
    required: boolean
    maxLength: number
    displayOrder: number
    isDefault?: boolean
}

type FeedbackField = {
    key: string
    label: string
    labelMl: string
    enabled: boolean
    required: boolean
    type: 'text' | 'tel' | 'email'
}

const defaultFields: FeedbackField[] = [
    { key: 'name', label: 'Name', labelMl: 'പേര്', enabled: true, required: true, type: 'text' },
    { key: 'phone', label: 'Phone', labelMl: 'ഫോൺ', enabled: true, required: true, type: 'tel' },
    { key: 'email', label: 'Email', labelMl: 'ഇമെയിൽ', enabled: true, required: false, type: 'email' },
]

const defaultSections: FeedbackSection[] = [
    { key: 'overall', label: 'Overall Experience', labelMl: 'മൊത്തത്തിലുള്ള അനുഭവം', enabled: true, required: true, maxLength: 500, displayOrder: 0, isDefault: true },
    { key: 'sessions', label: 'Sessions & Programs', labelMl: 'സെഷനുകളും പ്രോഗ്രാമുകളും', enabled: true, required: false, maxLength: 500, displayOrder: 1, isDefault: true },
    { key: 'media', label: 'Media & Coverage', labelMl: 'മീഡിയ കവറേജ്', enabled: true, required: false, maxLength: 500, displayOrder: 2, isDefault: true },
    { key: 'volunteers', label: 'Volunteers & Staff', labelMl: 'വോളണ്ടിയർമാർ', enabled: true, required: false, maxLength: 500, displayOrder: 3, isDefault: true },
    { key: 'venue', label: 'Venue & Facilities', labelMl: 'വേദിയും സൗകര്യങ്ങളും', enabled: true, required: false, maxLength: 500, displayOrder: 4, isDefault: true },
]

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'responses' | 'config'>('responses')
    const [sections, setSections] = useState<FeedbackSection[]>(defaultSections)
    const [fields, setFields] = useState<FeedbackField[]>(defaultFields)
    const [savingConfig, setSavingConfig] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const [stats, setStats] = useState({
        total: 0,
        overall: 0,
        sessions: 0,
        media: 0,
        volunteers: 0,
        venue: 0,
    })
    const supabase = createClient()

    const fetchFeedback = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            setFeedbacks(data)
            const total = data.length
            if (total > 0) {
                setStats({
                    total,
                    overall: data.reduce((acc, f) => acc + f.overall_rating, 0) / total,
                    sessions: data.filter(f => f.sessions_rating).reduce((acc, f) => acc + (f.sessions_rating || 0), 0) / data.filter(f => f.sessions_rating).length || 0,
                    media: data.filter(f => f.media_rating).reduce((acc, f) => acc + (f.media_rating || 0), 0) / data.filter(f => f.media_rating).length || 0,
                    volunteers: data.filter(f => f.volunteers_rating).reduce((acc, f) => acc + (f.volunteers_rating || 0), 0) / data.filter(f => f.volunteers_rating).length || 0,
                    venue: data.filter(f => f.venue_rating).reduce((acc, f) => acc + (f.venue_rating || 0), 0) / data.filter(f => f.venue_rating).length || 0,
                })
            }
        }

        // Fetch sections config
        const { data: configData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'feedback_sections')
            .single()

        if (configData?.value) {
            try {
                setSections(JSON.parse(configData.value))
            } catch (e) {
                console.error('Failed to parse feedback sections config')
            }
        }

        // Fetch fields config
        const { data: fieldsData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'feedback_fields')
            .single()

        if (fieldsData?.value) {
            try {
                setFields(JSON.parse(fieldsData.value))
            } catch (e) {
                console.error('Failed to parse feedback fields config')
            }
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchFeedback()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return
        const { error } = await supabase.from('feedback').delete().eq('id', id)
        if (!error) {
            setFeedbacks(prev => prev.filter(f => f.id !== id))
            setStats(prev => ({ ...prev, total: prev.total - 1 }))
        }
    }

    const handleSaveConfig = async () => {
        setSavingConfig(true)
        const orderedSections = sections.map((s, i) => ({ ...s, displayOrder: i }))

        await Promise.all([
            supabase.from('settings').upsert({ key: 'feedback_sections', value: JSON.stringify(orderedSections) }),
            supabase.from('settings').upsert({ key: 'feedback_fields', value: JSON.stringify(fields) })
        ])

        setSections(orderedSections)
        setSavingConfig(false)
        alert('Configuration saved!')
    }

    // Field handlers
    const toggleFieldEnabled = (key: string) => {
        setFields(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f))
    }

    const toggleFieldRequired = (key: string) => {
        setFields(prev => prev.map(f => f.key === key ? { ...f, required: !f.required } : f))
    }

    const updateFieldLabel = (key: string, field: 'label' | 'labelMl', value: string) => {
        setFields(prev => prev.map(f => f.key === key ? { ...f, [field]: value } : f))
    }

    const addNewField = () => {
        const newKey = `field_${Date.now()}`
        const newField: FeedbackField = {
            key: newKey,
            label: 'New Field',
            labelMl: 'പുതിയ ഫീൽഡ്',
            enabled: true,
            required: false,
            type: 'text',
        }
        setFields(prev => [...prev, newField])
    }

    const deleteField = (key: string) => {
        if (!confirm('Are you sure you want to delete this field?')) return
        setFields(prev => prev.filter(f => f.key !== key))
    }

    // Section handlers
    const toggleEnabled = (key: string) => {
        setSections(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s))
    }

    const toggleRequired = (key: string) => {
        setSections(prev => prev.map(s => s.key === key ? { ...s, required: !s.required } : s))
    }

    const updateLabel = (key: string, field: 'label' | 'labelMl', value: string) => {
        setSections(prev => prev.map(s => s.key === key ? { ...s, [field]: value } : s))
    }

    const updateMaxLength = (key: string, value: number) => {
        setSections(prev => prev.map(s => s.key === key ? { ...s, maxLength: value } : s))
    }

    const addNewSection = () => {
        const newKey = `custom_${Date.now()}`
        const newSection: FeedbackSection = {
            key: newKey,
            label: 'New Section',
            labelMl: 'പുതിയ വിഭാഗം',
            enabled: true,
            required: false,
            maxLength: 500,
            displayOrder: sections.length,
            isDefault: false,
        }
        setSections(prev => [...prev, newSection])
    }

    const deleteSection = (key: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return
        setSections(prev => prev.filter(s => s.key !== key))
    }

    // Drag and Drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        setDragOverIndex(index)
    }

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const newSections = [...sections]
            const [removed] = newSections.splice(draggedIndex, 1)
            newSections.splice(dragOverIndex, 0, removed)
            newSections.forEach((s, i) => s.displayOrder = i)
            setSections(newSections)
        }
        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    const StarDisplay = ({ rating }: { rating: number | null }) => {
        if (!rating) return <span className="text-foreground/40 text-sm">Not rated</span>
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`} />
                ))}
            </div>
        )
    }

    const StatCard = ({ label, value }: { label: string, value: number }) => (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-primary">{value.toFixed(1)}<span className="text-sm text-foreground/50">/5</span></p>
        </div>
    )

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
                            <h1 className="text-2xl font-bold">Feedback Management</h1>
                            <p className="text-white/70 text-sm">{stats.total} responses received</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchFeedback}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <FiRefreshCw className="w-5 h-5" />
                        <span className="hidden sm:block">Refresh</span>
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex gap-2 border-b border-primary/20">
                    <button
                        onClick={() => setActiveTab('responses')}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-[2px] ${activeTab === 'responses' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
                    >
                        Responses ({stats.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
                    >
                        <FiSettings className="w-4 h-4" />
                        Configure Form
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {activeTab === 'responses' ? (
                    <>
                        {/* Stats Overview */}
                        {stats.total > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-foreground mb-4">Average Ratings</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <StatCard label="Overall" value={stats.overall} />
                                    <StatCard label="Sessions" value={stats.sessions} />
                                    <StatCard label="Media" value={stats.media} />
                                    <StatCard label="Volunteers" value={stats.volunteers} />
                                    <StatCard label="Venue" value={stats.venue} />
                                </div>
                            </div>
                        )}

                        {/* Feedback List */}
                        <div className="space-y-4">
                            {feedbacks.length === 0 ? (
                                <div className="text-center py-12 bg-primary/5 rounded-2xl border border-primary/20">
                                    <FiMessageSquare className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                                    <p className="text-foreground/60">No feedback received yet</p>
                                    <p className="text-sm text-foreground/40 mt-1">Share the feedback link with attendees</p>
                                </div>
                            ) : (
                                feedbacks.map((feedback) => (
                                    <div key={feedback.id} className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <FiUser className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-foreground">{feedback.name || 'Anonymous'}</h3>
                                                    {feedback.phone && (
                                                        <p className="text-sm text-foreground/60 flex items-center gap-1">
                                                            <FiPhone className="w-3 h-3" /> {feedback.phone}
                                                        </p>
                                                    )}
                                                    {feedback.email && (
                                                        <p className="text-sm text-foreground/60 flex items-center gap-1">
                                                            <FiMail className="w-3 h-3" /> {feedback.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-xs text-foreground/50">{new Date(feedback.created_at).toLocaleString()}</p>
                                                <button
                                                    onClick={() => handleDelete(feedback.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete feedback"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                            {['overall', 'sessions', 'media', 'volunteers', 'venue'].map(key => (
                                                <div key={key}>
                                                    <p className="text-xs text-foreground/60 mb-1 capitalize">{key}</p>
                                                    <StarDisplay rating={(feedback as unknown as Record<string, number | null>)[`${key}_rating`] as number | null} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Comments */}
                                        <div className="space-y-2 text-sm">
                                            {feedback.overall_comments && (
                                                <div className="bg-primary/5 p-3 rounded-lg">
                                                    <span className="font-bold text-primary">Overall:</span> {feedback.overall_comments}
                                                </div>
                                            )}
                                            {feedback.sessions_comments && (
                                                <div className="bg-secondary/5 p-3 rounded-lg">
                                                    <span className="font-bold text-secondary">Sessions:</span> {feedback.sessions_comments}
                                                </div>
                                            )}
                                            {feedback.media_comments && (
                                                <div className="bg-accent/5 p-3 rounded-lg">
                                                    <span className="font-bold text-accent">Media:</span> {feedback.media_comments}
                                                </div>
                                            )}
                                            {feedback.volunteers_comments && (
                                                <div className="bg-green-500/5 p-3 rounded-lg">
                                                    <span className="font-bold text-green-600">Volunteers:</span> {feedback.volunteers_comments}
                                                </div>
                                            )}
                                            {feedback.venue_comments && (
                                                <div className="bg-blue-500/5 p-3 rounded-lg">
                                                    <span className="font-bold text-blue-600">Venue:</span> {feedback.venue_comments}
                                                </div>
                                            )}
                                            {feedback.suggestions && (
                                                <div className="bg-yellow-500/5 p-3 rounded-lg border-l-4 border-yellow-500">
                                                    <span className="font-bold text-yellow-600">Suggestions:</span> {feedback.suggestions}
                                                </div>
                                            )}
                                            {/* Custom Sections */}
                                            {feedback.custom_data?.sections && Object.entries(feedback.custom_data.sections).map(([key, data]) => (
                                                <div key={key} className="bg-purple-500/5 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-purple-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                        <span className="text-xs text-foreground/60">({data.rating}/5 stars)</span>
                                                    </div>
                                                    {data.comments && <p>{data.comments}</p>}
                                                </div>
                                            ))}
                                            {/* Custom Fields */}
                                            {feedback.custom_data?.fields && Object.entries(feedback.custom_data.fields).map(([key, value]) => (
                                                value && (
                                                    <div key={key} className="bg-indigo-500/5 p-3 rounded-lg">
                                                        <span className="font-bold text-indigo-600 capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    /* Configuration Tab */
                    <div className="max-w-3xl">
                        {/* Personal Details Fields */}
                        <div className="bg-background border border-primary/20 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Personal Details Fields</h2>
                                    <p className="text-sm text-foreground/60">Configure which personal details to collect.</p>
                                </div>
                                <button
                                    onClick={addNewField}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add Field
                                </button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field) => (
                                    <div key={field.key} className={`border rounded-xl p-4 ${field.enabled ? 'border-primary/30 bg-primary/5' : 'border-foreground/10 bg-foreground/5 opacity-60'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-foreground/60 mb-1">English Label</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateFieldLabel(field.key, 'label', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-foreground/60 mb-1">Malayalam Label</label>
                                                <input
                                                    type="text"
                                                    value={field.labelMl}
                                                    onChange={(e) => updateFieldLabel(field.key, 'labelMl', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm font-noto"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleFieldEnabled(field.key)} className="text-foreground/70 hover:text-primary transition-colors">
                                                    {field.enabled ? <FiToggleRight className="w-6 h-6 text-green-500" /> : <FiToggleLeft className="w-6 h-6" />}
                                                </button>
                                                <span className="text-sm">{field.enabled ? 'Enabled' : 'Disabled'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleFieldRequired(field.key)}
                                                    disabled={!field.enabled}
                                                    className="text-foreground/70 hover:text-primary transition-colors disabled:opacity-50"
                                                >
                                                    {field.required ? <FiToggleRight className="w-6 h-6 text-red-500" /> : <FiToggleLeft className="w-6 h-6" />}
                                                </button>
                                                <span className="text-sm">{field.required ? 'Required' : 'Optional'}</span>
                                            </div>
                                            <span className="text-xs text-foreground/40 bg-foreground/5 px-2 py-1 rounded">Type: {field.type}</span>
                                            <button
                                                onClick={() => deleteField(field.key)}
                                                className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete field"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rating Sections */}
                        <div className="bg-background border border-primary/20 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Rating Sections</h2>
                                    <p className="text-sm text-foreground/60">Drag to reorder. Configure labels and requirements.</p>
                                </div>
                                <button
                                    onClick={addNewSection}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add Section
                                </button>
                            </div>

                            <div className="space-y-3">
                                {sections.sort((a, b) => a.displayOrder - b.displayOrder).map((section, index) => (
                                    <div
                                        key={section.key}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`border rounded-xl p-4 cursor-move transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                            } ${dragOverIndex === index && draggedIndex !== index ? 'border-secondary border-2' : ''
                                            } ${section.enabled ? 'border-primary/30 bg-primary/5' : 'border-foreground/10 bg-foreground/5 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Drag Handle */}
                                            <div className="pt-2 text-foreground/40 cursor-grab active:cursor-grabbing">
                                                <FiMenu className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-foreground/60 mb-1">English Label</label>
                                                        <input
                                                            type="text"
                                                            value={section.label}
                                                            onChange={(e) => updateLabel(section.key, 'label', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-foreground/60 mb-1">Malayalam Label</label>
                                                        <input
                                                            type="text"
                                                            value={section.labelMl}
                                                            onChange={(e) => updateLabel(section.key, 'labelMl', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm font-noto"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => toggleEnabled(section.key)} className="text-foreground/70 hover:text-primary transition-colors">
                                                            {section.enabled ? <FiToggleRight className="w-6 h-6 text-green-500" /> : <FiToggleLeft className="w-6 h-6" />}
                                                        </button>
                                                        <span className="text-sm">{section.enabled ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleRequired(section.key)}
                                                            disabled={!section.enabled}
                                                            className="text-foreground/70 hover:text-primary transition-colors disabled:opacity-50"
                                                        >
                                                            {section.required ? <FiToggleRight className="w-6 h-6 text-red-500" /> : <FiToggleLeft className="w-6 h-6" />}
                                                        </button>
                                                        <span className="text-sm">{section.required ? 'Required' : 'Optional'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm text-foreground/60">Max:</label>
                                                        <input
                                                            type="number"
                                                            value={section.maxLength}
                                                            onChange={(e) => updateMaxLength(section.key, parseInt(e.target.value) || 500)}
                                                            disabled={!section.enabled}
                                                            className="w-20 px-2 py-1 rounded-lg border border-primary/20 bg-background text-sm disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => deleteSection(section.key)}
                                                        className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete section"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            disabled={savingConfig}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50"
                        >
                            {savingConfig ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiSave className="w-5 h-5" />
                                    Save Configuration
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
