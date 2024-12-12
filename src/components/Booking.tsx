'use client'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, isToday, setHours, setMinutes } from 'date-fns'
import { CalendarIcon, Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createBooking } from '@/actions/booking'
import { ScrollArea } from '@/components/ui/scroll-area'
import ResourceManager from '@/components/ResourceManager'
import { deleteResource } from '@/actions/resource'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'

interface Booking {
	date: string | Date
	endDate: string | Date
}

interface Resource {
	id: string
	name: string
	description: string | null
	userId: string
	createdAt: Date
	updatedAt: Date
	bookings?: Booking[]
}

const isTimeSlotBooked = (start: Date, end: Date, resource?: Resource) => {
	if (!resource) return false

	return resource.bookings?.some((booking: Booking) => {
		const bookingStart = new Date(booking.date)
		const bookingEnd = new Date(booking.endDate)

		return (
			(start >= bookingStart && start < bookingEnd) ||
			(end > bookingStart && end <= bookingEnd) ||
			(start <= bookingStart && end >= bookingEnd)
		)
	})
}

export default function Booking({ resources }: { resources: Resource[] }) {
	const [startDate, setStartDate] = useState<Date | undefined>()
	const [endDate, setEndDate] = useState<Date | undefined>()
	const [isLoading, setIsLoading] = useState(false)
	const [selectedResource, setSelectedResource] = useState<string>()
	const [isStartDrawerOpen, setIsStartDrawerOpen] = useState(false)
	const [isEndDrawerOpen, setIsEndDrawerOpen] = useState(false)
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

	const handleBooking = async () => {
		if (!startDate || !selectedResource) {
			toast.error('Please select start date and resource')
			return
		}

		const effectiveEndDate = endDate || new Date(startDate)

		if (endDate && endDate <= startDate) {
			toast.error('End date must be after start date')
			return
		}

		const selectedResourceObj = resources.find(r => r.id === selectedResource)
		if (isTimeSlotBooked(startDate, effectiveEndDate, selectedResourceObj)) {
			toast.error('This time slot is already booked')
			return
		}

		setIsLoading(true)
		try {
			const result = await createBooking({
				startDate,
				endDate: effectiveEndDate,
				resourceId: selectedResource,
			})

			if (result.success) {
				toast.success('Booking created successfully')
				setStartDate(undefined)
				setEndDate(undefined)
				setSelectedResource(undefined)
			} else {
				toast.error(result.error || 'Failed to create booking')
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
					setStartDate(undefined)
					setEndDate(undefined)
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

	const getAvailableHours = (date: Date): number[] => {
		const now = new Date()
		if (isToday(date)) {
			const currentHour = now.getHours()
			return Array.from({ length: 24 - currentHour }, (_, i) => currentHour + i)
		}
		return Array.from({ length: 24 }, (_, i) => i)
	}

	const getAvailableMinutes = (date: Date, hour: number): number[] => {
		const now = new Date()
		if (isToday(date) && hour === now.getHours()) {
			const currentMinutes = now.getMinutes()
			const nextFive = Math.ceil(currentMinutes / 5) * 5
			return Array.from(
				{ length: 12 - Math.floor(nextFive / 5) },
				(_, i) => (nextFive + i * 5) % 60
			)
		}
		return Array.from({ length: 12 }, (_, i) => i * 5)
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
						<label className="text-sm font-medium mb-2 block">Resources</label>
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
											<div
												onClick={e => {
													e.stopPropagation()
													handleDeleteResource(resource.id)
												}}
												className="text-destructive dark:text-red-500 hover:bg-destructive/10 hover:text-destructive/75 dark:hover:bg-red-500/10 dark:hover:text-red-400"
											>
												<Trash2 className="size-4" />
												<span className="sr-only">Delete resource</span>
											</div>
										</div>
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>

					<div>
						<label className="text-sm font-medium mb-2 block">Start Date</label>
						<Drawer open={isStartDrawerOpen} onOpenChange={setIsStartDrawerOpen}>
							<DrawerTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'w-full justify-start text-left font-normal',
										!startDate && 'text-muted-foreground'
									)}
									disabled={!selectedResource}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{startDate
										? format(startDate, 'MM/dd/yyyy HH:mm')
										: 'Select start date'}
								</Button>
							</DrawerTrigger>
							<DrawerContent>
								<DrawerHeader>
									<DrawerTitle className="text-center">Select start date</DrawerTitle>
								</DrawerHeader>
								<div className="p-4 space-y-4 flex flex-col items-center">
									<Calendar
										mode="single"
										selected={startDate}
										onSelect={date => {
											if (date) {
												const newDate = roundToNextFiveMinutes(date)
												setStartDate(newDate)
												if (endDate && endDate <= newDate) {
													setEndDate(undefined)
												}
											}
										}}
										disabled={{ before: new Date() }}
									/>

									<div className="flex flex-col items-center gap-4 pt-4 border-t w-full">
										<div className="flex items-center gap-2">
											<Select
												value={startDate ? String(startDate.getHours()) : ''}
												onValueChange={value => {
													if (startDate) {
														const updated = setHours(startDate, parseInt(value))
														setStartDate(updated)
													}
												}}
											>
												<SelectTrigger className="w-[110px]">
													<SelectValue placeholder="Hour" />
												</SelectTrigger>
												<SelectContent>
													{startDate
														? getAvailableHours(startDate).map(hour => (
																<SelectItem key={hour} value={String(hour)}>
																	{String(hour).padStart(2, '0')}:00
																</SelectItem>
															))
														: Array.from({ length: 24 }, (_, i) => (
																<SelectItem key={i} value={String(i)}>
																	{String(i).padStart(2, '0')}:00
																</SelectItem>
															))}
												</SelectContent>
											</Select>

											<Select
												value={startDate ? String(startDate.getMinutes()) : ''}
												onValueChange={value => {
													if (startDate) {
														const updated = setMinutes(startDate, parseInt(value))
														setStartDate(updated)
													}
												}}
											>
												<SelectTrigger className="w-[110px]">
													<SelectValue placeholder="Minute" />
												</SelectTrigger>
												<SelectContent>
													{startDate && isToday(startDate)
														? getAvailableMinutes(startDate, startDate.getHours()).map(
																minute => (
																	<SelectItem key={minute} value={String(minute)}>
																		{String(minute).padStart(2, '0')}
																	</SelectItem>
																)
															)
														: Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
																<SelectItem key={minute} value={String(minute)}>
																	{String(minute).padStart(2, '0')}
																</SelectItem>
															))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</DrawerContent>
						</Drawer>
					</div>

					<div>
						<label className="text-sm font-medium mb-2 block">End Date</label>
						<Drawer open={isEndDrawerOpen} onOpenChange={setIsEndDrawerOpen}>
							<DrawerTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'w-full justify-start text-left font-normal',
										!endDate && 'text-muted-foreground'
									)}
									disabled={!startDate}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{endDate ? format(endDate, 'MM/dd/yyyy HH:mm') : 'Select end date'}
								</Button>
							</DrawerTrigger>
							<DrawerContent>
								<DrawerHeader>
									<DrawerTitle className="text-center">Select end date</DrawerTitle>
								</DrawerHeader>
								<div className="p-4 space-y-4 flex flex-col items-center">
									<Calendar
										mode="single"
										selected={endDate}
										onSelect={date => {
											if (date) {
												const newDate = roundToNextFiveMinutes(date)
												setEndDate(newDate)
											}
										}}
										disabled={{
											before: startDate ? addMinutes(startDate, 5) : new Date(),
										}}
									/>

									<div className="flex flex-col items-center gap-4 pt-4 border-t w-full">
										<div className="flex items-center gap-2">
											<Select
												value={endDate ? String(endDate.getHours()) : ''}
												onValueChange={value => {
													if (endDate) {
														const updated = setHours(endDate, parseInt(value))
														setEndDate(updated)
													}
												}}
											>
												<SelectTrigger className="w-[110px]">
													<SelectValue placeholder="Hour" />
												</SelectTrigger>
												<SelectContent>
													{endDate
														? getAvailableHours(endDate).map(hour => (
																<SelectItem key={hour} value={String(hour)}>
																	{String(hour).padStart(2, '0')}:00
																</SelectItem>
															))
														: Array.from({ length: 24 }, (_, i) => (
																<SelectItem key={i} value={String(i)}>
																	{String(i).padStart(2, '0')}:00
																</SelectItem>
															))}
												</SelectContent>
											</Select>

											<Select
												value={endDate ? String(endDate.getMinutes()) : ''}
												onValueChange={value => {
													if (endDate) {
														const updated = setMinutes(endDate, parseInt(value))
														setEndDate(updated)
													}
												}}
											>
												<SelectTrigger className="w-[110px]">
													<SelectValue placeholder="Minute" />
												</SelectTrigger>
												<SelectContent>
													{endDate && isToday(endDate)
														? getAvailableMinutes(endDate, endDate.getHours()).map(minute => (
																<SelectItem key={minute} value={String(minute)}>
																	{String(minute).padStart(2, '0')}
																</SelectItem>
															))
														: Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
																<SelectItem key={minute} value={String(minute)}>
																	{String(minute).padStart(2, '0')}
																</SelectItem>
															))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</DrawerContent>
						</Drawer>
					</div>

					<Button
						onClick={handleBooking}
						className="w-full"
						disabled={isLoading || !startDate}
					>
						{isLoading ? (
							<div className="flex items-center justify-center">
								<Clock className="mr-2 h-4 w-4 animate-spin" />
								<span>Processing...</span>
							</div>
						) : (
							'Book Appointment'
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}

function roundToNextFiveMinutes(date: Date): Date {
	const newDate = new Date(date)
	const minutes = newDate.getMinutes()
	const remainder = minutes % 5
	if (remainder !== 0) {
		newDate.setMinutes(minutes + (5 - remainder))
	}
	newDate.setSeconds(0)
	newDate.setMilliseconds(0)
	return newDate
}

function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60000)
}
