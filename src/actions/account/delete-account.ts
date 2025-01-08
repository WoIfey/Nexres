'use server'

import { auth } from '@/lib/auth'
import prisma from "@/lib/prisma"
import { headers } from 'next/headers'

export async function deleteAccount() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error('Unauthorized')
        }

        await prisma.user.delete({
            where: { id: session.user.id },
        })

        return { success: true, message: 'Account deleted successfully' }
    } catch (error) {
        console.error('Error deleting account:', error)
        return { success: false, message: 'Failed to delete account' }
    }
}