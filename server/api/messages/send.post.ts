import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)


export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Vous devez être connecté' })
    }

    const body = await readBody(event)

    if(!body.contenu || !body.destinataireId) {
        throw createError({ statusCode: 400, message: 'Message vide ou destinataire manquant' })
    }

    const expediteurId = parseInt(session.user.id)
    const destinataireId = parseInt(body.destinataireId)

    // SECURITE : Empêcher l'auto-envoi de messages
    if (expediteurId === destinataireId) {
        throw createError({ statusCode: 400, message: 'Vous ne pouvez pas vous envoyer un message' })
    }

    // SECURITE : Vérifier que le destinataire existe
    const destinataire = await prisma.user.findUnique({
        where: { id: destinataireId }
    })
    if (!destinataire) {
        throw createError({ statusCode: 404, message: 'Destinataire introuvable' })
    }

    // SECURITE : Limiter la longueur du message
    const contenu = String(body.contenu).trim()
    if (contenu.length === 0) {
        throw createError({ statusCode: 400, message: 'Message vide' })
    }
    if (contenu.length > 5000) {
        throw createError({ statusCode: 400, message: 'Message trop long (max 5000 caractères)' })
    }

    const message = await prisma.message.create({
        data: {
            contenu: contenu,
            expediteurId: expediteurId,
            destinataireId: destinataireId
        }
    })

    const messagesNonLusExistants = await prisma.message.count({
        where: {
            expediteurId: expediteurId,
            destinataireId: destinataireId,
            lu: false,
            id: { not: message.id }
        }
    })

    if (messagesNonLusExistants === 0) {
        const expediteurNom = `${(session.user as any).prenom || ''} ${(session.user as any).nom || ''}`.trim() || 'Un utilisateur'
        const emailDest = process.env.EMAIL_DEV_OVERRIDE || destinataire.email
        const siteUrl = process.env.AUTH_ORIGIN?.replace('/api/auth', '') || 'https://studloc.fr'
        const apercu = contenu.substring(0, 200) + (contenu.length > 200 ? '...' : '')
        
        const htmlEmail = '<div style="font-family: \'Segoe UI\', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">'
        + '<div style="background: #01111d; padding: 40px 40px 30px 40px; text-align: center;">'
        + '<h1 style="color: white; margin: 0; font-size: 1.8rem; letter-spacing: -0.5px;">Stud\'Loc</h1>'
        + '<p style="color: rgba(255,255,255,0.5); margin: 6px 0 0 0; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Logements étudiants à Amiens</p>'
        + '</div>'
        + '<div style="padding: 40px;">'
        + '<div style="width: 60px; height: 60px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; font-size: 1.8rem; text-align: center; line-height: 60px;">✉️</div>'
        + '<h2 style="color: #01111d; text-align: center; margin: 0 0 12px 0; font-size: 1.4rem;">Nouveau message reçu</h2>'
        + '<p style="color: #64748b; text-align: center; margin: 0 0 32px 0; font-size: 0.95rem; line-height: 1.6;"><strong style="color: #01111d;">' + expediteurNom + '</strong> vous a envoyé un message sur la plateforme Stud\'Loc.</p>'
        + '<div style="text-align: center;">'
        + '<a href="' + siteUrl + '/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1rem; letter-spacing: 0.3px;">Lire et répondre →</a>'
        + '</div>'
        + '</div>'
        + '<div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">'
        + '<p style="color: #94a3b8; font-size: 0.78rem; margin: 0; line-height: 1.6;">Vous recevez cet email car vous avez un compte sur Stud\'Loc.<br>Pour ne plus recevoir ces notifications, connectez-vous et modifiez vos préférences.</p>'
        + '</div>'
        + '</div>'


        resend.emails.send({
            from: 'noreply@studloc.fr',
            to: emailDest,
            subject: 'Nouveau message de ' + expediteurNom + ' — Stud\'Loc',
            html: htmlEmail
        }).catch(console.error)
    }

    return message
})
