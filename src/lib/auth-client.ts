import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({ baseURL: process.env.BETTER_AUTH_URL as string })

export const errorMessages: Record<string, string> = {
    'USER_ALREADY_EXISTS': 'This email is already registered',
    'INVALID_EMAIL_OR_PASSWORD': 'Invalid email or password',
    'USER_NOT_FOUND': 'Account not found. Creating new account...',
    'PASSWORD_TOO_SHORT': 'Password must be at least 8 characters long',
    'default': 'An error occurred. Please try again.'
}
