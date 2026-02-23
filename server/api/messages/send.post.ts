import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'


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
    return message
})
