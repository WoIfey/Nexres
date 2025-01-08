'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut, Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteAccount } from '@/actions/account/delete-account'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function Profile({ session }: { session: Session }) {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()
	const handleSignOut = async () => {
		await authClient.signOut()
		router.refresh()
	}

	async function handleDeleteAccount() {
		startTransition(async () => {
			try {
				const result = await deleteAccount()
				if (result.success) {
					toast.success(result.message)
					router.push('/')
				} else {
					toast.error(result.message)
				}
			} catch (error) {
				console.error('Error deleting account:', error)
				toast.error('Failed to delete account')
			}
		})
	}

	if (!session?.user) return null

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium hidden sm:inline">
					{session?.user?.email}
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

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button>
						<Trash2 className="size-4" />
						<span>Delete</span>
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Permanently delete account?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will remove all your resources and
							bookings!
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button
								className="w-full"
								onClick={handleDeleteAccount}
								disabled={isPending}
							>
								Delete Account
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
