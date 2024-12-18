'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient, errorMessages } from '@/lib/auth-client'
import ForgotPassword from './ForgotPassword'
import { toast } from 'sonner'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const signInSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password is too long'),
})

export default function SignIn() {
	const [showForgotPassword, setShowForgotPassword] = useState(false)
	const [formData, setFormData] = useState({ email: '', password: '' })
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const result = signInSchema.safeParse(formData)
		if (!result.success) {
			toast.error(result.error.errors[0].message)
			return
		}

		startTransition(async () => {
			try {
				const { error: signUpError } = await authClient.signUp.email({
					name: formData.email,
					...formData,
				})

				if (signUpError) {
					if (signUpError.code && signUpError.code === 'USER_ALREADY_EXISTS') {
						const { error: signInError } = await authClient.signIn.email(formData)

						if (signInError?.code) {
							toast.error(
								errorMessages[signInError.code as keyof typeof errorMessages] ||
									errorMessages.default
							)
							return
						}
						toast.success('Signed in successfully')
					} else if (signUpError.code) {
						toast.error(
							errorMessages[signUpError.code as keyof typeof errorMessages] ||
								errorMessages.default
						)
						return
					}
				} else {
					toast.success('Account created and signed in successfully')
				}

				router.refresh()
			} catch (error) {
				console.error(error)
				toast.error(errorMessages.default)
			}
		})
	}

	const renderForgotPassword = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
				<p className="text-sm text-muted-foreground">
					Enter your email address and we&apos;ll send you a link to reset your
					password.
				</p>
			</div>
			<ForgotPassword onBack={() => setShowForgotPassword(false)} />
		</div>
	)

	const renderLoginForm = () => (
		<>
			<div className="flex flex-col items-center gap-2">
				<DialogHeader>
					<DialogTitle className="sm:text-center">Welcome back</DialogTitle>
					<DialogDescription className="sm:text-center">
						Enter your credentials to login to your account.
					</DialogDescription>
				</DialogHeader>
			</div>

			<form className="space-y-5" onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="login-email">Email</Label>
						<Input
							id="login-email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="your@email.com"
							type="email"
							required
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="login-password">Password</Label>
						<Input
							id="login-password"
							name="password"
							value={formData.password}
							onChange={handleInputChange}
							placeholder="yourpassword"
							type="password"
							required
							disabled={isPending}
						/>
					</div>
				</div>

				<Button
					type="button"
					variant="link"
					className="p-0 h-0 pt-2"
					onClick={() => setShowForgotPassword(true)}
					disabled={isPending}
				>
					Forgot password?
				</Button>

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						'Sign in / Register'
					)}
				</Button>
			</form>
		</>
	)

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Sign in</Button>
			</DialogTrigger>
			<DialogContent
				onInteractOutside={e => {
					e.preventDefault()
				}}
			>
				{showForgotPassword ? renderForgotPassword() : renderLoginForm()}

				{!showForgotPassword && (
					<>
						<div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
							<span className="text-xs text-muted-foreground">Or</span>
						</div>

						<Button
							variant="outline"
							onClick={() =>
								startTransition(async () => {
									await authClient.signIn.social({ provider: 'github' })
								})
							}
							disabled={isPending}
						>
							{isPending ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<img
									src="https://cdn.wolfey.uk/IHbGO2Mm"
									alt="GitHub"
									className="size-4 dark:invert"
								/>
							)}
							Sign in with GitHub
						</Button>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
