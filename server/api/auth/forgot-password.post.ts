import { prisma } from '../../utils/prisma'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'



export default defineEventHandler(async (event) => {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await readBody(event)

    if(!body.email) {
        throw createError({ statusCode: 400, message: 'Email requis' })
    }

    const user = await prisma.user.findUnique({
        where: { email: body.email }
    })

    if(!user) {
        return { success: true, message: 'Si cet email existe, un lien a été envoyé' }
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000)

    await prisma.passwordReset.create({
        data: {
            email: body.email,
            token,
            expiresAt
        }
    })

    const resetURL = `${process.env.AUTH_ORIGIN?.replace('/api/auth', '') ?? 'http://localhost:3000'}/recuperer-mot-de-passe?token=${token}`

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: body.email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <h2>Réinitialisation de mot de passe</h2>
                <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <a href="${resetURL}">${resetURL}</a>
                <p>Ce lien expire dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>`
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(error.message)
        }
        console.log('Email envoyé avec succès:', data)

    } catch (error) {
        console.error('Erreur envoi email:', error)
        throw createError({ statusCode: 500, message: 'Erreur lors de l\'envoi de l\'email' })
    }

    return { success: true, message: 'Si cet email existe, un lien a été envoyé' }

})
