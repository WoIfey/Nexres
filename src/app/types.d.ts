interface Resource {
    id: string
    name: string
    description: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
    bookings?: Booking[]
    isEditing?: boolean
}

interface Booking {
    id: number
    startDate: string | Date
    endDate: string | Date
    resource?: {
        name: string
        description: string | null
        id: string
        userId: string
        createdAt: Date
        updatedAt: Date
    } | null
}

interface TimeOption {
    value: number
    label: string
}

interface Session {
    user?: {
        email: string
        name: string
        image?: string | null
    }
}