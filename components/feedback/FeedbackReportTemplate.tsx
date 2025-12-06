import { forwardRef } from 'react'
import { Feedback } from '@/types/database'
import StarDisplay from './StarDisplay'

type Props = {
    feedback: Feedback
}

const FeedbackReportTemplate = forwardRef<HTMLDivElement, Props>(({ feedback }, ref) => {
    return (
        <div ref={ref} className="bg-white text-black p-8 font-malayalam w-[210mm] min-h-[297mm] mx-auto shadow-none">
            {/* Header */}
            <div className="border-b-2 border-green-600 pb-4 mb-8 text-center">
                <h1 className="text-3xl font-bold text-green-700 mb-2 font-poppins">TWALABA CONFERENCE 2025</h1>
                <p className="text-lg text-gray-600 uppercase tracking-widest font-poppins">Feedback Report</p>
                <div className="mt-2 text-sm text-gray-500">
                    Generated on {new Date().toLocaleString()}
                </div>
            </div>

            {/* Personal Details */}
            <div className="mb-8">
                <h2 className="text-xl font-bold border-l-4 border-green-600 pl-3 mb-4 text-gray-800 font-poppins">Personal Details</h2>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="font-semibold text-gray-600">Name:</div>
                    <div>{feedback.name || 'Not provided'}</div>

                    <div className="font-semibold text-gray-600">Phone:</div>
                    <div>{feedback.phone || 'Not provided'}</div>

                    <div className="font-semibold text-gray-600">Email:</div>
                    <div>{feedback.email || 'Not provided'}</div>

                    <div className="font-semibold text-gray-600">Submitted:</div>
                    <div>{new Date(feedback.created_at).toLocaleString()}</div>

                    {/* Custom Fields */}
                    {feedback.custom_data?.fields && Object.entries(feedback.custom_data.fields).map(([key, val]) => (
                        <>
                            <div className="font-semibold text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</div>
                            <div>{val as string}</div>
                        </>
                    ))}
                </div>
            </div>

            {/* Ratings & Comments */}
            <div className="mb-8">
                <h2 className="text-xl font-bold border-l-4 border-green-600 pl-3 mb-4 text-gray-800 font-poppins">Ratings & Comments</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-green-50 text-green-800 text-sm font-semibold border-b border-green-200">
                            <th className="p-3 w-1/3">Category</th>
                            <th className="p-3 w-1/6 text-center">Rating</th>
                            <th className="p-3">Comments</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { label: 'Overall Experience', rating: feedback.overall_rating, comment: feedback.overall_comments },
                            { label: 'Sessions & Programs', rating: feedback.sessions_rating, comment: feedback.sessions_comments },
                            { label: 'Media & Coverage', rating: feedback.media_rating, comment: feedback.media_comments },
                            { label: 'Volunteers & Staff', rating: feedback.volunteers_rating, comment: feedback.volunteers_comments },
                            { label: 'Venue & Facilities', rating: feedback.venue_rating, comment: feedback.venue_comments },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="p-3 font-medium text-gray-700">{row.label}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center">
                                        <StarDisplay rating={row.rating || 0} size="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1 block">{row.rating ? `${row.rating}/5` : '-'}</span>
                                </td>
                                <td className="p-3 text-gray-600 italic">{row.comment || '-'}</td>
                            </tr>
                        ))}
                        {/* Custom Sections */}
                        {feedback.custom_data?.sections && Object.entries(feedback.custom_data.sections).map(([key, section]) => (
                            <tr key={key} className="border-b border-gray-100 last:border-0">
                                <td className="p-3 font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center">
                                        <StarDisplay rating={section.rating} size="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1 block">{section.rating}/5</span>
                                </td>
                                <td className="p-3 text-gray-600 italic">{section.comments || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Suggestions */}
            {feedback.suggestions && (
                <div className="mb-8 page-break-inside-avoid">
                    <h2 className="text-xl font-bold border-l-4 border-green-600 pl-3 mb-4 text-gray-800 font-poppins">Suggestions</h2>
                    <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed italic border border-gray-100">
                        "{feedback.suggestions}"
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 font-poppins">
                <p>&copy; {new Date().getFullYear()} SKSSF Twalaba Conference. All rights reserved.</p>
            </div>
        </div>
    )
})

FeedbackReportTemplate.displayName = 'FeedbackReportTemplate'
export default FeedbackReportTemplate
