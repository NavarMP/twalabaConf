'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GalleryItem } from '@/types/database'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiVideo } from 'react-icons/fi'
import imageCompression from 'browser-image-compression';

export default function GalleryManagement() {
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        media_url: '',
        media_type: 'photo' as 'photo' | 'video' | 'embed',
        display_order: 0
    })
    const supabase = createClient()

    // Link/Embed State
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkType, setLinkType] = useState<'photo' | 'video' | 'embed'>('photo');
    const [linkTitle, setLinkTitle] = useState('');

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

    const [uploadQueue, setUploadQueue] = useState<{ file: File, progress: number, status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error', type: string }[]>([])

    // ... items fetching ...

    const getMaxOrder = () => {
        return items.reduce((max, item) => Math.max(max, item.display_order || 0), 0)
    }

    const getEmbedUrl = (input: string) => {
        // Check if input is a full iframe tag
        if (input.trim().startsWith('<iframe')) {
            const srcMatch = input.match(/src="([^"]+)"/);
            return srcMatch ? srcMatch[1] : input; // Fallback to input if src not found
        }

        // Optional: Keep YouTube conversion for convenience
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = input.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }

        // Return as is for other URLs (Instagram, Maps, etc.)
        return input;
    }

    const handleLinkSubmit = async () => {
        let finalUrl = linkUrl;
        if (linkType === 'embed') {
            finalUrl = getEmbedUrl(linkUrl);
        }

        const { error } = await supabase.from('gallery').insert([{
            title: linkTitle || 'Untitled',
            media_url: finalUrl,
            media_type: linkType,
            display_order: getMaxOrder() + 1
        }]);

        if (!error) {
            setLinkUrl('');
            setLinkTitle('');
            fetchItems();
            alert('Added successfully');
        } else {
            alert('Failed to add: ' + error.message);
        }
    }

    const handleBulkUpload = async (files: File[]) => {
        let currentOrder = getMaxOrder() + 1;

        // Add to queue
        const newQueue = files.map(file => ({
            file,
            progress: 0,
            status: 'pending' as const,
            type: file.type
        }));
        setUploadQueue(prev => [...prev, ...newQueue]);

        // Process uploads one by one
        for (let i = 0; i < files.length; i++) {
            let fileToUpload = files[i];
            const startOrder = currentOrder + i;

            // Compress if image
            if (fileToUpload.type.startsWith('image/')) {
                setUploadQueue(prev => prev.map(item => item.file === files[i] ? { ...item, status: 'compressing' as any } : item)); // Add 'compressing' status to type locally if needed or just use 'uploading' with text change
                try {
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    }
                    fileToUpload = await imageCompression(fileToUpload, options);
                } catch (error) {
                    console.error('Compression failed:', error);
                    // Fallback to original file
                }
            }

            // Update status to uploading
            setUploadQueue(prev => prev.map(item => item.file === files[i] ? { ...item, status: 'uploading' } : item));

            const formData = new FormData();
            formData.append('file', fileToUpload);

            try {
                // Simulate progress
                const progressInterval = setInterval(() => {
                    setUploadQueue(prev => prev.map(item =>
                        (item.file === files[i] && item.progress < 90) ? { ...item, progress: item.progress + 10 } : item
                    ));
                }, 100);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                clearInterval(progressInterval);
                const data = await res.json();

                if (data.success) {
                    // Create DB Entry
                    const { error } = await supabase.from('gallery').insert([{
                        title: files[i].name.split('.')[0], // Original filename for title
                        media_url: data.url,
                        media_type: fileToUpload.type.startsWith('image/') ? 'photo' : 'video',
                        display_order: startOrder
                    }]);

                    if (!error) {
                        setUploadQueue(prev => prev.map(item => item.file === files[i] ? { ...item, progress: 100, status: 'done' } : item));
                        fetchItems(); // Refresh gallery
                    } else {
                        setUploadQueue(prev => prev.map(item => item.file === files[i] ? { ...item, status: 'error' } : item));
                    }
                } else {
                    setUploadQueue(prev => prev.map(item => item.file === files[i] ? { ...item, status: 'error' } : item));
                }
            } catch (error) {
                console.error(error);
                setUploadQueue(prev => prev.map(item => item.file === files[i] ? { ...item, status: 'error' } : item));
            }
        }

        // Clear done items after 3 seconds
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.status !== 'done'));
        }, 3000);
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
            const itemToDelete = items.find(item => item.id === id);

            if (itemToDelete?.media_url) {
                try {
                    await fetch('/api/delete-file', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ media_url: itemToDelete.media_url }),
                    });
                } catch (error) {
                    console.error('Failed to delete physical file:', error);
                }
            }

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

                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Add Form */}
                {/* Bulk Upload / Add Area */}
                <div className="mb-8 p-6 rounded-2xl bg-secondary/10 border border-secondary/30">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setUploadMode('file')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${uploadMode === 'file' ? 'bg-primary text-white shadow-lg' : 'bg-background text-foreground/70 hover:text-primary'}`}
                            >
                                File Upload
                            </button>
                            <button
                                onClick={() => setUploadMode('url')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${uploadMode === 'url' ? 'bg-primary text-white shadow-lg' : 'bg-background text-foreground/70 hover:text-primary'}`}
                            >
                                Link / Embed
                            </button>
                        </div>
                    </div>

                    {uploadMode === 'file' ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Upload Media</h3>
                                <div className="text-sm text-foreground/60">
                                    Supports JPG, PNG, MP4. (Max 50MB)
                                </div>
                            </div>

                            {/* Drop Zone */}
                            <div
                                className="relative border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
                                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); }}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-primary');
                                    const files = Array.from(e.dataTransfer.files);
                                    handleBulkUpload(files);
                                }}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        if (e.target.files) handleBulkUpload(Array.from(e.target.files));
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <FiPlus className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Drop files here or click to upload</p>
                                        <p className="text-sm text-foreground/50">Select multiple photos/videos to bulk upload</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-4">
                            <h3 className="text-lg font-bold mb-4">Add External Link</h3>

                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-80">Media Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setLinkType('photo')}
                                        className={`flex-1 py-2 rounded-lg border ${linkType === 'photo' ? 'bg-primary text-white border-primary' : 'border-primary/20 hover:border-primary'}`}
                                    >Photo</button>
                                    <button
                                        onClick={() => setLinkType('video')}
                                        className={`flex-1 py-2 rounded-lg border ${linkType === 'video' ? 'bg-primary text-white border-primary' : 'border-primary/20 hover:border-primary'}`}
                                    >Video</button>
                                    <button
                                        onClick={() => setLinkType('embed')}
                                        className={`flex-1 py-2 rounded-lg border ${linkType === 'embed' ? 'bg-primary text-white border-primary' : 'border-primary/20 hover:border-primary'}`}
                                    >Embed (YouTube)</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-80">
                                    {linkType === 'embed' ? 'YouTube URL / Embed Link' : 'Direct Media URL'}
                                </label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder={linkType === 'embed' ? "https://www.youtube.com/watch?v=..." : "https://example.com/image.jpg"}
                                    className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-80">Title (Optional)</label>
                                <input
                                    type="text"
                                    value={linkTitle}
                                    onChange={(e) => setLinkTitle(e.target.value)}
                                    placeholder="Enter a title"
                                    className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            <button
                                onClick={handleLinkSubmit}
                                disabled={!linkUrl}
                                className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50"
                            >
                                Add to Gallery
                            </button>
                        </div>
                    )}

                    {/* Progress Area */}
                    {uploadQueue.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h4 className="font-bold text-sm">Uploading...</h4>
                            {uploadQueue.map((file, idx) => (
                                <div key={idx} className="bg-background rounded-lg p-3 flex items-center gap-3 border border-border">
                                    <div className="bg-primary/10 p-2 rounded text-primary">
                                        {file.type.startsWith('video') ? <FiVideo /> : <FiImage />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold w-20 text-right">
                                        {file.status === 'done' ? '✓' :
                                            file.status === 'compressing' ? 'Compressing...' :
                                                file.status === 'error' ? 'Error' :
                                                    `${file.progress}%`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                                            <option value="embed">Embed</option>
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
                                            ) : item.media_type === 'embed' ? (
                                                <iframe
                                                    src={item.media_url}
                                                    className="w-full h-full pointer-events-none"
                                                    title={item.title || 'Embed'}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {item.media_type === 'video' ? <FiVideo className="w-12 h-12 text-foreground/30" /> : <FiImage className="w-12 h-12 text-foreground/30" />}
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.media_type === 'video' ? 'bg-accent text-white' : item.media_type === 'embed' ? 'bg-purple-600 text-white' : 'bg-primary text-white'}`}>
                                                    {item.media_type === 'video' ? 'VIDEO' : item.media_type === 'embed' ? 'EMBED' : 'PHOTO'}
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
