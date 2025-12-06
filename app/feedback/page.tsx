'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { FiStar, FiCheck, FiSend, FiHome } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '@/components/Footer'

type FeedbackSection = {
    key: string
    label: string
    labelMl: string
    enabled: boolean
    required: boolean
    maxLength: number
    displayOrder: number
}

type FeedbackField = {
    key: string
    label: string
    labelMl: string
    enabled: boolean
    required: boolean
    type: 'text' | 'tel' | 'email' | 'select'
    options?: string[]
    displayOrder: number
}

const defaultFields: FeedbackField[] = [
    { key: 'name', label: 'Name', labelMl: 'പേര്', enabled: true, required: true, type: 'text', displayOrder: 0 },
    { key: 'phone', label: 'Phone', labelMl: 'ഫോൺ', enabled: true, required: true, type: 'tel', displayOrder: 1 },
    { key: 'email', label: 'Email', labelMl: 'ഇമെയിൽ', enabled: true, required: false, type: 'email', displayOrder: 2 },
]

const defaultSections: FeedbackSection[] = [
    { key: 'overall', label: 'Overall Experience', labelMl: 'മൊത്തത്തിലുള്ള അനുഭവം', enabled: true, required: true, maxLength: 500, displayOrder: 0 },
    { key: 'sessions', label: 'Sessions & Programs', labelMl: 'സെഷനുകളും പ്രോഗ്രാമുകളും', enabled: true, required: false, maxLength: 500, displayOrder: 1 },
    { key: 'media', label: 'Media & Coverage', labelMl: 'മീഡിയ കവറേജ്', enabled: true, required: false, maxLength: 500, displayOrder: 2 },
    { key: 'volunteers', label: 'Volunteers & Staff', labelMl: 'വോളണ്ടിയർമാർ', enabled: true, required: false, maxLength: 500, displayOrder: 3 },
    { key: 'venue', label: 'Venue & Facilities', labelMl: 'വേദിയും സൗകര്യങ്ങളും', enabled: true, required: false, maxLength: 500, displayOrder: 4 },
]

