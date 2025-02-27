'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'

interface CalendarThingProps {
	mode?: 'single' | 'range'
	selected?: Date | DateRange | undefined
	onSelect?: (date: Date | DateRange | undefined) => void
	timeSlots?: Array<{ time: string; available: boolean }>
	showTime?: boolean
	disabled?:
		| Date[]
		| { before: Date }
		| { after: Date }
		| { before: Date; after: Date }
}

export default function CalendarThing({
	mode = 'single',
	selected,
	onSelect,
	timeSlots = defaultTimeSlots,
	showTime = true,
	disabled,
}: CalendarThingProps) {
	const today = new Date()
	const [time, setTime] = useState<string | null>(null)
	const [startTime, setStartTime] = useState<string | null>(null)
	const [endTime, setEndTime] = useState<string | null>(null)

	const handleSelect = (value: Date | DateRange | undefined) => {
		if (mode === 'range') {
			const rangeValue = value as DateRange
			onSelect?.(rangeValue)
		} else {
			onSelect?.(value as Date)
		}
	}

	const handleTimeSelect = (timeSlot: string, isEndTime: boolean = false) => {
		if (mode === 'range') {
			if (isEndTime) {
				setEndTime(timeSlot)
			} else {
				setStartTime(timeSlot)
			}
		} else {
			setTime(timeSlot)
		}

		if (mode === 'single' && selected instanceof Date) {
			const [hours, minutes] = timeSlot.split(':')
			const newDate = new Date(selected)
			newDate.setHours(parseInt(hours), parseInt(minutes))
			onSelect?.(newDate)
		} else if (mode === 'range' && selected && 'from' in selected) {
			const [hours, minutes] = timeSlot.split(':')
			const dateToUpdate = isEndTime ? selected.to : selected.from
			if (!dateToUpdate) return

			const newDate = new Date(dateToUpdate)
			newDate.setHours(parseInt(hours), parseInt(minutes))

			onSelect?.({
				...selected,
				[isEndTime ? 'to' : 'from']: newDate,
			})
		}
	}

	return (
		<div>
			<div className="rounded-lg border border-border">
				<div className="flex max-sm:flex-col">
					{mode === 'range' ? (
						<Calendar
							mode="range"
							selected={selected as DateRange}
							onSelect={handleSelect}
							className="p-2 sm:pe-5"
							disabled={disabled ?? { before: today }}
						/>
					) : (
						<Calendar
							mode="single"
							selected={selected as Date}
							onSelect={handleSelect}
							className="p-2 sm:pe-5"
							disabled={disabled || [{ before: today }]}
						/>
					)}
					{showTime && (
						<div className="relative w-full sm:w-auto max-sm:h-[300px] sm:min-w-[280px]">
							<div className="border-border py-4 max-sm:border-t sm:border-s h-full">
								<ScrollArea className="h-full border-border">
									<div className="space-y-3 px-2">
										{mode === 'range' && selected && 'from' in selected ? (
											<div className="flex flex-col sm:flex-row gap-4">
												{/* Start Time Column */}
												<div className="flex-1">
													<div className="flex h-6 shrink-0 items-center mb-2">
														<p className="text-sm font-medium">Start Time</p>
													</div>
													<div className="grid gap-2 grid-cols-3 max-sm:grid-cols-3">
														{timeSlots.map(({ time: timeSlot, available }) => (
															<Button
																key={`start-${timeSlot}`}
																variant={startTime === timeSlot ? 'default' : 'outline'}
																size="sm"
																className="w-full text-sm"
																onClick={() => handleTimeSelect(timeSlot, false)}
																disabled={!available}
															>
																{timeSlot}
															</Button>
														))}
													</div>
												</div>

												{selected.to && (
													<div className="flex-1 max-sm:mt-6">
														<div className="flex h-6 shrink-0 items-center mb-2">
															<p className="text-sm font-medium">End Time</p>
														</div>
														<div className="grid gap-2 grid-cols-3 max-sm:grid-cols-3">
															{timeSlots.map(({ time: timeSlot, available }) => (
																<Button
																	key={`end-${timeSlot}`}
																	variant={endTime === timeSlot ? 'default' : 'outline'}
																	size="sm"
																	className="w-full text-sm"
																	onClick={() => handleTimeSelect(timeSlot, true)}
																	disabled={!available}
																>
																	{timeSlot}
																</Button>
															))}
														</div>
													</div>
												)}
											</div>
										) : (
											mode === 'single' && (
												<>
													<div className="flex h-6 shrink-0 items-center mb-2">
														<p className="text-sm font-medium">
															{selected instanceof Date && format(selected, 'EEEE, d')}
														</p>
													</div>
													<div className="grid gap-2 grid-cols-3">
														{timeSlots.map(({ time: timeSlot, available }) => (
															<Button
																key={timeSlot}
																variant={time === timeSlot ? 'default' : 'outline'}
																size="sm"
																className="w-full text-sm"
																onClick={() => handleTimeSelect(timeSlot)}
																disabled={!available}
															>
																{timeSlot}
															</Button>
														))}
													</div>
												</>
											)
										)}
									</div>
								</ScrollArea>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

const defaultTimeSlots = [
	{ time: '09:00', available: false },
	{ time: '09:30', available: false },
	{ time: '10:00', available: true },
	{ time: '10:30', available: true },
	{ time: '11:00', available: true },
	{ time: '11:30', available: true },
	{ time: '12:00', available: false },
	{ time: '12:30', available: true },
	{ time: '13:00', available: true },
	{ time: '13:30', available: true },
	{ time: '14:00', available: true },
	{ time: '14:30', available: false },
	{ time: '15:00', available: false },
	{ time: '15:30', available: true },
	{ time: '16:00', available: true },
	{ time: '16:30', available: true },
	{ time: '17:00', available: true },
	{ time: '17:30', available: true },
]
