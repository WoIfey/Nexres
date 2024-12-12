

export type Resource = {
    id: string
    name: string
    description: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
    bookings?: Array<{
        id: number
        date: Date
        endDate: Date
        userId: string
        resourceId: string | null
        createdAt: Date
        updatedAt: Date
    }>
} 