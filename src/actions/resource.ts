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
            return { success: false, error: "Unauthorized" }
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
            return { success: false, error: "Unauthorized" }
        }

        const resources = await prisma.resource.findMany({
            where: {
                user: {
                    id: session.user.id,
                },
            },
            orderBy: {
                createdAt: 'desc'
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
            return { success: false, error: "Unauthorized" }
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

export async function updateResource(id: string, data: { name: string; description: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const resource = await prisma.resource.update({
            where: {
                id,
                userId: session.user.id
            },
            data
        })

        revalidatePath('/')
        return { success: true, data: resource }
    } catch (error) {
        console.error("Update resource error:", error)
        return { success: false, error: "Failed to update resource" }
    }
} 