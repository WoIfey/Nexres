'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { deleteBooking } from '@/actions/booking'
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'

type Booking = {
	id: number
	date: Date
	resource: {
		id: string
		name: string
		description: string | null
	} | null
}

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
		return <div className="text-sm text-muted-foreground">No bookings found</div>
	}

	return (
		<div className="space-y-4">
			{bookings.map(booking => {
				const isPast = isPastBooking(booking.date)
				return (
					<div
						key={booking.id}
						className={`bg-card rounded-lg border p-4 flex justify-between items-center ${
							isPast ? 'opacity-50' : ''
						}`}
					>
						<div>
							<p className="font-medium">{format(new Date(booking.date), 'PPP')}</p>
							<p className="text-sm text-muted-foreground">
								{format(new Date(booking.date), 'p')}
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
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							<Trash2 className="w-4 h-4" />
							<span className="sr-only">Delete booking</span>
						</Button>
					</div>
				)
			})}
		</div>
	)
}
