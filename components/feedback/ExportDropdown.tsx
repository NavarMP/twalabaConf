'use client'

import { useState, useRef, useEffect } from 'react'
import { FiDownload, FiFileText, FiChevronDown } from 'react-icons/fi'

type ExportDropdownProps = {
    onExportCSV: () => void
    onExportPDF: () => void
    label?: string
    iconOnly?: boolean
}

export default function ExportDropdown({ onExportCSV, onExportPDF, label = 'Export', iconOnly = false }: ExportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-lg transition-colors ${iconOnly
                        ? 'p-2 text-primary hover:bg-primary/10'
                        : 'px-4 py-2 bg-secondary text-white hover:bg-secondary/90 font-medium'
                    }`}
                title="Export"
            >
                <FiDownload className={`${iconOnly ? 'w-4 h-4' : 'w-4 h-4'}`} />
                {!iconOnly && (
                    <>
                        <span>{label}</span>
                        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-primary/20 rounded-xl shadow-lg z-50 overflow-hidden text-sm">
                    <button
                        onClick={() => {
                            onExportCSV()
                            setIsOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-2 text-foreground/80 transition-colors"
                    >
                        <FiFileText className="w-4 h-4 text-green-600" />
                        Export as CSV
                    </button>
                    <button
                        onClick={() => {
                            onExportPDF()
                            setIsOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-2 text-foreground/80 transition-colors border-t border-primary/10"
                    >
                        <FiDownload className="w-4 h-4 text-red-500" />
                        Export as PDF
                    </button>
                </div>
            )}
        </div>
    )
}
