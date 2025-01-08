'use client'

import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { toast } from 'sonner'
import { deleteBooking, updateBooking } from '@/actions/booking'
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { Input } from './ui/input'

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
	const [isDeleting, setIsDeleting] = useState<number | null>(null)
	const [editingBooking, setEditingBooking] = useState<{
		id: number
		startDate: Date
		endDate: Date
	} | null>(null)

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

	const handleUpdateBooking = async () => {
		if (!editingBooking) return

		try {
			const result = await updateBooking(editingBooking.id, {
				startDate: editingBooking.startDate,
				endDate: editingBooking.endDate,
			})

			if (result.success) {
				toast.success('Booking updated successfully')
				setEditingBooking(null)
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			console.error('Update booking error:', error)
			toast.error('Failed to update booking')
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
						className={`bg-card rounded-lg border p-4 flex flex-col justify-between items-start ${
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
							<p className="text-sm font-medium mt-1 truncate">
								{booking.resource?.name}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{booking.resource?.description}
							</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setEditingBooking({
										id: booking.id,
										startDate: new Date(booking.date),
										endDate: new Date(booking.endDate),
									})
								}
							>
								Edit
							</Button>
						</div>
						<div className="flex justify-between w-full">
							{editingBooking?.id === booking.id ? (
								<div className="space-y-4">
									<div className="flex gap-4">
										<div>
											<label className="text-sm font-medium">Start Date</label>
											<Calendar
												mode="single"
												selected={editingBooking.startDate}
												onSelect={date =>
													date && setEditingBooking({ ...editingBooking, startDate: date })
												}
											/>
											<label className="text-sm font-medium">Start Time</label>
											<Input
												type="time"
												className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												value={editingBooking.startDate.toTimeString().slice(0, 5)}
												onChange={e => {
													const [hours, minutes] = e.target.value.split(':')
													const newStartDate = new Date(editingBooking.startDate)
													newStartDate.setHours(parseInt(hours), parseInt(minutes))
													setEditingBooking({ ...editingBooking, startDate: newStartDate })
												}}
											/>
										</div>
										<div>
											<label className="text-sm font-medium">End Date</label>
											<Calendar
												mode="single"
												selected={editingBooking.endDate}
												onSelect={date =>
													date && setEditingBooking({ ...editingBooking, endDate: date })
												}
											/>
											<label className="text-sm font-medium">End Time</label>
											<Input
												type="time"
												className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												value={editingBooking.endDate.toTimeString().slice(0, 5)}
												onChange={e => {
													const [hours, minutes] = e.target.value.split(':')
													const newEndDate = new Date(editingBooking.endDate)
													newEndDate.setHours(parseInt(hours), parseInt(minutes))
													setEditingBooking({ ...editingBooking, endDate: newEndDate })
												}}
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<Button onClick={handleUpdateBooking}>Save</Button>
										<Button variant="ghost" onClick={() => setEditingBooking(null)}>
											Cancel
										</Button>
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
							) : null}
						</div>
					</div>
				)
			})}
		</div>
	)
}
