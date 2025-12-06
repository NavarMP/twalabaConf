import { FiActivity } from 'react-icons/fi'

type StatCardProps = {
    label: string
    value: number
    max?: number
    icon?: React.ReactNode
}

export default function StatCard({ label, value, max = 5, icon }: StatCardProps) {
    return (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
                {icon}
                {label}
            </p>
            <p className="text-2xl font-bold text-primary">
                {value.toFixed(1)}
                <span className="text-sm text-foreground/50">/{max}</span>
            </p>
        </div>
    )
}
