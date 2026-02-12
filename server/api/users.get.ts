import { prisma } from '../utils/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if (!session || !session.user?.email) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const emailUser = session.user?.email

    const user = await prisma.user.findMany({
        where: {
            NOT: {
                email: emailUser
            }
        },
        select: {
            id: true,
            prenom: true,
            nom: true,
            avatar:true,
        }
    })
    return user
})
