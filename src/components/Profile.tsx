'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut, User } from 'lucide-react'

export default function Profile({ session }: { session: any }) {
	const router = useRouter()
	const handleSignOut = async () => {
		await authClient.signOut()
		router.refresh()
	}

	if (!session?.user) return null

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium hidden sm:inline">
					{session.user.email}
				</span>
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleSignOut}
				className="text-destructive dark:text-red-500 hover:bg-destructive/10 hover:text-destructive/75 dark:hover:bg-red-500/10 dark:hover:text-red-400"
			>
				<LogOut className="size-4" />
				<span className="hidden sm:inline ml-2">Sign Out</span>
			</Button>
		</div>
	)
}
