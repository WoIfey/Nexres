import Profile from '@/components/Profile'
import SignIn from '@/components/Sign-in'
import Booking from '@/components/Booking'
import BookingsList from '@/components/BookingsList'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getBookings } from '@/actions/booking'
import { getResources } from '@/actions/resource'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	const bookings = await getBookings()
	const resources = await getResources()

	return (
		<main className="min-h-dvh bg-background flex flex-col">
			<div className="container mx-auto px-4 lg:py-10 py-6 flex-grow">
				<header className="flex justify-between items-center lg:mb-10 mb-6">
					<div className="flex items-center gap-3">
						<Link href="/">
							<h1 className="text-2xl font-bold">Nexres</h1>
						</Link>
						<p className="bg-primary px-2 py-0.5 rounded-lg">Beta</p>
					</div>
					<Profile session={session as Session} />
				</header>

				{session?.user ? (
					<div className="grid lg:grid-cols-2 gap-6">
						<div>
							<Booking resources={resources as Resource[]} />
						</div>
						<div>
							<div className="bg-card rounded-lg border shadow-sm">
								<div className="p-6">
									<h2 className="text-2xl font-semibold mb-6">Bookings</h2>
									<BookingsList bookings={bookings as Booking[]} />
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="grid lg:grid-cols-2 gap-6 lg:max-w-7xl lg:mx-auto">
						<div className="space-y-6 lg:px-0 px-6">
							<h2 className="text-3xl font-bold">Welcome to Nexres</h2>
							<p className="text-lg text-muted-foreground">
								Nexres is a booking app designed for teams. Our platform allows you to
								create and manage resources, while team members can easily book these
								resources as needed.
							</p>
							<ul className="list-disc list-inside space-y-2 text-muted-foreground">
								<li>Efficient resource management for teams</li>
								<li>Easy-to-use booking interface</li>
								<li>Customizable resources</li>
							</ul>
							<p className="text-muted-foreground">
								Join Nexres today and make your team arrive on time!
							</p>
						</div>
						<div className="flex justify-end">
							<SignIn />
						</div>
					</div>
				)}
			</div>
			<Footer />
		</main>
	)
}
