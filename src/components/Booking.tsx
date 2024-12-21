'use client'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, isToday, setHours, setMinutes } from 'date-fns'
import { CalendarIcon, Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createBooking } from '@/actions/booking'
import { ScrollArea } from '@/components/ui/scroll-area'
import ResourceManager from '@/components/ResourceManager'
import { deleteResource, updateResource } from '@/actions/resource'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'

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

function TimeSelector({
	options,
	selectedValue,
	onSelect,
}: {
	options: TimeOption[]
	selectedValue: number
	onSelect: (value: number) => void
}) {
	return (
		<ScrollArea className="h-[200px] w-[110px] rounded-md border">
			<div className="p-2">
				{options.map(option => (
					<Button
						key={option.value}
						variant="ghost"
						className={cn(
							'w-full justify-center mb-1',
							selectedValue === option.value && 'bg-primary text-primary-foreground'
						)}
						onClick={() => onSelect(option.value)}
					>
						{option.label}
					</Button>
				))}
			</div>
		</ScrollArea>
	)
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
	const [editingResource, setEditingResource] = useState<{
		id: string
		name: string
		description: string
	} | null>(null)

	if (resources.length === 0) {
		return (
			<div className="bg-card rounded-lg border shadow-sm">
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-semibold">Book an Appointment</h2>
						<ResourceManager />
					</div>
					<div className="space-y-4">
						<p className="text-muted-foreground">
							No resources available for booking.
						</p>
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

	const handleEditResource = async (
		id: string,
		name: string,
		description: string
	) => {
		try {
			const result = await updateResource(id, { name, description })
			if (result.success) {
				toast.success('Resource updated successfully')
				setEditingResource(null)
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			console.error('Update resource error:', error)
			toast.error('Failed to update resource')
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
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
					<h2 className="text-2xl font-semibold text-center">Book Appointment</h2>
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
											{editingResource?.id === resource.id ? (
												<form
													onSubmit={e => {
														e.preventDefault()
														handleEditResource(
															resource.id,
															editingResource.name,
															editingResource.description
														)
													}}
													className="w-full space-y-2"
												>
													<Input
														value={editingResource.name}
														onChange={e =>
															setEditingResource({ ...editingResource, name: e.target.value })
														}
														maxLength={30}
														required
													/>
													<Input
														value={editingResource.description || ''}
														onChange={e =>
															setEditingResource({
																...editingResource,
																description: e.target.value,
															})
														}
														maxLength={50}
													/>
													<div className="flex gap-2">
														<Button type="submit" size="sm">
															Save
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => setEditingResource(null)}
														>
															Cancel
														</Button>
													</div>
												</form>
											) : (
												<div className="flex justify-between items-center">
													<div>
														<p className="font-medium">{resource.name}</p>
														<p className="text-sm opacity-90">{resource.description}</p>
													</div>
													<div className="flex gap-2">
														<Button
															onClick={() => setEditingResource(resource)}
															variant="ghost"
															size="sm"
														>
															Edit
														</Button>
														<Button
															onClick={() => handleDeleteResource(resource.id)}
															variant="ghost"
															size="sm"
															className="text-destructive"
														>
															Delete
														</Button>
													</div>
												</div>
											)}
										</div>
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>

					<div>
						<label className="text-sm font-medium mb-2 block">
							Start Date <span className="text-red-500">*</span>
						</label>
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
									<CalendarIcon className="mr-2 size-4" />
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

									{startDate && (
										<>
											<div className="flex flex-col items-center gap-4 pt-4 border-t w-full">
												<div className="flex items-center gap-2">
													<div>
														<p className="text-sm font-medium mb-2">Hour</p>
														<TimeSelector
															options={getAvailableHours(startDate).map(hour => ({
																value: hour,
																label: String(hour).padStart(2, '0'),
															}))}
															selectedValue={startDate.getHours()}
															onSelect={hour => {
																setStartDate(setHours(startDate, hour))
															}}
														/>
													</div>

													<div>
														<p className="text-sm font-medium mb-2">Minute</p>
														<TimeSelector
															options={
																isToday(startDate)
																	? getAvailableMinutes(startDate, startDate.getHours()).map(
																			minute => ({
																				value: minute,
																				label: String(minute).padStart(2, '0'),
																			})
																		)
																	: Array.from({ length: 12 }, (_, i) => ({
																			value: i * 5,
																			label: String(i * 5).padStart(2, '0'),
																		}))
															}
															selectedValue={startDate.getMinutes()}
															onSelect={minute => {
																setStartDate(setMinutes(startDate, minute))
															}}
														/>
													</div>
												</div>
											</div>
											<Button
												className="w-1/6 mt-4"
												onClick={() => setIsStartDrawerOpen(false)}
											>
												Apply
											</Button>
										</>
									)}
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
									<CalendarIcon className="mr-2 size-4" />
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

									{endDate && (
										<>
											<div className="flex flex-col items-center gap-4 pt-4 border-t w-full">
												<div className="flex items-center gap-2">
													<div>
														<p className="text-sm font-medium mb-2">Hour</p>
														<TimeSelector
															options={getAvailableHours(endDate).map(hour => ({
																value: hour,
																label: String(hour).padStart(2, '0'),
															}))}
															selectedValue={endDate.getHours()}
															onSelect={hour => {
																setEndDate(setHours(endDate, hour))
															}}
														/>
													</div>

													<div>
														<p className="text-sm font-medium mb-2">Minute</p>
														<TimeSelector
															options={
																isToday(endDate)
																	? getAvailableMinutes(endDate, endDate.getHours()).map(
																			minute => ({
																				value: minute,
																				label: String(minute).padStart(2, '0'),
																			})
																		)
																	: Array.from({ length: 12 }, (_, i) => ({
																			value: i * 5,
																			label: String(i * 5).padStart(2, '0'),
																		}))
															}
															selectedValue={endDate.getMinutes()}
															onSelect={minute => {
																setEndDate(setMinutes(endDate, minute))
															}}
														/>
													</div>
												</div>
											</div>
											<Button
												className="w-1/6 mt-4"
												onClick={() => setIsEndDrawerOpen(false)}
											>
												Apply
											</Button>
										</>
									)}
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
								<Clock className="mr-2 size-4 animate-spin" />
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
