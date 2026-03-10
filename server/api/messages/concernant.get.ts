import { prisma } from '../../utils/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event as any)
    if (!session?.user) throw createError({ statusCode: 401 })
    const query = getQuery(event)
    const myId = parseInt((session.user as any).id)
    const contactId = parseInt(query.contactId as string)
    const [a, b] = [Math.min(myId, contactId), Math.max(myId, contactId)]
    const record = await prisma.conversationoffre.findUnique({
        where: { user1Id_user2Id: { user1Id: a, user2Id: b } }
    })
    return { offreId: record?.offreId || null }
})