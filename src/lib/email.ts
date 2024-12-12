import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

export async function sendEmail({
    to,
    subject,
    text
}: {
    to: string
    subject: string
    text: string
}) {
    try {
        await transporter.sendMail({
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