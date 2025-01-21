import Link from 'next/link'
import ModeToggle from './ModeToggle'
import { Button } from './ui/button'
import Github from './ui/github'

export default function Footer() {
	return (
		<footer className="border-t border-gray-200 dark:border-gray-800">
			<div className="flex justify-between items-center max-w-7xl mx-auto p-4">
				<p className="text-sm text-gray-600 dark:text-gray-400">
					&copy; 2025 Nexres
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="[&_svg]:size-auto"
						asChild
					>
						<Link href="https://github.com/WoIfey/nexres" target="_blank">
							<Github className="invert dark:invert-0" width={18} height={18} />
						</Link>
					</Button>
					<ModeToggle />
				</div>
			</div>
		</footer>
	)
}
