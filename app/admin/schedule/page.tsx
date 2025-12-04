'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ScheduleItem } from '@/types/database'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi'

export default function ScheduleManagement() {
    const [items, setItems] = useState<ScheduleItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        day: 1,
        time: '',
        title: '',
        subtitle: '',
        type: 'session' as 'ceremony' | 'session' | 'special',
        display_order: 0
    })
    const supabase = createClient()

    const fetchItems = async () => {
        const { data } = await supabase
            .from('schedule')
            .select('*')
            .order('day', { ascending: true })
            .order('display_order', { ascending: true })
        if (data) setItems(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleAdd = async () => {
        const { error } = await supabase.from('schedule').insert([formData])
        if (!error) {
            setFormData({ day: 1, time: '', title: '', subtitle: '', type: 'session', display_order: 0 })
            setShowAddForm(false)
            fetchItems()
        }
    }

    const handleUpdate = async (id: string) => {
        const { error } = await supabase.from('schedule').update(formData).eq('id', id)
        if (!error) {
            setEditingId(null)
            fetchItems()
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await supabase.from('schedule').delete().eq('id', id)
            fetchItems()
        }
    }

    const startEdit = (item: ScheduleItem) => {
        setEditingId(item.id)
        setFormData({
            day: item.day,
            time: item.time,
            title: item.title,
            subtitle: item.subtitle || '',
            type: item.type,
            display_order: item.display_order
        })
    }

    const day1Items = items.filter(i => i.day === 1)
    const day2Items = items.filter(i => i.day === 2)

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                >
                    <option value={1}>Day 1 - December 5</option>
                    <option value={2}>Day 2 - December 6</option>
                </select>
                <input
                    type="text"
                    placeholder="Time (e.g. 9:00 AM - 11:00 AM)"
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
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background md:col-span-2"
                />
                <input
                    type="number"
                    placeholder="Order"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                />
                <input
                    type="text"
                    placeholder="Subtitle (optional)"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-background md:col-span-3"
                />
            </div>
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => isEdit && itemId ? handleUpdate(itemId) : handleAdd()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white"
                >
                    <FiSave /> Save
                </button>
                <button
                    onClick={() => isEdit ? setEditingId(null) : setShowAddForm(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 text-white"
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
                    dayItems.map((item) => (
                        <div key={item.id}>
                            {editingId === item.id ? (
                                renderForm(true, item.id)
                            ) : (
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-foreground/50 w-8">#{item.display_order}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'ceremony' ? 'bg-accent/20 text-accent' :
                                                item.type === 'special' ? 'bg-secondary/20 text-secondary' :
                                                    'bg-primary/20 text-primary'
                                            }`}>
                                            {item.type.toUpperCase()}
                                        </span>
                                        <div>
                                            <div className="text-sm text-foreground/60">{item.time}</div>
                                            <h4 className="font-semibold">{item.title}</h4>
                                            {item.subtitle && <p className="text-sm text-foreground/60">{item.subtitle}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
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
                    ))
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
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
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 transition-colors"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {showAddForm && renderForm(false)}
                {renderDaySection(1, day1Items)}
                {renderDaySection(2, day2Items)}
            </main>
        </div>
    )
}
