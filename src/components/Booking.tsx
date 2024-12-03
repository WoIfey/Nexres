'use client'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createBooking } from '@/actions/booking'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import ResourceManager from '@/components/ResourceManager'
import { deleteResource } from '@/actions/resource'

type Resource = {
	id: string
	name: string
	description: string | null
	bookings?: {
		date: Date
		resourceId: string
	}[]
}

type BookingProps = {
	resources: Resource[]
}

const isTimeSlotBooked = (dateTime: Date, resource?: Resource) => {
	if (!resource) return false

	return resource.bookings?.some(booking => {
		const bookingDate = new Date(booking.date)
		return (
			bookingDate.getFullYear() === dateTime.getFullYear() &&
			bookingDate.getMonth() === dateTime.getMonth() &&
			bookingDate.getDate() === dateTime.getDate() &&
			bookingDate.getHours() === dateTime.getHours() &&
			bookingDate.getMinutes() === dateTime.getMinutes()
		)
	})
}

const roundToNextFiveMinutes = (date: Date): Date => {
	const newDate = new Date(date)
	const nextMinute = Math.ceil(newDate.getMinutes() / 5) * 5

	if (nextMinute >= 60) {
		newDate.setHours(newDate.getHours() + 1)
		newDate.setMinutes(0)
	} else {
		newDate.setMinutes(nextMinute)
	}

	if (newDate.getHours() >= 24) {
		newDate.setDate(newDate.getDate() + 1)
		newDate.setHours(0)
		newDate.setMinutes(0)
	}

	return newDate
}

