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
        select: { id: true, nom: true, prenom: true, avatar: true, email: true, role: true,
                messagesEnvoi:{
                    where :{ destinataireId : currentUser?.id,},
                    orderBy : { createdAt : 'desc' },
                    take : 1,
                    select : { createdAt: true , contenu: true}
                },
                messagesRecu:{
                    where :{ expediteurId : currentUser?.id,},
                    orderBy : { createdAt : 'desc' },
                    take : 1,
                    select : { createdAt: true , contenu: true}
                }
         }

    })
    const usersAvecDate = user.map((user) => {
        const dernierMessageEnvoi = user.messagesEnvoi[0]?.createdAt ?? null
        const dernierMessageRecu = user.messagesRecu[0]?.createdAt ?? null
        const dernierMessage = !dernierMessageEnvoi ? dernierMessageRecu
            : !dernierMessageRecu ? dernierMessageEnvoi 
            : dernierMessageEnvoi > dernierMessageRecu ? dernierMessageEnvoi : dernierMessageRecu

        const dernierContenu = dernierMessage === dernierMessageEnvoi 
            ? user.messagesEnvoi[0]?.contenu 
            : user.messagesRecu[0]?.contenu

        return {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            avatar: user.avatar,
            email: user.email,
            role: user.role,
            dernierMessage,
            dernierContenu
        }
    })

    usersAvecDate.sort((a, b) => {
        if (!a.dernierMessage && !b.dernierMessage){
            return 0
        }else if (!a.dernierMessage) {
            return 1
        } else if (!b.dernierMessage) {
            return -1
        }else {
            return b.dernierMessage.getTime() - a.dernierMessage.getTime()
        }
    })

    return usersAvecDate
})
