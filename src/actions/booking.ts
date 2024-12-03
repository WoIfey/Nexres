'use server'

import { auth } from '@/lib/auth'
import prisma from "@/lib/prisma"
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createBooking({ date, resourceId }: { date: Date; resourceId: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized")
        }

        const booking = await prisma.booking.create({
            data: {
                userId: session.user.id,
                date: date,
                resourceId: resourceId,
            },
        })

        revalidatePath('/')
        return { success: true, data: booking }
    } catch (error) {
        console.error("Create booking error", error)
        return { success: false, error: "Failed to create booking" }
    }
}

export async function getBookings() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized")
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                date: 'asc'
            },
            include: {
                resource: true
            }
        })

        return bookings
    } catch (error) {
        console.error('Get bookings error', error)
        return []
    }
}

export async function deleteBooking(id: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized")
        }

        await prisma.booking.delete({
            where: {
                id,
                userId: session.user.id
            },
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Delete booking error", error)
        return { success: false, error: "Failed to delete booking" }
    }
}
