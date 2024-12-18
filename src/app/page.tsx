import Profile from '@/components/Profile'
import SignIn from '@/components/Sign-in'
import Booking from '@/components/Booking'
import BookingsList from '@/components/BookingsList'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getBookings } from '@/actions/booking'
import { getResources } from '@/actions/resource'
import Footer from '@/components/Footer'

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	const bookings = await getBookings()
	const resourcesResult = await getResources()
	const resources = 'success' in resourcesResult ? [] : resourcesResult

	return (
		<main className="min-h-dvh bg-background flex flex-col">
			<div className="container mx-auto px-4 py-6 flex-grow">
				<header className="flex justify-between items-center mb-8">
					<div className="flex items-center gap-4">
						<h1 className="text-2xl font-bold">Nexres</h1>
					</div>
					<Profile session={session} />
				</header>

				{session?.user ? (
					<div className="grid lg:grid-cols-2 gap-6">
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
					<div>
						<p className="text-muted-foreground mb-4">
							Start managing your resources with Nexres!
						</p>
						<SignIn />
					</div>
				)}
			</div>
			<Footer />
		</main>
	)
}