export default function Booking({ resources }: BookingProps) {
	const [date, setDate] = useState<Date>()
	const [isLoading, setIsLoading] = useState(false)
	const [selectedResource, setSelectedResource] = useState<string>()
	const [isOpen, setIsOpen] = useState(false)
	const [isDeletingResource, setIsDeletingResource] = useState<string | null>(
		null
	)

	if (resources.length === 0) {
		return (
			<div className="bg-card rounded-lg border shadow-sm">
				<div className="p-6">
					<h2 className="text-2xl font-semibold mb-6">Book an Appointment</h2>
					<div className="space-y-4">
						<p className="text-muted-foreground">
							No resources available for booking.
						</p>
						<ResourceManager />
					</div>
				</div>
			</div>
		)
	}

	const hours = Array.from({ length: 24 }, (_, i) => i)

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (!selectedDate) return

		const now = new Date()
		const newDate = new Date(selectedDate)

		if (newDate.toDateString() === now.toDateString()) {
			const roundedDate = roundToNextFiveMinutes(now)
			newDate.setHours(roundedDate.getHours())
			newDate.setMinutes(roundedDate.getMinutes())
		} else {
			newDate.setHours(0)
			newDate.setMinutes(0)
		}

		setDate(newDate)
	}

	const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
		if (!date) return

		const newDate = new Date(date.getTime())
		const parsedValue = parseInt(value)

		if (type === 'hour') {
			newDate.setHours(parsedValue)
		} else {
			newDate.setMinutes(parsedValue)
		}

		const selectedResourceObj = resources.find(r => r.id === selectedResource)

		if (!isTimeSlotBooked(newDate, selectedResourceObj)) {
			setDate(newDate)
		} else {
			toast.error('This time slot is already booked')
		}
	}

	const isHourDisabled = (hour: number) => {
		const now = new Date()
		return date?.toDateString() === now.toDateString() && hour < now.getHours()
	}

	const isMinuteDisabled = (dateTime: Date) => {
		const now = new Date()
		if (dateTime.toDateString() !== now.toDateString()) return false
		if (dateTime.getHours() > now.getHours()) return false
		return (
			dateTime.getHours() === now.getHours() &&
			dateTime.getMinutes() <= now.getMinutes()
		)
	}

	const disabledDates = {
		before: new Date(),
	}

	const handleBooking = async () => {
		if (!date || !selectedResource) return

		setIsLoading(true)
		const bookingDateTime = new Date(date)

		try {
			const result = await createBooking({
				date: bookingDateTime,
				resourceId: selectedResource,
			})

			if (result.success) {
				toast.success('Booking created successfully')
				setDate(undefined)
				setSelectedResource(undefined)
			} else {
				toast.error(result.error)
			}
		} catch (err) {
			console.error('Booking error:', err)
			toast.error('Failed to create booking')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDeleteResource = async (id: string) => {
		if (isDeletingResource) return

		setIsDeletingResource(id)
		try {
			const result = await deleteResource(id)
			if (result.success) {
				toast.success('Resource deleted successfully')
				if (selectedResource === id) {
					setSelectedResource(undefined)
					setDate(undefined)
				}
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			console.error('Delete resource error:', error)
			toast.error('Failed to delete resource')
		} finally {
			setIsDeletingResource(null)
		}
	}

	return (
		<div className="bg-card rounded-lg border shadow-sm">
			<div className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-semibold">Book an Appointment</h2>
					<ResourceManager />
				</div>

				<div className="space-y-6">
					<div>
						<label className="text-sm font-medium mb-2 block">Select Resource</label>
						<ScrollArea className="h-[200px] w-full rounded-md border">
							<div className="p-4">
								{resources.map((resource, index) => (
									<Button
										key={resource.id}
										variant="ghost"
										className={cn(
											'w-full justify-start text-left p-0 h-auto hover:bg-transparent',
											selectedResource === resource.id && 'bg-transparent',
											index !== 0 && 'mt-2'
										)}
										onClick={() => setSelectedResource(resource.id)}
									>
										<div
											className={cn(
												'w-full flex items-center justify-between rounded-lg border p-3 transition-colors',
												selectedResource === resource.id
													? 'bg-primary text-primary-foreground'
													: 'hover:bg-accent'
											)}
										>
											<div className="flex-1">
												<p className="font-medium">{resource.name}</p>
												<p className="text-sm opacity-90">{resource.description}</p>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={e => {
													e.stopPropagation()
													handleDeleteResource(resource.id)
												}}
												className="text-destructive hover:text-destructive hover:bg-destructive/10"
											>
												<Trash2 className="w-4 h-4" />
												<span className="sr-only">Delete resource</span>
											</Button>
										</div>
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>

					{selectedResource && (
						<div>
							<label className="text-sm font-medium mb-2 block">
								Select Date and Time
							</label>
							<Popover open={isOpen} onOpenChange={setIsOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!date && 'text-muted-foreground'
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{date ? (
											format(date, 'MM/dd/yyyy HH:mm')
										) : (
											<span>MM/DD/YYYY HH:mm</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<div className="sm:flex">
										<Calendar
											mode="single"
											selected={date}
											onSelect={handleDateSelect}
											disabled={disabledDates}
											initialFocus
										/>
										<div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
											<ScrollArea className="w-64 sm:w-auto">
												<div className="flex sm:flex-col p-2">
													{hours.map(hour => {
														const hourDate = date ? new Date(date.getTime()) : null
														if (hourDate) {
															hourDate.setHours(hour)
															hourDate.setMinutes(0)
														}
														const isBooked = hourDate ? isTimeSlotBooked(hourDate) : false
														const isDisabled = isHourDisabled(hour)

														return (
															<Button
																key={hour}
																size="icon"
																variant={date && date.getHours() === hour ? 'default' : 'ghost'}
																className="sm:w-full shrink-0 aspect-square"
																onClick={() => handleTimeChange('hour', hour.toString())}
																disabled={isBooked || isDisabled}
															>
																{hour}
															</Button>
														)
													})}
												</div>
												<ScrollBar orientation="horizontal" className="sm:hidden" />
											</ScrollArea>
											<ScrollArea className="w-64 sm:w-auto">
												<div className="flex sm:flex-col p-2">
													{Array.from({ length: 12 }, (_, i) => i * 5).map(minute => {
														const minuteDate = date ? new Date(date.getTime()) : null
														if (minuteDate) {
															minuteDate.setMinutes(minute)
														}
														const isBooked = minuteDate ? isTimeSlotBooked(minuteDate) : false
														const isDisabled = minuteDate
															? isMinuteDisabled(minuteDate)
															: false

														return (
															<Button
																key={minute}
																size="icon"
																variant={
																	date && date.getMinutes() === minute ? 'default' : 'ghost'
																}
																className="sm:w-full shrink-0 aspect-square"
																onClick={() => handleTimeChange('minute', minute.toString())}
																disabled={isBooked || isDisabled}
															>
																{minute.toString().padStart(2, '0')}
															</Button>
														)
													})}
												</div>
												<ScrollBar orientation="horizontal" className="sm:hidden" />
											</ScrollArea>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					)}

					{date && selectedResource && (
						<Button onClick={handleBooking} className="w-full" disabled={isLoading}>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<Clock className="mr-2 h-4 w-4 animate-spin" />
									<span>Processing...</span>
								</div>
							) : (
								'Book Appointment'
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
