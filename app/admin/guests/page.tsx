'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/types/database'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi'

export default function GuestsManagement() {
    const [guests, setGuests] = useState<Guest[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', title: '', image_url: '', display_order: 0 })
    const router = useRouter()
    const supabase = createClient()

    const fetchGuests = async () => {
        const { data } = await supabase
            .from('guests')
            .select('*')
            .order('display_order', { ascending: true })
        if (data) setGuests(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchGuests()
    }, [])

    const handleAdd = async () => {
        const { error } = await supabase.from('guests').insert([formData])
        if (!error) {
            setFormData({ name: '', title: '', image_url: '', display_order: 0 })
            setShowAddForm(false)
            fetchGuests()
        }
    }

    const handleUpdate = async (id: string) => {
        const { error } = await supabase.from('guests').update(formData).eq('id', id)
        if (!error) {
            setEditingId(null)
            fetchGuests()
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this guest?')) {
            await supabase.from('guests').delete().eq('id', id)
            fetchGuests()
        }
    }

    const startEdit = (guest: Guest) => {
        setEditingId(guest.id)
        setFormData({
            name: guest.name,
            title: guest.title || '',
            image_url: guest.image_url || '',
            display_order: guest.display_order
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-primary text-white py-4 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Guests Management</h1>
                            <p className="text-white/70 text-sm">Add, edit, or remove distinguished guests</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 transition-colors"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add Guest
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Add Form */}
                {showAddForm && (
                    <div className="mb-8 p-6 rounded-2xl bg-secondary/10 border border-secondary/30">
                        <h3 className="text-lg font-semibold mb-4">Add New Guest</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                            />
                            <input
                                type="text"
                                placeholder="Title / Designation"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                            />
                            <input
                                type="number"
                                placeholder="Order"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white">
                                <FiSave /> Save
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 text-white">
                                <FiX /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Guests List */}
                <div className="space-y-4">
                    {guests.length === 0 ? (
                        <div className="text-center py-12 text-foreground/60">
                            No guests added yet. Click &quot;Add Guest&quot; to get started.
                        </div>
                    ) : (
                        guests.map((guest) => (
                            <div key={guest.id} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                                {editingId === guest.id ? (
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                        />
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                        />
                                        <input
                                            type="text"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                        />
                                        <input
                                            type="number"
                                            value={formData.display_order}
                                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                            className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-foreground/50 w-8">#{guest.display_order}</span>
                                        <div>
                                            <h4 className="font-semibold">{guest.name}</h4>
                                            <p className="text-sm text-foreground/60">{guest.title}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    {editingId === guest.id ? (
                                        <>
                                            <button onClick={() => handleUpdate(guest.id)} className="p-2 rounded-lg bg-secondary text-white">
                                                <FiSave />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-gray-500 text-white">
                                                <FiX />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(guest)} className="p-2 rounded-lg hover:bg-primary/10 text-primary">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(guest.id)} className="p-2 rounded-lg hover:bg-accent/10 text-accent">
                                                <FiTrash2 />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
