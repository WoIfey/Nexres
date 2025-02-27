'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut, Settings } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Profile({ session }: { session: Session }) {
	const router = useRouter()
	const handleSignOut = async () => {
		await authClient.signOut()
		router.refresh()
	}

	if (!session?.user) return null

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<Avatar className="size-6">
									<AvatarImage src={session?.user?.image || ''} />
									<AvatarFallback>
										{session?.user?.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{session?.user?.name}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem asChild>
									<Link href="/account">
										<Settings />
										Settings
									</Link>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							{/* <DropdownMenuGroup>
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
							<DropdownMenuSeparator /> */}
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
