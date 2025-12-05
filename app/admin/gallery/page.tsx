'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GalleryItem } from '@/types/database'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiVideo } from 'react-icons/fi'

export default function GalleryManagement() {
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        media_url: '',
        media_type: 'photo' as 'photo' | 'video',
        display_order: 0
    })
    const supabase = createClient()

    const fetchItems = async () => {
        const { data } = await supabase
            .from('gallery')
            .select('*')
            .order('display_order', { ascending: true })
        if (data) setItems(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleAdd = async () => {
        const { error } = await supabase.from('gallery').insert([formData])
        if (!error) {
            setFormData({ title: '', media_url: '', media_type: 'photo', display_order: 0 })
            setShowAddForm(false)
            fetchItems()
        }
    }

    const handleUpdate = async (id: string) => {
        const { error } = await supabase.from('gallery').update(formData).eq('id', id)
        if (!error) {
            setEditingId(null)
            fetchItems()
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await supabase.from('gallery').delete().eq('id', id)
            fetchItems()
        }
    }

    const startEdit = (item: GalleryItem) => {
        setEditingId(item.id)
        setFormData({
            title: item.title || '',
            media_url: item.media_url,
            media_type: item.media_type,
            display_order: item.display_order
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
                            <h1 className="text-2xl font-bold">Gallery Management</h1>
                            <p className="text-white/70 text-sm">Add photos and videos to the gallery</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 transition-colors"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add Media
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Add Form */}
                {showAddForm && (
                    <div className="mb-8 p-6 rounded-2xl bg-secondary/10 border border-secondary/30">
                        <h3 className="text-lg font-semibold mb-4">Add New Media</h3>
                        <p className="text-sm text-foreground/60 mb-4">Upload a file or enter a URL.</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setFormData(prev => ({ ...prev, media_url: data.url }));
                                                }
                                            } catch (error) {
                                                console.error('Upload failed', error);
                                                alert('Upload failed');
                                            }
                                        }
                                    }}
                                    className="mb-2 w-full text-sm text-foreground/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                />
                                <input
                                    type="text"
                                    placeholder="Or enter Media URL"
                                    value={formData.media_url}
                                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Title (optional)"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="px-4 py-2 rounded-lg border border-primary/20 bg-background"
                            />
                            <div className="flex gap-2">
                                <select
                                    value={formData.media_type}
                                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'photo' | 'video' })}
                                    className="flex-1 px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                >
                                    <option value="photo">Photo</option>
                                    <option value="video">Video</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Order"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    className="w-20 px-4 py-2 rounded-lg border border-primary/20 bg-background"
                                />
                            </div>
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

                {/* Gallery Grid */}
                {items.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                        No media added yet. Click &quot;Add Media&quot; to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="rounded-xl overflow-hidden border border-primary/20 bg-primary/5">
                                {editingId === item.id ? (
                                    <div className="p-4 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="URL"
                                            value={formData.media_url}
                                            onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                        />
                                        <select
                                            value={formData.media_type}
                                            onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'photo' | 'video' })}
                                            className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                        >
                                            <option value="photo">Photo</option>
                                            <option value="video">Video</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Order"
                                            value={formData.display_order}
                                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdate(item.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-secondary text-white text-sm">
                                                <FiSave /> Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-gray-500 text-white">
                                                <FiX />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative">
                                            {item.media_type === 'photo' && item.media_url ? (
                                                <img
                                                    src={item.media_url}
                                                    alt={item.title || 'Gallery image'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {item.media_type === 'video' ? <FiVideo className="w-12 h-12 text-foreground/30" /> : <FiImage className="w-12 h-12 text-foreground/30" />}
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.media_type === 'video' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                                                    {item.media_type === 'video' ? 'VIDEO' : 'PHOTO'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-foreground/50">#{item.display_order}</span>
                                                    <h4 className="font-medium text-sm">{item.title || 'Untitled'}</h4>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-primary/10 text-primary">
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-accent/10 text-accent">
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
