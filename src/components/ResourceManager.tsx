'use client'
import { useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { toast } from 'sonner'
import { createResource } from '@/actions/resource'

export default function ResourceManager() {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

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
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button>Add Resource</Button>
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
							<Label htmlFor="name">
								Resource Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="Meeting Room"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								value={description}
								onChange={e => setDescription(e.target.value)}
								placeholder="Talking with CEO"
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? 'Creating...' : 'Create Resource'}
						</Button>
					</form>
				</div>
			</PopoverContent>
		</Popover>
	)
}
