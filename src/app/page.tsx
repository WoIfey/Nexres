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
			<div className="container mx-auto px-4 py-10 flex-grow">
				<header className="flex justify-between items-center mb-10">
					<div
						className={`flex items-center gap-4 ${!session?.user ? 'w-full justify-center' : ''}`}
					>
						<Link href="/">
							<h1 className="text-2xl font-bold">Nexres</h1>
						</Link>
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
					<SignIn />
				)}
			</div>
			<Footer />
		</main>
	)
}
