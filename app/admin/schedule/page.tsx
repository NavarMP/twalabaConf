'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ScheduleItem } from '@/types/database'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import { scheduleData } from '@/lib/data/scheduleData'

export default function ScheduleManagement() {
    const [items, setItems] = useState<ScheduleItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        day: 1,
        time: '',
        titleEn: '',
        titleMl: '',
        subtitleEn: '',
        subtitleMl: '',
        type: 'session' as 'ceremony' | 'session' | 'special',
        display_order: 0,
        extendedDetails: '{}' // JSON string for details + list
    })
    const [currentSession, setCurrentSession] = useState<string | null>(null)
    const supabase = createClient()

    const fetchItems = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('schedule')
            .select('*')
            .order('day', { ascending: true })
            .order('display_order', { ascending: true })
        if (data) setItems(data)

        // Fetch current session from settings
        const { data: settingsData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'current_session_title')
            .single()

        if (settingsData) setCurrentSession(settingsData.value)

        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleSeed = async () => {
        if (!confirm('WARNING: This will DELETE all existing schedule items and replace them with the default static data. Are you sure?')) return

        setLoading(true)

        // 1. Delete all existing
        const { error: deleteError } = await supabase.from('schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        if (deleteError) {
            console.error('Error deleting:', deleteError)
            alert('Failed to clear existing schedule')
            setLoading(false)
            return
        }

        // 2. Prepare data
        const newItems: any[] = []
        let order = 1
        scheduleData.forEach((dayData, dayIndex) => {
            dayData.events.forEach((event) => {
                // Ensure title and subtitle are properly formatted as objects before stringifying
                const titleObj = typeof event.title === 'object' ? event.title : { en: event.title, ml: event.title };
                const subtitleObj = event.subtitle ? (typeof event.subtitle === 'object' ? event.subtitle : { en: event.subtitle, ml: event.subtitle }) : null;

                newItems.push({
                    day: dayIndex + 1,
                    time: event.time,
                    title: JSON.stringify(titleObj),
                    subtitle: subtitleObj ? JSON.stringify(subtitleObj) : null,
                    type: event.type,
                    details: {
                        details: event.details || null,
                        list: event.list || null
                    },
                    display_order: order++
                })
            })
        })

        // 3. Insert
        const { error: insertError } = await supabase.from('schedule').insert(newItems)
        if (insertError) {
            console.error('Error seeding:', insertError)
            alert('Failed to insert default data: ' + insertError.message)
        } else {
            alert('Schedule reset successfully!')
            fetchItems()
        }
        setLoading(false)
    }

    const resetForm = () => {
        setFormData({
            day: 1,
            time: '',
            titleEn: '',
            titleMl: '',
            subtitleEn: '',
            subtitleMl: '',
            type: 'session',
            display_order: 0,
            extendedDetails: '{}'
        })
        setShowAddForm(false)
        setEditingId(null)
    }

    const handleAdd = async () => {
        const title = JSON.stringify({ en: formData.titleEn, ml: formData.titleMl })
        const subtitle = (formData.subtitleEn || formData.subtitleMl)
            ? JSON.stringify({ en: formData.subtitleEn, ml: formData.subtitleMl })
            : null

        let details = null
        try {
            details = JSON.parse(formData.extendedDetails)
        } catch (e) {
            alert('Invalid JSON in Advanced Details')
            return
        }

        const payload = {
            day: formData.day,
            time: formData.time,
            title,
            subtitle,
            type: formData.type,
            display_order: formData.display_order,
            details
        }

        const { error } = await supabase.from('schedule').insert([payload])
        if (!error) {
            resetForm()
            fetchItems()
        } else {
            alert('Error adding item: ' + error.message)
        }
    }

    const handleUpdate = async (id: string) => {
        const title = JSON.stringify({ en: formData.titleEn, ml: formData.titleMl })
        const subtitle = (formData.subtitleEn || formData.subtitleMl)
            ? JSON.stringify({ en: formData.subtitleEn, ml: formData.subtitleMl })
            : null

        let details = null
        try {
            details = JSON.parse(formData.extendedDetails)
        } catch (e) {
            alert('Invalid JSON in Advanced Details')
            return
        }

        const payload = {
            day: formData.day,
            time: formData.time,
            title,
            subtitle,
            type: formData.type,
            display_order: formData.display_order,
            details
        }

        const { error } = await supabase.from('schedule').update(payload).eq('id', id)
        if (!error) {
            resetForm()
            fetchItems()
        } else {
            alert('Error updating item: ' + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await supabase.from('schedule').delete().eq('id', id)
            fetchItems()
        }
    }

    const handleSetLive = async (title: string) => {
        // We now store keys in settings, but we need to better handle the title matching.
        // Since titles are now JSON strings, we should probably store the ID or just a unique string.
        // However, existing component uses title. Let's try to extract EN title for display.
        let displayTitle = title
        try {
            const parsed = JSON.parse(title)
            displayTitle = parsed.en
        } catch (e) { /* ignore */ }

        const { error } = await supabase
            .from('settings')
            .update({ value: displayTitle })
            .eq('key', 'current_session_title')

        if (!error) {
            setCurrentSession(displayTitle)
        }
    }

    const handleClearLive = async () => {
        const { error } = await supabase
            .from('settings')
            .update({ value: '' })
            .eq('key', 'current_session_title')

        if (!error) {
            setCurrentSession(null)
        }
    }

    const startEdit = (item: ScheduleItem) => {
        setEditingId(item.id)

        let titleEn = '', titleMl = ''
        try {
            const parsed = JSON.parse(item.title)
            titleEn = parsed.en || ''
            titleMl = parsed.ml || ''
        } catch (e) {
            titleEn = item.title
        }

        let subtitleEn = '', subtitleMl = ''
        if (item.subtitle) {
            try {
                const parsed = JSON.parse(item.subtitle)
                subtitleEn = parsed.en || ''
                subtitleMl = parsed.ml || ''
            } catch (e) {
                subtitleEn = item.subtitle
            }
        }

        setFormData({
            day: item.day,
            time: item.time,
            titleEn,
            titleMl,
            subtitleEn,
            subtitleMl,
            type: item.type,
            display_order: item.display_order,
            extendedDetails: JSON.stringify(item.details || {}, null, 2)
        })
    }

    const day1Items = items.filter(i => i.day === 1)
    const day2Items = items.filter(i => i.day === 2)

    // Helper to render title safely
    const renderTitle = (title: string | object) => {
        if (typeof title === 'object' && title !== null) {
            const parsed = title as { en?: string, ml?: string };
            return `${parsed.en || ''} / ${parsed.ml || ''}`.trim().replace(/^\s*\/\s*$/, '');
        }
        try {
            const parsed = JSON.parse(title as string);
            return `${parsed.en || ''} / ${parsed.ml || ''}`.trim().replace(/^\s*\/\s*$/, '');
        } catch (e) {
            return title as string;
        }
    }

    const getEnglishTitle = (title: string | object) => {
        if (typeof title === 'object' && title !== null) {
            const parsed = title as { en?: string };
            return parsed.en || '';
        }
        try {
            const parsed = JSON.parse(title as string);
            return parsed.en || '';
        } catch (e) {
            return title as string;
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const renderForm = (isEdit: boolean, itemId?: string) => (
        <div className={`p-6 rounded-2xl ${isEdit ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-secondary/10'} border border-secondary/30 mb-4`}>
            <h3 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Item' : 'Add New Schedule Item'}</h3>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                >
                    <option value={1}>Day 1 - Dec 5</option>
                    <option value={2}>Day 2 - Dec 6</option>
                </select>
                <input
                    type="text"
                    placeholder="Time (e.g. 9:00 AM)"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                />
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ceremony' | 'session' | 'special' })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                >
                    <option value="session">Session</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="special">Special Event</option>
                </select>
                <input
                    type="number"
                    placeholder="Order"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                />
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Title (English)</label>
                    <input
                        type="text"
                        placeholder="Registration"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Title (Malayalam)</label>
                    <input
                        type="text"
                        placeholder="രജിസ്ട്രേഷൻ"
                        value={formData.titleMl}
                        onChange={(e) => setFormData({ ...formData, titleMl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background font-noto"
                    />
                </div>
            </div>

            {/* Subtitles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Subtitle (English) - Optional</label>
                    <input
                        type="text"
                        placeholder="Theme..."
                        value={formData.subtitleEn}
                        onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Subtitle (Malayalam) - Optional</label>
                    <input
                        type="text"
                        placeholder="വിഷയം..."
                        value={formData.subtitleMl}
                        onChange={(e) => setFormData({ ...formData, subtitleMl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background font-noto"
                    />
                </div>
            </div>

            {/* Advanced JSON */}
            <div className="mb-4">
                <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Advanced Details (JSON) - Details & Lists</label>
                <textarea
                    value={formData.extendedDetails}
                    onChange={(e) => setFormData({ ...formData, extendedDetails: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background font-mono text-xs"
                    placeholder='{"details": [], "list": []}'
                />
                <p className="text-[10px] text-foreground/60 mt-1">
                    Edit only if you know what you are doing. Defines speakers and topics list.
                </p>
            </div>

            <div className="flex gap-2 mt-6">
                <button
                    onClick={() => isEdit && itemId ? handleUpdate(itemId) : handleAdd()}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-secondary text-white font-bold"
                >
                    <FiSave /> Save Item
                </button>
                <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-500 text-white font-bold"
                >
                    <FiX /> Cancel
                </button>
            </div>
        </div>
    )

    const renderDaySection = (dayNum: number, dayItems: ScheduleItem[]) => (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-4">
                Day {dayNum} - December {dayNum === 1 ? '5' : '6'}
            </h3>
            <div className="space-y-4">
                {dayItems.length === 0 ? (
                    <div className="text-center py-8 text-foreground/60">No items for this day</div>
                ) : (
                    dayItems.map((item) => {
                        const matchTitle = getEnglishTitle(item.title);
                        const isLive = currentSession === matchTitle;

                        return (
                            <div key={item.id}>
                                {editingId === item.id ? (
                                    renderForm(true, item.id)
                                ) : (
                                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isLive
                                            ? 'bg-red-500/10 border-red-500 shadow-md transform scale-[1.01]'
                                            : 'bg-primary/5 border-primary/20'
                                        }`}>
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="text-sm text-foreground/50 w-8">#{item.display_order}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${item.type === 'ceremony' ? 'bg-accent/20 text-accent' :
                                                    item.type === 'special' ? 'bg-secondary/20 text-secondary' :
                                                        'bg-primary/20 text-primary'
                                                }`}>
                                                {item.type.toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-sm text-foreground/60 flex items-center gap-2">
                                                    {item.time}
                                                    {isLive && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                            LIVE
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold truncate">{renderTitle(item.title)}</h4>
                                                {item.subtitle && <p className="text-sm text-foreground/60 truncate">{renderTitle(item.subtitle)}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {isLive ? (
                                                <button
                                                    onClick={handleClearLive}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors whitespace-nowrap"
                                                >
                                                    End Live
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetLive(item.title)}
                                                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-all whitespace-nowrap"
                                                >
                                                    Set Live
                                                </button>
                                            )}
                                            <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-primary/10 text-primary">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-accent/10 text-accent">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-primary text-white py-4 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Schedule Management</h1>
                            <p className="text-white/70 text-sm">Manage program schedule for both days</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSeed}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition-colors text-xs font-bold"
                            title="Reset Database with Default Data"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Reset Defaults
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 transition-colors"
                        >
                            <FiPlus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {currentSession && (
                    <div className="mb-8 p-4 bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 rounded-r-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Current Live Session</p>
                            <h3 className="text-lg font-bold">{currentSession}</h3>
                        </div>
                        <button onClick={handleClearLive} className="text-sm text-foreground/50 hover:text-red-500 underline">
                            Clear
                        </button>
                    </div>
                )}

                {showAddForm && renderForm(false)}
                {renderDaySection(1, day1Items)}
                {renderDaySection(2, day2Items)}
            </main>
        </div>
    )
}
