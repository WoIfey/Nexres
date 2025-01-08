'use client'
import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { createResource } from '@/actions/resource'

export default function ResourceManager() {
	const [isOpen, setIsOpen] = useState(false)
	const [isPending, startTransition] = useTransition()
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		startTransition(async () => {
			try {
				const result = await createResource({ name, description })
				if (result.success) {
					toast.success('Resource created successfully')
					setName('')
					setDescription('')
					setIsOpen(false)
				} else {
					toast.error(result.error)
				}
			} catch (err) {
				console.error('Create resource error:', err)
				toast.error('Failed to create resource')
			}
		})
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button className="w-full sm:w-auto">Add Resource</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h1 className="font-medium leading-none">Create Resource</h1>
						<p className="text-sm text-muted-foreground">
							Add a new resource that can be booked.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<div className="group relative">
								<label
									htmlFor="resource"
									className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50"
								>
									Resource Name <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<Input
										id="resource"
										type="text"
										placeholder="Room 404"
										className="pe-16 text-sm"
										maxLength={30}
										value={name}
										onChange={e => setName(e.target.value)}
										required
										disabled={isPending}
										aria-describedby="character-count"
									/>
									<div
										id="character-count"
										className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
										aria-live="polite"
										role="status"
									>
										{name.length}/{30}
									</div>
								</div>
							</div>
						</div>
						<div className="space-y-2">
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
										className="pe-16 text-sm"
										maxLength={50}
										value={description}
										onChange={e => setDescription(e.target.value)}
										disabled={isPending}
										aria-describedby="character-count"
									/>
									<div
										id="character-count"
										className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
										aria-live="polite"
										role="status"
									>
										{description.length}/{50}
									</div>
								</div>
							</div>
						</div>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? 'Creating...' : 'Create Resource'}
						</Button>
					</form>
				</div>
			</PopoverContent>
		</Popover>
	)
}
