import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {

    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Vous devez être connecté' })
    }

    const query = getQuery(event)
    if (!query.userId) {
        return []
    }

    const userId = parseInt(session.user.id)

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { expediteurId: userId, destinataireId: parseInt(query.userId as string) },
                { expediteurId: parseInt(query.userId as string), destinataireId: userId }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        }
    })
    return messages
})