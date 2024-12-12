import { Resource } from './resource'
import { User } from './auth'

export type Booking = {
    id: number
    userId: string
    resourceId: string | null
    date: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
    resource?: {
        id: string
        userId: string
        name: string
        description: string | null
        createdAt: Date
        updatedAt: Date
    } | null
} 