import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Feedback } from '@/types/database'

// Function to load font
const loadFont = async (doc: jsPDF) => {
    try {
        const response = await fetch('/fonts/NotoSansMalayalam-Regular.ttf')
        if (!response.ok) throw new Error('Failed to load font')
        const blob = await response.blob()
        const reader = new FileReader()

        return new Promise<void>((resolve, reject) => {
            reader.onloadend = () => {
                const base64data = reader.result as string
                // Extract base64 part
                const base64 = base64data.split(',')[1]

                doc.addFileToVFS('NotoSansMalayalam-Regular.ttf', base64)
                doc.addFont('NotoSansMalayalam-Regular.ttf', 'NotoSansMalayalam', 'normal')
                doc.setFont('NotoSansMalayalam')
                resolve()
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error loading font:', error)
        // Fallback or ignore
    }
}

// --- CSX Export ---
export const exportToCSV = (feedbacks: Feedback[]) => {
    const headers = [
        'Name', 'Phone', 'Email',
        'Overall Rating', 'Overall Comments',
        'Sessions Rating', 'Sessions Comments',
        'Media Rating', 'Media Comments',
        'Volunteers Rating', 'Volunteers Comments',
        'Venue Rating', 'Venue Comments',
        'Suggestions', 'Submitted At'
    ]

    const rows = feedbacks.map(f => [
        f.name || '', f.phone || '', f.email || '',
        f.overall_rating, f.overall_comments || '',
        f.sessions_rating || '', f.sessions_comments || '',
        f.media_rating || '', f.media_comments || '',
        f.volunteers_rating || '', f.volunteers_comments || '',
        f.venue_rating || '', f.venue_comments || '',
        f.suggestions || '',
        new Date(f.created_at).toLocaleString()
    ])

    // Dynamically add custom fields and sections headers
    const customFieldKeys = new Set<string>()
    const customSectionKeys = new Set<string>()

    feedbacks.forEach(f => {
        if (f.custom_data?.fields) {
            Object.keys(f.custom_data.fields).forEach(k => customFieldKeys.add(k))
        }
        if (f.custom_data?.sections) {
            Object.keys(f.custom_data.sections).forEach(k => customSectionKeys.add(k))
        }
    })

    const sortedCustomFields = Array.from(customFieldKeys).sort()
    const sortedCustomSections = Array.from(customSectionKeys).sort()

    // Add headers for custom data
    sortedCustomFields.forEach(h => headers.push(h.replace(/_/g, ' ').toUpperCase()))
    sortedCustomSections.forEach(h => {
        headers.push(`${h.replace(/_/g, ' ').toUpperCase()} Rating`)
        headers.push(`${h.replace(/_/g, ' ').toUpperCase()} Comments`)
    })

    // Construct full CSV data
    const csvContent = [headers, ...rows.map((row, index) => {
        const feedback = feedbacks[index]
        const extendedRow = [...row]

        // Add custom field values
        sortedCustomFields.forEach(k => {
            extendedRow.push(feedback.custom_data?.fields?.[k] || '')
        })

        // Add custom section values
        sortedCustomSections.forEach(k => {
            const sectionData = feedback.custom_data?.sections?.[k]
            extendedRow.push(sectionData?.rating || '')
            extendedRow.push(sectionData?.comments || '')
        })

        // Escape CSV values
        return extendedRow.map(cell => {
            const str = String(cell)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        }).join(',')
    })].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

// --- Single PDF Export ---
export const exportSinglePDF = async (feedback: Feedback) => {
    const doc = new jsPDF()
    await loadFont(doc)
    doc.setFont('NotoSansMalayalam') // Explicitly set again to be sure

    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 167, 69) // Green color
    doc.text('TWALABA CONFERENCE 2025', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Feedback Report', pageWidth / 2, 30, { align: 'center' })

    doc.setDrawColor(200, 200, 200)
    doc.line(20, 35, pageWidth - 20, 35)

    // Personal Details
    doc.setFontSize(12)
    // doc.setFont('helvetica', 'bold') // Do not switch back to helvetica if we want malayalam support everywhere
    // Instead we rely on NotoSansMalayalam for everything which is fine.
    // Or we assume names might have malayalam.
    // Ideally we'd use NotoSansMalayalam-Bold if available, but we only downloaded Regular.
    // So we just use Regular.

    doc.text('Personal Details', 20, 45)

    doc.setFontSize(10)

    let yPos = 55
    const details = [
        ['Name:', feedback.name || 'Not provided'],
        ['Phone:', feedback.phone || 'Not provided'],
        ['Email:', feedback.email || 'Not provided'],
        ['Submitted:', new Date(feedback.created_at).toLocaleString()]
    ]

    // Add custom fields to details
    if (feedback.custom_data?.fields) {
        Object.entries(feedback.custom_data.fields).forEach(([key, val]) => {
            details.push([`${key.replace(/_/g, ' ')}:`, String(val)])
        })
    }

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: details,
        theme: 'plain',
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
        margin: { left: 20 },
        styles: { font: 'NotoSansMalayalam', fontStyle: 'normal' } // Use custom font in table
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Ratings Table
    doc.setFontSize(12)
    doc.text('Ratings & Comments', 20, yPos)

    const ratingsData = [
        ['Overall Experience', `${feedback.overall_rating}/5`, feedback.overall_comments || '-'],
        ['Sessions', `${feedback.sessions_rating || '-'}/5`, feedback.sessions_comments || '-'],
        ['Media', `${feedback.media_rating || '-'}/5`, feedback.media_comments || '-'],
        ['Volunteers', `${feedback.volunteers_rating || '-'}/5`, feedback.volunteers_comments || '-'],
        ['Venue', `${feedback.venue_rating || '-'}/5`, feedback.venue_comments || '-'],
    ]

    // Add Custom Sections
    if (feedback.custom_data?.sections) {
        Object.entries(feedback.custom_data.sections).forEach(([key, section]) => {
            ratingsData.push([
                key.replace(/_/g, ' '),
                `${section.rating}/5`,
                section.comments || '-'
            ])
        })
    }

    autoTable(doc, {
        startY: yPos + 5,
        head: [['Category', 'Rating', 'Comments']],
        body: ratingsData,
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69] },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 'auto' }
        },
        styles: { font: 'NotoSansMalayalam', fontStyle: 'normal' }
    })

    // Suggestions
    yPos = (doc as any).lastAutoTable.finalY + 15
    if (feedback.suggestions) {
        doc.setFontSize(12)
        doc.text('Suggestions', 20, yPos)

        doc.setFontSize(10)

        const splitText = doc.splitTextToSize(feedback.suggestions, pageWidth - 40)
        doc.text(splitText, 20, yPos + 7)
    }

    doc.save(`feedback_${feedback.name || 'anonymous'}_${feedback.id.slice(0, 6)}.pdf`)
}

