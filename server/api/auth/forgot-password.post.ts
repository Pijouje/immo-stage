import { prisma } from '../../utils/prisma'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'



export default defineEventHandler(async (event) => {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await readBody(event)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!body.email || !emailRegex.test(body.email)) {
        throw createError({ statusCode: 400, message: 'Email invalide' })
    }

    const user = await prisma.user.findUnique({
        where: { email: body.email }
    })

    if (!user) {
        return { success: true, message: 'Si cet email existe, un lien a été envoyé' }
    }

    // Supprimer les anciens tokens non utilisés pour cet email
    await prisma.passwordReset.deleteMany({
        where: { email: body.email, used: false }
    })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000)

    const resetRecord = await prisma.passwordReset.create({
        data: { email: body.email, token, expiresAt }
    })

    const resetURL = `${process.env.AUTH_ORIGIN?.replace('/api/auth', '') ?? 'http://localhost:3000'}/recuperer-mot-de-passe?token=${token}`

    const destinataire = process.env.NODE_ENV !== 'production' && process.env.EMAIL_DEV_OVERRIDE
        ? process.env.EMAIL_DEV_OVERRIDE
        : body.email

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: destinataire,
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
        // Rollback : supprimer le token créé puisque l'email n'a pas été envoyé
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } }).catch(() => {})
        console.error('Erreur envoi email:', error)
        throw createError({ statusCode: 500, message: 'Erreur lors de l\'envoi de l\'email' })
    }

    return { success: true, message: 'Si cet email existe, un lien a été envoyé' }

})
