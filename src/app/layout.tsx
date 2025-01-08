import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Nexres',
	description: 'Make appointments for different resources.',
	openGraph: {
		title: 'Nexres',
		description: 'Make appointments for different resources.',
		url: 'https://nexres.vercel.app/',
		images: [
			{
				url: 'https://wolfey.s-ul.eu/Y9eVSNHd',
				width: 1280,
				height: 720,
				alt: 'Thumbnail',
			},
		],
		locale: 'en_US',
		type: 'website',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
					<Toaster position="top-center" />
				</ThemeProvider>
			</body>
		</html>
	)
}