// --- Bulk PDF Export ---
export const exportAllPDF = async (feedbacks: Feedback[]) => {
    const doc = new jsPDF('landscape')
    await loadFont(doc)
    doc.setFont('NotoSansMalayalam')

    doc.setFontSize(18)
    doc.text('Feedback Summary Report', 14, 22)
    doc.setFontSize(11)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30)

    const tableHeaders = ['Name', 'Phone', 'Overall', 'Sessions', 'Media', 'Volunteers', 'Venue', 'Submitted']

    const tableBody = feedbacks.map(f => [
        f.name || 'Anonymous',
        f.phone || '-',
        `${f.overall_rating}/5`,
        f.sessions_rating ? `${f.sessions_rating}/5` : '-',
        f.media_rating ? `${f.media_rating}/5` : '-',
        f.volunteers_rating ? `${f.volunteers_rating}/5` : '-',
        f.venue_rating ? `${f.venue_rating}/5` : '-',
        new Date(f.created_at).toLocaleDateString()
    ])

    autoTable(doc, {
        startY: 40,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [40, 167, 69] },
        styles: { fontSize: 9, font: 'NotoSansMalayalam', fontStyle: 'normal' },
    })

    doc.save(`feedback_summary_${new Date().toISOString().split('T')[0]}.pdf`)
}
