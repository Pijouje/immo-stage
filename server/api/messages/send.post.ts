import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Vous devez être connecté' })
    }

    const body = await readBody(event)

    if(!body.contenu || !body.destinataireId) {
        throw createError({ statusCode: 400, message: 'Message vide ou destinataire manquant' })
    }

    const message = await prisma.message.create({
        data: {
            contenu: body.contenu,
            expediteurId: parseInt((session.user as any).id),
            destinataireId: parseInt(body.destinataireId)
        }

    })
    return message
})