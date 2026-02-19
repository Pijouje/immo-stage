import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const { documentId, destinataireId } = await readBody(event)

    if (!documentId || !destinataireId) {
        throw createError({ statusCode: 400, message: 'Paramètres manquants' })
    }

    const document = await prisma.document.findUnique({
        where: { id: Number(documentId) }
    })

    if (!document) {
        throw createError({ statusCode: 404, message: 'Document introuvable' })
    }

    if (document.userId !== parseInt(session.user.id)) {
        throw createError({ statusCode: 403, message: 'Accès refusé' })
    }

    const message = await prisma.message.create({
        data: {
            contenu: document.url,
            type: document.type.startsWith('image/') ? 'image' : 'fichier',
            expediteurId: parseInt(session.user.id),
            destinataireId: parseInt(destinataireId),
            lu: false
        }
    })

    return message
})
