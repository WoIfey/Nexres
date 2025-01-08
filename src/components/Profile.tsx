'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import {
	LogOut,
	Mail,
	MessageSquare,
	Plus,
	PlusCircle,
	Settings,
	Trash2,
	UserPlus,
	Users,
} from 'lucide-react'
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
				<span className="text-sm font-medium">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">{session?.user?.name}</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<Settings />
									<span>Settings</span>
								</DropdownMenuItem>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<DropdownMenuItem
											onSelect={e => e.preventDefault()}
											className="text-destructive"
										>
											<Trash2 />
											Delete Account
										</DropdownMenuItem>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Permanently delete account?</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This will remove all your resources
												and bookings!
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
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<Users />
									<span>Team</span>
								</DropdownMenuItem>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<UserPlus />
										<span>Invite users</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuItem>
												<Mail />
												<span>Email</span>
											</DropdownMenuItem>
											<DropdownMenuItem>
												<MessageSquare />
												<span>Message</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>
												<PlusCircle />
												<span>More...</span>
											</DropdownMenuItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								<DropdownMenuItem>
									<Plus />
									<span>New Team</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleSignOut}>
								<LogOut />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</span>
			</div>
		</div>
	)
}
