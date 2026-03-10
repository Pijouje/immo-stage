import { prisma } from '../../utils/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event as any)
    if (!session?.user) throw createError({ statusCode: 401 })
    const body = await readBody(event)
    const myId = parseInt((session.user as any).id)
    const contactId = parseInt(body.contactId)
    const [a, b] = [Math.min(myId, contactId), Math.max(myId, contactId)]
    await prisma.conversationoffre.upsert({
        where: { user1Id_user2Id: { user1Id: a, user2Id: b } },
        update: { offreId: body.offreId || null },
        create: { user1Id: a, user2Id: b, offreId: body.offreId || null }
    })
    return { success: true }
})