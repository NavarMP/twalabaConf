export type Guest = {
    id: string
    name: string
    title: string | null
    image_url: string | null
    display_order: number
    created_at: string
}

export type ScheduleItem = {
    id: string
    day: number // 1 or 2
    time: string
    title: string
    subtitle: string | null
    type: 'ceremony' | 'session' | 'special'
    details: Record<string, unknown> | null
    display_order: number
    created_at: string
}

export type GalleryItem = {
    id: string
    title: string | null
    media_url: string
    media_type: 'photo' | 'video' | 'embed'
    likes: number
    display_order: number
    tags: string[] | null // Array of strings or null
    created_at: string
}

export type Database = {
    public: {
        Tables: {
            guests: {
                Row: Guest
                Insert: Omit<Guest, 'id' | 'created_at'>
                Update: Partial<Omit<Guest, 'id' | 'created_at'>>
            }
            schedule: {
                Row: ScheduleItem
                Insert: Omit<ScheduleItem, 'id' | 'created_at'>
                Update: Partial<Omit<ScheduleItem, 'id' | 'created_at'>>
            }
            gallery: {
                Row: GalleryItem
                Insert: Omit<GalleryItem, 'id' | 'created_at' | 'likes'>
                Update: Partial<Omit<GalleryItem, 'id' | 'created_at'>>
            }
            settings: {
                Row: {
                    key: string
                    value: string
                    description: string | null
                }
                Insert: {
                    key: string
                    value: string
                    description?: string | null
                }
                Update: Partial<{
                    key: string
                    value: string
                    description: string | null
                }>
            }
        }
    }
}
