import { getServerSession } from '#auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const { messageId } = await readBody(event)

    if (!messageId) {
        throw createError({ statusCode: 400, message: 'ID message manquant' })
    }

    const userId = parseInt(session.user.id)

    const message = await prisma.message.findUnique({
        where: { id: Number(messageId) }
    })

    if (!message) {
        throw createError({ statusCode: 404, message: 'Message introuvable' })
    }

    if (message.expediteurId !== userId && message.destinataireId !== userId) {
        throw createError({ statusCode: 403, message: 'Accès refusé' })
    }

    if (!['image', 'fichier'].includes(message.type)) {
        throw createError({ statusCode: 400, message: 'Ce message ne contient pas de fichier' })
    }

    const nom = message.nom as any || message.contenu.split('/').pop() || 'fichier'
    const type = message.type === 'image' ? 'image/jpeg' : 'application/octet-stream'

    const document = await prisma.document.create({
        data: { nom, url: message.contenu, type, userId }
    })

    return document
})
