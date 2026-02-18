import { prisma } from '../utils/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    // L'id et le role sont déjà dans le token — pas besoin d'une requête DB supplémentaire
    const userId = parseInt(session.user.id)
    const role = session.user.role

    const estPrivilegie = role === 'ADMIN' || role === 'PROPRIETAIRE'

    const users = await prisma.user.findMany({
        where: estPrivilegie
            ? { NOT: { id: userId } }
            : { role: { in: ['PROPRIETAIRE', 'ADMIN'] } },
        select: {
            id: true,
            nom: true,
            prenom: true,
            avatar: true,
            email: true,
            role: true,
            messagesEnvoi: {
                where: { destinataireId: userId },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { createdAt: true, contenu: true }
            },
            messagesRecu: {
                where: { expediteurId: userId },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { createdAt: true, contenu: true, lu: true }
            },
            _count: {
                select: {
                    messagesEnvoi: {
                        where: { destinataireId: userId, lu: false }
                    }
                }
            }
        }
    })

    const usersAvecDate = users.map((u) => {
        const dateEnvoi = u.messagesEnvoi[0]?.createdAt ?? null
        const dateRecu = u.messagesRecu[0]?.createdAt ?? null
        const dernierMessage = !dateEnvoi ? dateRecu
            : !dateRecu ? dateEnvoi
            : dateEnvoi > dateRecu ? dateEnvoi : dateRecu

        const dernierContenu = dernierMessage === dateEnvoi
            ? u.messagesEnvoi[0]?.contenu
            : u.messagesRecu[0]?.contenu

        return {
            id: u.id,
            nom: u.nom,
            prenom: u.prenom,
            avatar: u.avatar,
            email: u.email,
            role: u.role,
            dernierMessage,
            dernierContenu,
            nonLus: u._count.messagesEnvoi,
            monDernierMessageLu: u.messagesRecu.length > 0
                && u.messagesRecu[0].lu
                && dernierMessage === dateRecu
        }
    })

    usersAvecDate.sort((a, b) => {
        if (!a.dernierMessage && !b.dernierMessage) return 0
        if (!a.dernierMessage) return 1
        if (!b.dernierMessage) return -1
        return b.dernierMessage.getTime() - a.dernierMessage.getTime()
    })

    return usersAvecDate
})
