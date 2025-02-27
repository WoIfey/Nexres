'use client'
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
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Label } from './ui/label'
import { Input } from './ui/input'
import Link from 'next/link'
import Profile from './Profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Account() {
	const { data: session, isPending } = authClient.useSession()
	const [isLoading, startTransition] = useTransition()
	const [profileForm, setProfileForm] = useState({
		name: '',
		image: '',
	})
	const router = useRouter()

	useEffect(() => {
		async function fetchUserData() {
			try {
				if (session?.user) {
					setProfileForm({
						name: session.user.name || '',
						image: session.user.image || '',
					})
				}
			} catch (error) {
				console.error('Error fetching user data:', error)
			}
		}

		fetchUserData()
	}, [session])

	async function handleDeleteAccount() {
		startTransition(async () => {
			try {
				await authClient.deleteUser()
				toast.success('Account successfully deleted')
				router.push('/')
			} catch (error) {
				console.error('Error deleting account:', error)
				toast.error('Failed to delete account')
			}
		})
	}

	async function handleUpdateProfile(e: React.FormEvent) {
		e.preventDefault()
		startTransition(async () => {
			try {
				await authClient.updateUser({
					name: profileForm.name,
					image: profileForm.image,
				})
				toast.success('Profile updated successfully')
				router.refresh()
			} catch (error) {
				console.error('Error updating profile:', error)
				toast.error('Failed to update profile')
			}
		})
	}

	if (isPending) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto px-4">
			<header className="py-6 border-b mb-8">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<Link href="/">
							<h1 className="text-2xl font-bold">Nexres</h1>
						</Link>
						<p className="bg-primary px-2 py-0.5 rounded-lg">Beta</p>
					</div>
					<Profile session={session as Session} />
				</div>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
				<div className="space-y-4">
					<div className="sticky top-8">
						<div className="flex flex-col items-center p-6 border rounded-lg shadow-sm bg-card">
							<Avatar className="size-24 mb-4">
								<AvatarImage src={profileForm.image} />
								<AvatarFallback>
									{profileForm.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<h2 className="text-xl font-medium">{profileForm.name || 'User'}</h2>
							<p className="text-sm text-muted-foreground mt-1">
								{session?.user?.email}
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<div>
						<h1 className="text-2xl font-bold mb-6">Account Settings</h1>
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Update your details</CardDescription>
							</CardHeader>
							<form onSubmit={handleUpdateProfile}>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Name</Label>
										<Input
											id="name"
											placeholder="Your name"
											value={profileForm.name}
											onChange={e =>
												setProfileForm({ ...profileForm, name: e.target.value })
											}
											className="max-w-md"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="avatar">Profile Picture</Label>
										<Input
											id="avatar"
											placeholder="https://example.com/avatar.jpg"
											value={profileForm.image}
											onChange={e =>
												setProfileForm({ ...profileForm, image: e.target.value })
											}
											className="max-w-md"
										/>
									</div>
								</CardContent>
								<CardFooter>
									<Button type="submit" disabled={isLoading}>
										{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										Save Changes
									</Button>
								</CardFooter>
							</form>
						</Card>
					</div>

					<div>
						<h2 className="text-xl font-semibold text-destructive mb-4">
							Danger Zone
						</h2>
						<Card className="border-destructive border-2">
							<CardHeader>
								<CardTitle>Delete Account</CardTitle>
								<CardDescription>
									Permanently delete your account and all associated data
								</CardDescription>
							</CardHeader>
							<CardContent>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" className="flex items-center gap-2">
											<Trash2 className="h-4 w-4" />
											Delete Account
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Permanently delete account?</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This will remove all your resources
												and bookings!
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
											<AlertDialogCancel className="w-full sm:w-auto">
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction asChild>
												<Button
													variant="destructive"
													className="w-full sm:w-auto"
													onClick={handleDeleteAccount}
													disabled={isLoading}
												>
													{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
													Delete Account
												</Button>
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