export default function FeedbackPage() {
    const [formData, setFormData] = useState<Record<string, string>>({ name: '', phone: '', email: '' })
    const [fields, setFields] = useState<FeedbackField[]>(defaultFields)
    const [sections, setSections] = useState<FeedbackSection[]>(defaultSections)
    const [loading, setLoading] = useState(true)
    const [ratings, setRatings] = useState<Record<string, number>>({
        overall: 0, sessions: 0, media: 0, volunteers: 0, venue: 0,
    })
    const [comments, setComments] = useState<Record<string, string>>({
        overall: '', sessions: '', media: '', volunteers: '', venue: '',
    })
    const [suggestions, setSuggestions] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const fetchConfig = async () => {
            const [sectionsRes, fieldsRes] = await Promise.all([
                supabase.from('settings').select('value').eq('key', 'feedback_sections').single(),
                supabase.from('settings').select('value').eq('key', 'feedback_fields').single()
            ])

            if (sectionsRes.data?.value) {
                try { setSections(JSON.parse(sectionsRes.data.value)) } catch (e) { }
            }
            if (fieldsRes.data?.value) {
                try { setFields(JSON.parse(fieldsRes.data.value)) } catch (e) { }
            }
            setLoading(false)
        }
        fetchConfig()
    }, [])

    const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.displayOrder - b.displayOrder)
    const enabledFields = fields.filter(f => f.enabled).sort((a, b) => a.displayOrder - b.displayOrder)

    const handleFieldChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleRating = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }))
    }

    const handleComment = (category: string, value: string, maxLength: number) => {
        if (value.length <= maxLength) {
            setComments(prev => ({ ...prev, [category]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        for (const field of enabledFields) {
            if (field.required && !formData[field.key]?.trim()) {
                setError(`Please enter your ${field.label.toLowerCase()}`)
                return
            }
        }

        // Check required sections
        for (const section of enabledSections) {
            if (section.required && ratings[section.key] === 0) {
                setError(`Please rate: ${section.label}`)
                return
            }
        }

        setSubmitting(true)
        setError(null)

        // Collect custom section data (sections that aren't in the default list)
        const defaultSectionKeys = ['overall', 'sessions', 'media', 'volunteers', 'venue']
        const defaultFieldKeys = ['name', 'phone', 'email']

        const customSectionsData: Record<string, { rating: number; comments: string | null }> = {}
        for (const section of enabledSections) {
            if (!defaultSectionKeys.includes(section.key)) {
                customSectionsData[section.key] = {
                    rating: ratings[section.key] || 0,
                    comments: comments[section.key] || null,
                }
            }
        }

        const customFieldsData: Record<string, string | null> = {}
        for (const field of enabledFields) {
            if (!defaultFieldKeys.includes(field.key)) {
                customFieldsData[field.key] = formData[field.key] || null
            }
        }

        const payload = {
            name: formData.name || null,
            phone: formData.phone || null,
            email: formData.email || null,
            overall_rating: ratings.overall,
            overall_comments: comments.overall || null,
            sessions_rating: ratings.sessions || null,
            sessions_comments: comments.sessions || null,
            media_rating: ratings.media || null,
            media_comments: comments.media || null,
            volunteers_rating: ratings.volunteers || null,
            volunteers_comments: comments.volunteers || null,
            venue_rating: ratings.venue || null,
            venue_comments: comments.venue || null,
            suggestions: suggestions || null,
            custom_data: Object.keys(customSectionsData).length > 0 || Object.keys(customFieldsData).length > 0
                ? { sections: customSectionsData, fields: customFieldsData }
                : null,
        }

        const { error: submitError } = await supabase.from('feedback').insert([payload])

        if (submitError) {
            setError(`Failed to submit feedback: ${submitError.message || 'Please try again.'}`)
            console.error('Feedback submission error:', submitError.message, submitError.code, submitError.details)
        } else {
            setSubmitted(true)
        }

        setSubmitting(false)
    }

    const StarRating = ({ category, value }: { category: string, value: number }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(category, star)}
                    className={`p-1 transition-transform hover:scale-110 ${star <= value ? 'text-yellow-400' : 'text-foreground/20'}`}
                >
                    <FiStar className={`w-7 h-7 ${star <= value ? 'fill-yellow-400' : ''}`} />
                </button>
            ))}
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-primary/5">
            {/* Header */}
            <header className="py-4 px-6 border-b border-primary/10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 relative">
                            <Image src="/assets/Logo.svg" alt="SKSSF Logo" fill className="object-contain logo-dark-adaptive" />
                        </div>
                        <span className="font-bold text-foreground hidden sm:block">SKSSF Twalaba Conference</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium">
                        <FiHome className="w-4 h-4" />
                        <span className="hidden sm:block">Home</span>
                    </Link>
                </div>
            </header>

            <main className="flex-grow py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Conference Feedback</h1>
                        <p className="text-foreground/70 text-sm font-noto">സമ്മേളന ഫീഡ്ബാക്ക്</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <FiCheck className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
                                <p className="text-foreground/70">Your feedback has been submitted successfully.</p>
                                <p className="text-foreground/70 mt-2 font-noto">നിങ്ങളുടെ ഫീഡ്ബാക്ക് സമർപ്പിച്ചു. നന്ദി!</p>
                                <Link href="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
                                    <FiHome className="w-4 h-4" /> Back to Home
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {/* Personal Details - Dynamic */}
                                {enabledFields.length > 0 && (
                                    <div className="bg-background border border-primary/10 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-foreground mb-4">Your Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {enabledFields.map((field) => (
                                                <div key={field.key} className={field.key === 'email' ? 'md:col-span-2' : ''}>
                                                    <label className="block text-sm font-medium text-foreground/70 mb-1">
                                                        {field.label} / <span className="font-noto">{field.labelMl}</span>
                                                        {field.required ? <span className="text-red-500 ml-1">*</span> : <span className="text-foreground/40 ml-1">(Optional)</span>}
                                                    </label>
                                                    {field.type === 'select' ? (
                                                        <select
                                                            value={formData[field.key] || ''}
                                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                            required={field.required}
                                                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                        >
                                                            <option value="">Select {field.label.toLowerCase()}...</option>
                                                            {field.options?.map((option) => (
                                                                <option key={option} value={option}>{option}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            value={formData[field.key] || ''}
                                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                            placeholder={`Your ${field.label.toLowerCase()}`}
                                                            required={field.required}
                                                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rating Sections - Dynamic */}
                                {enabledSections.map((section, index) => (
                                    <motion.div
                                        key={section.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-background border rounded-2xl p-6 shadow-sm ${section.required ? 'border-primary/30 bg-primary/5' : 'border-primary/10'}`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">
                                                    {section.label}
                                                    {section.required && <span className="text-red-500 ml-1">*</span>}
                                                </h3>
                                                <p className="text-sm text-foreground/60 font-noto">{section.labelMl}</p>
                                            </div>
                                            <StarRating category={section.key} value={ratings[section.key]} />
                                        </div>
                                        <div>
                                            <textarea
                                                value={comments[section.key] || ''}
                                                onChange={(e) => handleComment(section.key, e.target.value, section.maxLength)}
                                                placeholder="Share your thoughts..."
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-sm"
                                            />
                                            <p className="text-xs text-foreground/40 mt-1 text-right">
                                                {(comments[section.key] || '').length}/{section.maxLength}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Suggestions */}
                                <div className="bg-background border border-primary/10 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-2">Suggestions & Ideas</h3>
                                    <p className="text-sm text-foreground/60 font-noto mb-4">നിർദ്ദേശങ്ങളും ആശയങ്ങളും</p>
                                    <textarea
                                        value={suggestions}
                                        onChange={(e) => setSuggestions(e.target.value)}
                                        placeholder="Any suggestions for future conferences..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-3 bg-secondary text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-secondary/25"
                                >
                                    {submitting ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FiSend className="w-5 h-5" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    )
}
