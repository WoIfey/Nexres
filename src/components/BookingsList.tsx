'use client'

import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { toast } from 'sonner'
import { deleteBooking } from '@/actions/booking'
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
	const [isDeleting, setIsDeleting] = useState<number | null>(null)

	const handleDelete = async (id: number) => {
		setIsDeleting(id)
		try {
			const result = await deleteBooking(id)
			if (result.success) {
				toast.success('Booking deleted successfully')
			} else {
				toast.error(result.error)
			}
		} catch (err) {
			console.error('Delete booking error:', err)
			toast.error('Failed to delete booking')
		} finally {
			setIsDeleting(null)
		}
	}

	const isPastBooking = (date: Date | string) => {
		return new Date(date) < new Date()
	}

	if (!bookings.length) {
		return (
			<div className="space-y-4">
				<p className="text-muted-foreground">No bookings found.</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{bookings.map((booking: Booking) => {
				const isPast = isPastBooking(booking.date)
				return (
					<div
						key={booking.id}
						className={`bg-card rounded-lg border p-4 flex justify-between items-center ${
							isPast ? 'opacity-50' : ''
						}`}
					>
						<div>
							<p className="font-medium">
								{format(new Date(booking.date), 'PPP')}
								{!isSameDay(new Date(booking.date), new Date(booking.endDate)) && (
									<>
										{' - '}
										{format(new Date(booking.endDate), 'PPP')}
									</>
								)}
							</p>
							<p className="text-sm text-muted-foreground">
								{format(new Date(booking.date), 'p')}
								{!isSameDay(new Date(booking.date), new Date(booking.endDate)) && (
									<>
										{' - '}
										{format(new Date(booking.endDate), 'p')}
									</>
								)}
							</p>
							<p className="text-sm font-medium mt-1">{booking.resource?.name}</p>
							<p className="text-xs text-muted-foreground">
								{booking.resource?.description}
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleDelete(booking.id)}
							disabled={isDeleting === booking.id}
							className="text-destructive dark:text-red-500 hover:bg-destructive/10 hover:text-destructive/75 dark:hover:bg-red-500/10 dark:hover:text-red-400"
						>
							<Trash2 className="size-4" />
							<span className="sr-only">Delete booking</span>
						</Button>
					</div>
				)
			})}
		</div>
	)
}
