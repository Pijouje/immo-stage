import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) throw createError({ statusCode: 401, message: 'Non connecté' })

    const body = await readBody(event)
    
    await prisma.message.updateMany({
        where: {
            expediteurId: parseInt(body.contactId),
            destinataireId: parseInt((session.user as any).id),
            lu: false
        },
        data: { lu: true }
    })
    return { success: true }
})