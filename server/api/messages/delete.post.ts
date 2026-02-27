import { prisma } from '../../utils/prisma'
import { getServerSession } from '#auth'
import { deleteFromR2 } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const body = await readBody(event)
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID manquant' })
    }

    const message = await prisma.message.findUnique({
        where: { id: Number(id) }
    })

    if (!message) {
        throw createError({ statusCode: 404, message: 'Message introuvable' })
    }

    if (message.expediteurId !== Number(session.user.id)) {
        throw createError({ statusCode: 403, message: 'Interdit de supprimer ce message' })
    }

    if (['image', 'fichier'].includes(message.type) && message.contenu) {
        await deleteFromR2(message.contenu)
    }

    await prisma.message.delete({
        where: { id: Number(id) }
    })

    return { 
        success: true 
    }
})