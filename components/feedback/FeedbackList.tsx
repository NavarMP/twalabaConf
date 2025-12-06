import { useRef, useState, useEffect } from 'react'
import { FiUser, FiPhone, FiMail, FiTrash2, FiMessageSquare } from 'react-icons/fi'
import { Feedback } from '@/types/database'
import StarDisplay from './StarDisplay'
import { exportToCSV } from '@/lib/utils/export'
import ExportDropdown from './ExportDropdown'
import FeedbackReportTemplate from './FeedbackReportTemplate'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type FeedbackListProps = {
    feedbacks: Feedback[]
    onDelete?: (id: string) => void
    readOnly?: boolean
}

export default function FeedbackList({ feedbacks, onDelete, readOnly = false }: FeedbackListProps) {
    const [reportFeedback, setReportFeedback] = useState<Feedback | null>(null)
    const reportRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (reportFeedback && reportRef.current) {
            const generatePDF = async () => {
                try {
                    // Slight delay to ensure render
                    await new Promise(resolve => setTimeout(resolve, 100))

                    const canvas = await html2canvas(reportRef.current!, {
                        scale: 2, // Higher quality
                        useCORS: true,
                        logging: false
                    })

                    const imgData = canvas.toDataURL('image/png')
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    })

                    const imgProps = pdf.getImageProperties(imgData)
                    const pdfWidth = pdf.internal.pageSize.getWidth()
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                    pdf.save(`feedback_${reportFeedback.name || 'report'}.pdf`)
                } catch (err) {
                    console.error('PDF Generation failed:', err)
                    alert('Failed to generate PDF. Please try again.')
                } finally {
                    setReportFeedback(null)
                }
            }
            generatePDF()
        }
    }, [reportFeedback])


    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-12 bg-primary/5 rounded-2xl border border-primary/20">
                <FiMessageSquare className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                <p className="text-foreground/60">No feedback received yet</p>
                {readOnly ? (
                    <p className="text-sm text-foreground/40 mt-1">Check back later for updates</p>
                ) : (
                    <p className="text-sm text-foreground/40 mt-1">Share the feedback link with attendees</p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {feedbacks.map((feedback) => (
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
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-foreground/50">{new Date(feedback.created_at).toLocaleString()}</p>
                            <ExportDropdown
                                onExportCSV={() => exportToCSV([feedback])}
                                onExportPDF={() => setReportFeedback(feedback)}
                                iconOnly={true}
                            />
                            {!readOnly && onDelete && (
                                <button
                                    onClick={() => onDelete(feedback.id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete feedback"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
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
            ))}

            {/* Hidden Report Template for PDF Generation */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                {reportFeedback && (
                    <FeedbackReportTemplate ref={reportRef} feedback={reportFeedback} />
                )}
            </div>
        </div>
    )
}
