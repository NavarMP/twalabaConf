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
    // Bulk Action State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [bulkEditData, setBulkEditData] = useState<Record<string, { title: string, display_order: number }>>({});

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

    // Selection Handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(i => i.id));
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} items?`)) return;

        // 1. Delete physical files
        const itemsToDelete = items.filter(i => selectedIds.includes(i.id));
        for (const item of itemsToDelete) {
            if (item.media_url && !item.media_url.includes('youtube')) {
                try {
                    await fetch('/api/delete-file', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ media_url: item.media_url }),
                    });
                } catch (e) {
                    console.error('File delete failed', e);
                }
            }
        }

        // 2. Delete DB records
        const { error } = await supabase.from('gallery').delete().in('id', selectedIds);
        if (!error) {
            setSelectedIds([]);
            fetchItems();
        } else {
            alert('Bulk delete failed: ' + error.message);
        }
    };

    const startBulkEdit = () => {
        // Initialize bulkEditData with current values of selected items
        const initialData: any = {};
        items.filter(i => selectedIds.includes(i.id)).forEach(i => {
            initialData[i.id] = { title: i.title || '', display_order: i.display_order };
        });
        setBulkEditData(initialData);
        setIsBulkEditing(true);
    };

    const handleBulkSave = async () => {
        const updates = Object.entries(bulkEditData).map(async ([id, data]) => {
            return supabase.from('gallery').update(data).eq('id', id);
        });

        await Promise.all(updates);
        setIsBulkEditing(false);
        setBulkEditData({});
        setSelectedIds([]);
        fetchItems();
    };


    // ... upload logic ...
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
            <header className="bg-primary text-white py-4 px-6 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Gallery Management</h1>
                            {selectedIds.length > 0 ? (
                                <p className="text-white/90 text-sm font-bold bg-white/20 px-2 py-0.5 rounded inline-block">
                                    {selectedIds.length} Selected
                                </p>
                            ) : (
                                <p className="text-white/70 text-sm">Add photos and videos to the gallery</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Bulk Actions Toolbar */}
                        {selectedIds.length > 0 && !isBulkEditing && (
                            <>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition-all"
                                >
                                    <FiTrash2 /> Delete ({selectedIds.length})
                                </button>
                                <button
                                    onClick={startBulkEdit}
                                    className="flex items-center gap-2 px-3 py-2 bg-white text-primary hover:bg-white/90 rounded-lg text-sm font-bold transition-all"
                                >
                                    <FiEdit2 /> Edit/Arrange ({selectedIds.length})
                                </button>
                            </>
                        )}

                        {isBulkEditing && (
                            <>
                                <button
                                    onClick={() => { setIsBulkEditing(false); setBulkEditData({}); }}
                                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-sm font-bold transition-all shadow-lg"
                                >
                                    <FiSave /> Save Changes
                                </button>
                            </>
                        )}

                        {!isBulkEditing && (
                            <button
                                onClick={toggleSelectAll}
                                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                            >
                                {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Add Form */}
                {/* Bulk Upload / Add Area */}
                {!isBulkEditing && (
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
                )}

                {/* Gallery Grid */}
                {items.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                        No media added yet. Click &quot;Add Media&quot; to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`rounded-xl overflow-hidden border transition-all ${selectedIds.includes(item.id)
                                        ? 'border-primary ring-2 ring-primary bg-primary/10'
                                        : 'border-primary/20 bg-primary/5'
                                    }`}
                                onClick={(e) => {
                                    // Allow clicking anywhere to select if not interacting with controls
                                    if (!(e.target as HTMLElement).closest('button, input, select')) {
                                        toggleSelect(item.id);
                                    }
                                }}
                            >
                                {isBulkEditing && selectedIds.includes(item.id) && bulkEditData[item.id] ? (
                                    <div className="p-4 space-y-3 bg-white dark:bg-gray-900 h-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase text-primary">Editing</span>
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                readOnly
                                                className="w-4 h-4 text-primary rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-foreground/50 block mb-1">Title</label>
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 text-sm border rounded bg-background"
                                                value={bulkEditData[item.id].title}
                                                onChange={(e) => setBulkEditData({
                                                    ...bulkEditData,
                                                    [item.id]: { ...bulkEditData[item.id], title: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-foreground/50 block mb-1">Order</label>
                                            <input
                                                type="number"
                                                className="w-full px-2 py-1 text-sm border rounded bg-background"
                                                value={bulkEditData[item.id].display_order}
                                                onChange={(e) => setBulkEditData({
                                                    ...bulkEditData,
                                                    [item.id]: { ...bulkEditData[item.id], display_order: parseInt(e.target.value) || 0 }
                                                })}
                                            />
                                        </div>
                                    </div>
                                ) : editingId === item.id ? (
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
                                        <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative group">
                                            {/* Selection Checkbox Overlay */}
                                            <div className="absolute top-2 right-2 z-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary shadow-lg cursor-pointer"
                                                />
                                            </div>

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
                                            <div className="absolute top-2 left-2 pointer-events-none">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.media_type === 'video' ? 'bg-accent text-white' : item.media_type === 'embed' ? 'bg-purple-600 text-white' : 'bg-primary text-white'}`}>
                                                    {item.media_type === 'video' ? 'VIDEO' : item.media_type === 'embed' ? 'EMBED' : 'PHOTO'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-foreground/50">#{item.display_order}</span>
                                                    <h4 className="font-medium text-sm truncate max-w-[120px]" title={item.title || ''}>{item.title || 'Untitled'}</h4>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); startEdit(item); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary">
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 rounded-lg hover:bg-accent/10 text-accent">
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
