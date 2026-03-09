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
    await prisma.passwordreset.deleteMany({
        where: { email: body.email, used: false }
    })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000)

    const resetRecord = await prisma.passwordreset.create({
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
            subject: 'Réinitialisation de votre mot de passe — Stud\'Loc',
            html: '<div style="font-family: \'Segoe UI\', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">'
            + '<div style="background: #01111d; padding: 40px 40px 30px 40px; text-align: center;">'
            + '<h1 style="color: white; margin: 0; font-size: 1.8rem; letter-spacing: -0.5px;">Stud\'Loc</h1>'
            + '<p style="color: rgba(255,255,255,0.5); margin: 6px 0 0 0; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Logements étudiants à Amiens</p>'
            + '</div>'
            + '<div style="padding: 40px;">'
            + '<div style="width: 60px; height: 60px; background: #fee2e2; border-radius: 50%; text-align: center; line-height: 60px; font-size: 1.8rem; margin: 0 auto 24px auto;">🔐</div>'
            + '<h2 style="color: #01111d; text-align: center; margin: 0 0 12px 0; font-size: 1.4rem;">Réinitialisation de mot de passe</h2>'
            + '<p style="color: #64748b; text-align: center; margin: 0 0 32px 0; font-size: 0.95rem; line-height: 1.6;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>'
            + '<div style="text-align: center;">'
            + '<a href="' + resetURL + '" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1rem; letter-spacing: 0.3px;">Réinitialiser mon mot de passe →</a>'
            + '</div>'
            + '<p style="color: #94a3b8; text-align: center; font-size: 0.8rem; margin-top: 24px;">Ce lien expire dans <strong>1 heure</strong>.</p>'
            + '</div>'
            + '<div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">'
            + '<p style="color: #94a3b8; font-size: 0.78rem; margin: 0; line-height: 1.6;">Si vous n\'avez pas demandé cette réinitialisation, ignorez simplement cet email.<br>Votre mot de passe ne sera pas modifié.</p>'
            + '</div>'
            + '</div>'
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(error.message)
        }
        console.log('Email envoyé avec succès:', data)

    } catch (error) {
        // Rollback : supprimer le token créé puisque l'email n'a pas été envoyé
        await prisma.passwordreset.delete({ where: { id: resetRecord.id } }).catch(() => {})
        console.error('Erreur envoi email:', error)
        throw createError({ statusCode: 500, message: 'Erreur lors de l\'envoi de l\'email' })
    }

    return { success: true, message: 'Si cet email existe, un lien a été envoyé' }

})
