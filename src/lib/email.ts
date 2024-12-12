import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

export function sendEmail({
    to,
    subject,
    text
}: {
    to: string
    subject: string
    text: string
}) {
    try {
        transporter.sendMail({
            from: {
                name: 'Nexres',
                address: process.env.GMAIL_USER as string,
            },
            to,
            subject,
            text,
        })
    } catch (error) {
        console.error('Send email error:', error)
        throw error
    }
} 