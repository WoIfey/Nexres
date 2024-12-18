'use client'
import { useState, useTransition } from 'react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import Footer from './Footer'

export default function ResetPassword() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (password !== confirmPassword) {
			toast.error('Passwords do not match')
			return
		}

		startTransition(async () => {
			try {
				const { error } = await authClient.resetPassword({
					newPassword: password,
				})
				if (error) {
					toast.error('Error resetting password')
				} else {
					toast.success('Password reset successfully')
					setPassword('')
					setConfirmPassword('')
					router.push('/')
				}
			} catch (err) {
				console.error(err)
				toast.error('An unexpected error occurred')
			}
		})
	}

	return (
		<main className="min-h-dvh bg-background flex flex-col">
			<div className="container mx-auto px-4 py-10 flex-grow">
				<header className="flex justify-center items-center mb-10">
					<div className="flex items-center gap-4">
						<Link href="/">
							<h1 className="text-2xl font-bold">Nexres</h1>
						</Link>
					</div>
				</header>
				<div className="space-y-6 max-w-md mx-auto">
					<div className="space-y-2 text-center">
						<h2 className="text-2xl font-semibold tracking-tight">Reset Password</h2>
						<p className="text-sm text-muted-foreground">
							Enter a new password and confirm it to reset your password.
						</p>
					</div>
					<div className="space-y-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<div className="group relative">
									<label
										htmlFor="new-password"
										className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
									>
										New Password
									</label>
									<div className="relative">
										<Input
											id="new-password"
											type="password"
											value={password}
											onChange={e => setPassword(e.target.value)}
											placeholder=""
											className="pe-16"
											maxLength={100}
											required
											disabled={isPending}
											aria-describedby="character-count"
										/>
										<div
											id="character-count"
											className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
											aria-live="polite"
											role="status"
										>
											{password.length}/{100}
										</div>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<div className="group relative">
									<label
										htmlFor="confirm-password"
										className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
									>
										Confirm Password
									</label>
									<div className="relative">
										<Input
											id="confirm-password"
											type="password"
											value={confirmPassword}
											onChange={e => setConfirmPassword(e.target.value)}
											placeholder=""
											className="pe-16"
											maxLength={100}
											required
											disabled={isPending}
											aria-describedby="character-count"
										/>
										<div
											id="character-count"
											className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
											aria-live="polite"
											role="status"
										>
											{confirmPassword.length}/{100}
										</div>
									</div>
								</div>
							</div>
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? (
									<Loader2 className="size-4 animate-spin mr-2" />
								) : (
									'Reset Password'
								)}
							</Button>
						</form>
					</div>
				</div>
			</div>
			<Footer />
		</main>
	)
}
