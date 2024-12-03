import User from '@/components/User'
import SignIn from '@/components/Sign-in'
import Booking from '@/components/Booking'
import BookingsList from '@/components/BookingsList'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getBookings } from '@/actions/booking'
import { getResources } from '@/actions/resource'

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	const bookings = await getBookings()
	const resources = await getResources()

	return (
		<main className="min-h-dvh bg-background">
			<div className="container mx-auto px-4 py-6">
				<header className="flex justify-between items-center mb-8">
					<div className="flex items-center gap-4">
						<h1 className="text-2xl font-bold">Booking</h1>
					</div>
					<User session={session} />
				</header>

				{session?.user ? (
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<Booking resources={resources} />
						</div>
						<div>
							<div className="bg-card rounded-lg border shadow-sm">
								<div className="p-6">
									<h2 className="text-2xl font-semibold mb-6">Your Bookings</h2>
									<BookingsList bookings={bookings} />
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center">
						<p className="text-muted-foreground mb-4">
							Please sign in to make a booking
						</p>
						<SignIn />
					</div>
				)}
			</div>
		</main>
	)
}
