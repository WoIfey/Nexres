'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
	const [email, setEmail] = useState('')
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		startTransition(async () => {
			try {
				const { error } = await authClient.forgetPassword({
					email,
					redirectTo: `/reset-password`,
				})

				if (error) {
					toast.error('Failed to send reset email. Please try again.')
					return
				}

				toast.success('Password reset email sent! Please check your inbox.')
				router.push('')
			} catch (err) {
				console.error(err)
				toast.error('An unexpected error occurred. Please try again.')
			}
		})
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="reset-email">Email</Label>
				<Input
					id="reset-email"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder="your@email.com"
					required
					disabled={isPending}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? 'Sending...' : 'Send reset link'}
				</Button>
				<Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
					Back to sign in
				</Button>
			</div>
		</form>
	)
}
