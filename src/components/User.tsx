'use client'
import { authClient } from '@/lib/client-auth'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
	email: string
	image?: string | null
}

interface Session {
	user?: User
}

export default function User({ session }: { session: Session | null }) {
	const router = useRouter()
	const handleSignOut = async () => {
		await authClient.signOut()
		router.refresh()
	}

	if (!session?.user) return null

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				{session.user.image ? (
					<Avatar>
						<AvatarImage src={session.user.image} alt={session.user.email} />
						<AvatarFallback>
							<UserIcon className="w-8 h-8 p-1.5 bg-muted rounded-full" />
						</AvatarFallback>
					</Avatar>
				) : (
					<UserIcon className="w-8 h-8 p-1.5 bg-muted rounded-full" />
				)}
				<span className="text-sm font-medium hidden sm:inline">
					{session.user.email}
				</span>
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleSignOut}
				className="text-destructive hover:text-destructive hover:bg-destructive/10"
			>
				<LogOut className="w-4 h-4" />
				<span className="hidden sm:inline ml-2">Sign Out</span>
			</Button>
		</div>
	)
}
