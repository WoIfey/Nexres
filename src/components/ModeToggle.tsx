'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export default function ModeToggle() {
	const { setTheme, resolvedTheme } = useTheme()

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
			className="rounded-full size-6 bg-transparent border-none hover:bg-transparent hover:opacity-80"
		>
			<Sun className="rotate-0 scale-150 dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute rotate-90 scale-0 dark:rotate-0 dark:scale-150" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}
