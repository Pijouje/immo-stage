import { prisma } from '../utils/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if (!session || !session.user?.email) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const emailUser = session.user?.email

    const currentUser = await prisma.user.findUnique({
        where: { email: emailUser },
        select: { id: true, role: true }
    })

    const user = await prisma.user.findMany({
        where: currentUser?.role === ('ADMIN' as any) || currentUser?.role === ('PROPRIETAIRE' as any)
            ? {NOT : {email : emailUser}}
            : {role: { in : ['PROPRIETAIRE', 'ADMIN'] as any[] }},
        select: { id: true, nom: true, prenom: true, avatar: true, email: true, role: true }

    })
    return user
})
