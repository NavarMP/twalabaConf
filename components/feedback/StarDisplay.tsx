import { FiStar } from 'react-icons/fi'

type StarDisplayProps = {
    rating: number | null
    max?: number
    size?: string
}

export default function StarDisplay({ rating, max = 5, size = "w-4 h-4" }: StarDisplayProps) {
    if (!rating) return <span className="text-foreground/40 text-sm">Not rated</span>

    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => {
                const star = i + 1
                return (
                    <FiStar
                        key={star}
                        className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                    />
                )
            })}
        </div>
    )
}
