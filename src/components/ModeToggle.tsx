'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export default function ModeToggle() {
	const { setTheme, resolvedTheme } = useTheme()

	return (
		<Button
			variant="outline"
			className="size-10"
			onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
		>
			<Sun className="rotate-0 scale-125 dark:-rotate-90 dark:scale-0 transition-all" />
			<Moon className="absolute rotate-90 scale-0 dark:rotate-0 dark:scale-125 transition-all" />
		</Button>
	)
}
