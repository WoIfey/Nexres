'use client'
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
import { signIn } from '@/lib/client-auth'
export default function SignIn() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Sign in</Button>
			</DialogTrigger>
			<DialogContent>
				<div className="flex flex-col items-center gap-2">
					<DialogHeader>
						<DialogTitle className="sm:text-center">Welcome back</DialogTitle>
						<DialogDescription className="sm:text-center">
							Enter your credentials to login to your account.
						</DialogDescription>
					</DialogHeader>
				</div>

				<form className="space-y-5">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="login-email">Email</Label>
							<Input
								id="login-email"
								placeholder="hi@yourcompany.com"
								type="email"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="login-password">Password</Label>
							<Input
								id="login-password"
								placeholder="Enter your password"
								type="password"
								required
							/>
						</div>
					</div>
					<div className="flex justify-between gap-2">
						<a className="text-sm underline hover:no-underline" href="#">
							Forgot password?
						</a>
					</div>
					<Button type="button" className="w-full">
						Sign in
					</Button>
				</form>

				<div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
					<span className="text-xs text-muted-foreground">Or</span>
				</div>

				<Button
					variant="outline"
					onClick={async () => {
						await signIn.social({
							provider: 'github',
						})
					}}
				>
					Login with GitHub
				</Button>
			</DialogContent>
		</Dialog>
	)
}
