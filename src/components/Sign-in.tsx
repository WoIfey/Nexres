'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient, errorMessages } from '@/lib/auth-client'
import ForgotPassword from './ForgotPassword'
import { toast } from 'sonner'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { isDisposableEmail } from 'disposable-email-domains-js'
import Github from './ui/github'

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
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const result = signInSchema.safeParse(formData)
		if (!result.success) {
			toast.error(result.error.errors[0].message)
			return
		}

		if (turnstileToken) {
			if (!isDisposableEmail(formData.email)) {
				startTransition(async () => {
					try {
						const { error: signUpError } = await authClient.signUp.email(
							{
								name: formData.email,
								...formData,
							},
							{
								onError: ctx => {
									if (ctx.error.status === 429) {
										toast.error(`Rate limit exceeded.`)
									}
									if (ctx.error.status === 403) {
										toast.error('Please verify your email address')
									}
									if (ctx.error.status !== 422) {
										toast.error(ctx.error.message)
									}
								},
							}
						)
						setTurnstileToken(null)
						if (signUpError) {
							if (signUpError.code && signUpError.code === 'USER_ALREADY_EXISTS') {
								const { error: signInError } = await authClient.signIn.email(formData)
								if (signInError?.code === 'EMAIL_NOT_VERIFIED') {
									toast.error('Please verify your email address.', {
										description: 'Be sure to check your junk email.',
									})
									return
								}

								if (signInError?.code) {
									toast.error(
										errorMessages[signInError.code as keyof typeof errorMessages] ||
											errorMessages.default
									)
									return
								}

								toast.success('Signed in successfully!')
							} else if (signUpError.code) {
								toast.error(
									errorMessages[signUpError.code as keyof typeof errorMessages] ||
										errorMessages.default
								)
								return
							}
						} else {
							toast.success('Account created, please verify your email!', {
								description: 'Be sure to check your junk email.',
							})
						}

						router.refresh()
					} catch (error) {
						console.error(error)
						toast.error(errorMessages.default)
					}
				})
			} else {
				toast.error('Please insert an valid email.')
			}
		}
	}

	return (
		<div className="space-y-6 max-w-md lg:mx-0 mx-auto lg:pt-0">
			{showForgotPassword ? (
				<div className="space-y-6 text-center">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight">
							Forgot password?
						</h2>
						<p className="text-sm text-muted-foreground">
							Enter your email and we will send you a link to reset your password.
						</p>
					</div>
					<ForgotPassword onBack={() => setShowForgotPassword(false)} />
				</div>
			) : (
				<>
					{!isPending ? (
						<div className="bg-card rounded-lg border shadow-sm p-6">
							<form className="space-y-4" onSubmit={handleSubmit}>
								<div className="space-y-6">
									<div className="space-y-2">
										<div className="group relative">
											<label
												htmlFor="email"
												className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
											>
												Email
											</label>
											<div className="relative">
												<Input
													id="email"
													type="email"
													placeholder=""
													className="pe-16"
													value={formData.email}
													maxLength={255}
													onChange={e => setFormData({ ...formData, email: e.target.value })}
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
													{formData.email.length}/{255}
												</div>
											</div>
										</div>
									</div>
									<div className="space-y-2">
										<div className="group relative">
											<label
												htmlFor="password"
												className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
											>
												Password
											</label>
											<div className="relative">
												<Input
													id="password"
													type="password"
													placeholder=""
													className="pe-16"
													value={formData.password}
													onChange={e =>
														setFormData({ ...formData, password: e.target.value })
													}
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
													{formData.password.length}/{100}
												</div>
											</div>
										</div>
									</div>
								</div>
								<Button
									type="button"
									variant="link"
									className="p-0 h-auto text-sm"
									onClick={() => setShowForgotPassword(true)}
									disabled={isPending}
								>
									Forgot password?
								</Button>

								<Turnstile
									siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
									onSuccess={token => setTurnstileToken(token)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={isPending || turnstileToken === null}
								>
									{isPending ? (
										<Loader2 className="size-4 animate-spin mr-2" />
									) : (
										'Sign in / Register'
									)}
								</Button>
							</form>
						</div>
					) : (
						<div className="flex items-center justify-center">
							<Loader2 className="size-8 animate-spin mr-2" />
							<div className="space-y-2 text-center">
								<h2 className="text-2xl font-semibold tracking-tight">Signing in...</h2>
							</div>
						</div>
					)}

					<div className="space-y-4">
						{!isPending && (
							<>
								<div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
									<span className="text-xs text-muted-foreground">Or</span>
								</div>
								<Button
									variant="outline"
									className="bg-[#333333] text-white hover:text-white/80 flex items-center w-full gap-2 hover:bg-[#333333]/90"
									onClick={() =>
										startTransition(async () => {
											await authClient.signIn.social({ provider: 'github' })
										})
									}
									disabled={isPending || turnstileToken === null}
								>
									{isPending ? (
										<Loader2 className="size-4 animate-spin mr-2" />
									) : (
										<>
											<Github />
											Continue with GitHub
										</>
									)}
								</Button>
							</>
						)}
					</div>
				</>
			)}
		</div>
	)
}
