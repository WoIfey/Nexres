'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Edit3, MoreVertical, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import CalendarThing from './Calendar'
import { DateRange } from 'react-day-picker'

const isTimeSlotBooked = (start: Date, end: Date, resource?: Resource) => {
	if (!resource) return false

	return resource.bookings?.some((booking: Booking) => {
		const bookingStart = new Date(booking.startDate)
		const bookingEnd = new Date(booking.endDate)

		return (
			(start >= bookingStart && start < bookingEnd) ||
			(end > bookingStart && end <= bookingEnd) ||
			(start <= bookingStart && end >= bookingEnd)
		)
	})
}

export default function Booking({ resources }: { resources: Resource[] }) {
	const [dateRange, setDateRange] = useState<DateRange | undefined>()
	const [isLoading, setIsLoading] = useState(false)
	const [selectedResource, setSelectedResource] = useState<string>()
	const [isStartDrawerOpen, setIsStartDrawerOpen] = useState(false)
	const [isDeletingResource, setIsDeletingResource] = useState<string | null>(
		null
	)
	const [editingResource, setEditingResource] = useState<{
		id: string
		name: string
		description: string
	} | null>(null)
	const [isPending, startTransition] = useTransition()

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
		if (!dateRange?.from || !selectedResource) {
			toast.error('Please select date range and resource')
			return
		}

		if (dateRange.to && dateRange.to <= dateRange.from) {
			toast.error('End date must be after start date')
			return
		}

		const selectedResourceObj = resources.find(r => r.id === selectedResource)
		if (
			isTimeSlotBooked(
				dateRange.from,
				dateRange.to || dateRange.from,
				selectedResourceObj
			)
		) {
			toast.error('This time slot is already booked')
			return
		}

		setIsLoading(true)
		try {
			const result = await createBooking({
				startDate: dateRange.from,
				endDate: dateRange.to || dateRange.from,
				resourceId: selectedResource,
			})

			if (result.success) {
				toast.success('Booking created successfully')
				setDateRange(undefined)
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
					setDateRange(undefined)
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
		startTransition(async () => {
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
		})
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
						<ScrollArea className="h-[256px] w-full rounded-md border">
							<div className="p-4 grid gap-2">
								{resources.map(resource => (
									<div key={resource.id}>
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
												className="w-full space-y-4 p-4 pt-6 outline outline-1 outline-border rounded-lg"
											>
												<div className="group relative">
													<label
														htmlFor="resource"
														className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
													>
														Resource Name <span className="text-destructive">*</span>
													</label>
													<div className="relative">
														<Input
															id="resource"
															type="text"
															placeholder="Room 404"
															className="pe-16"
															value={editingResource.name}
															onChange={e =>
																setEditingResource({
																	...editingResource,
																	name: e.target.value,
																})
															}
															maxLength={30}
															required
															aria-describedby="character-count"
														/>
														<div
															id="character-count"
															className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
															aria-live="polite"
															role="status"
														>
															{editingResource.name.length}/{30}
														</div>
													</div>
												</div>
												<div className="group relative">
													<label
														htmlFor="description"
														className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
													>
														Description
													</label>
													<div className="relative">
														<Input
															id="description"
															type="text"
															placeholder="Something about the resource"
															className="pe-16"
															value={editingResource.description || ''}
															onChange={e =>
																setEditingResource({
																	...editingResource,
																	description: e.target.value,
																})
															}
															maxLength={50}
															aria-describedby="character-count"
														/>
														<div
															id="character-count"
															className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
															aria-live="polite"
															role="status"
														>
															{editingResource.description.length}/{50}
														</div>
													</div>
												</div>
												<div className="flex gap-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="w-full"
														onClick={() => setEditingResource(null)}
													>
														Cancel
													</Button>
													<Button
														type="submit"
														size="sm"
														className="w-full"
														disabled={isPending}
													>
														Save
													</Button>
												</div>
											</form>
										) : (
											<div
												className={cn(
													'w-full flex items-center justify-between rounded-lg border p-4 transition-colors cursor-pointer',
													selectedResource === resource.id &&
														'bg-primary text-primary-foreground hover:bg-primary/90'
												)}
												onClick={() => setSelectedResource(resource.id)}
											>
												<div className="flex-1">
													<div className="min-w-0 flex-1">
														<p className="font-medium truncate">{resource.name}</p>
														{resource.description && (
															<p className="text-sm opacity-90 truncate mt-0.5">
																{resource.description}
															</p>
														)}
													</div>
												</div>

												<DropdownMenu>
													<DropdownMenuTrigger className="size-8 p-0 flex items-center justify-center">
														<span className="sr-only">Open menu</span>
														<MoreVertical className="size-5" />
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => {
																setEditingResource({
																	id: resource.id,
																	name: resource.name,
																	description: resource.description || '',
																})
															}}
														>
															<Edit3 className="size-4" />
															<span>Edit</span>
														</DropdownMenuItem>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<DropdownMenuItem
																	onSelect={e => e.preventDefault()}
																	className="text-destructive"
																>
																	<Trash2 className="size-4" />
																	<span>Delete</span>
																</DropdownMenuItem>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
																	<AlertDialogDescription>
																		This action cannot be undone. This will also delete the
																		bookings associated with this resource.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel className="w-full">
																		Cancel
																	</AlertDialogCancel>
																	<AlertDialogAction asChild>
																		<Button
																			className="w-full"
																			onClick={() => handleDeleteResource(resource.id)}
																		>
																			Confirm
																		</Button>
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										)}
									</div>
								))}
							</div>
						</ScrollArea>
					</div>

					<div>
						<label className="text-sm font-medium mb-2 block">
							Date Range <span className="text-destructive">*</span>
						</label>
						<Drawer open={isStartDrawerOpen} onOpenChange={setIsStartDrawerOpen}>
							<DrawerTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'w-full justify-start text-left font-normal',
										!dateRange && 'text-muted-foreground'
									)}
									disabled={!selectedResource}
								>
									<CalendarIcon className="mr-2 size-4" />
									{dateRange?.from
										? `${format(dateRange.from, 'MM/dd/yyyy HH:mm')}${
												dateRange.to ? ` - ${format(dateRange.to, 'MM/dd/yyyy HH:mm')}` : ''
										  }`
										: 'Select date range'}
								</Button>
							</DrawerTrigger>
							<DrawerContent>
								<DrawerHeader>
									<DrawerTitle className="text-center">Select date range</DrawerTitle>
								</DrawerHeader>
								<div className="p-4 space-y-4 flex flex-col items-center">
									<CalendarThing
										mode="range"
										selected={dateRange}
										onSelect={range => setDateRange(range as DateRange)}
										disabled={{ before: new Date() }}
										showTime={true}
									/>

									<Button
										className="w-1/6 mt-4"
										onClick={() => setIsStartDrawerOpen(false)}
									>
										Apply
									</Button>
								</div>
							</DrawerContent>
						</Drawer>
					</div>

					<Button
						onClick={handleBooking}
						className="w-full"
						disabled={isLoading || !dateRange?.from}
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
