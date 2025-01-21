import ResetPassword from '@/components/ResetPassword'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export default function Reset() {
	return (
		<Suspense fallback={<Loader2 className="animate-spin" />}>
			<ResetPassword />
		</Suspense>
	)
}
