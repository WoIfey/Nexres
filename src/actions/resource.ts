'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createResource(data: { name: string; description: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized")
        }

        const resource = await prisma.resource.create({
            data: {
                ...data,
                user: {
                    connect: {
                        id: session.user.id,
                    },
                },
            },
        })

        revalidatePath('/')
        return { success: true, data: resource }
    } catch (error) {
        console.error("Create resource error:", error)
        return { success: false, error: "Failed to create resource" }
    }
}

export async function getResources() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized")
        }

        const resources = await prisma.resource.findMany({
            where: {
                user: {
                    id: session.user.id,
                },
            },
            orderBy: {
                name: 'asc'
            },
            include: {
                Booking: true,
            },
        })
        return resources
    } catch (error) {
        console.error("Get resources error:", error)
        return []
    }
}

export async function deleteResource(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized")
        }

        await prisma.resource.delete({
            where: {
                id,
                userId: session.user.id
            },
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Delete resource error:", error)
        return { success: false, error: "Failed to delete resource" }
    }
} 