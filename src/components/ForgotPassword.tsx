'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
	const [email, setEmail] = useState('')
	const [isPending, startTransition] = useTransition()
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

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
				onBack()
			} catch (err) {
				console.error(err)
				toast.error('An unexpected error occurred. Please try again.')
			}
		})
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<div className="group relative">
					<label
						htmlFor="reset-email"
						className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
					>
						Email
					</label>
					<div className="relative">
						<Input
							id="reset-email"
							type="email"
							placeholder=""
							className="pe-16"
							value={email}
							maxLength={255}
							onChange={e => setEmail(e.target.value)}
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
							{email.length}/{255}
						</div>
					</div>
				</div>
			</div>

			<Turnstile
				siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
				onSuccess={token => setTurnstileToken(token)}
			/>

			<div className="flex flex-col gap-2">
				<Button type="submit" disabled={isPending || turnstileToken === null}>
					{isPending ? (
						<Loader2 className="size-4 animate-spin mr-2" />
					) : (
						'Send reset link'
					)}
				</Button>
				<Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
					Back to sign in
				</Button>
			</div>
		</form>
	)
}
