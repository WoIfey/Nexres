'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
export default function ResetPassword() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (password !== confirmPassword) {
			toast.error('Passwords do not match')
			return
		}

		setIsLoading(true)
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
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className="min-h-dvh bg-background">
			<div className="container mx-auto px-4 py-6">
				<div className="max-w-md mx-auto">
					<div className="bg-card rounded-lg border shadow-sm">
						<div className="p-6">
							<h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="new-password">New Password</Label>
									<Input
										id="new-password"
										type="password"
										value={password}
										onChange={e => setPassword(e.target.value)}
										required
										disabled={isLoading}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirm-password">Confirm Password</Label>
									<Input
										id="confirm-password"
										type="password"
										value={confirmPassword}
										onChange={e => setConfirmPassword(e.target.value)}
										required
										disabled={isLoading}
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? 'Resetting...' : 'Reset Password'}
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
