import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const { token } = getQuery(event)

    if (!token) {
        throw createError({ statusCode: 400, message: 'Token manquant' })
    }

    const record = await prisma.passwordReset.findUnique({
        where: { token: token as string }
    })

    if (!record || record.used) {
        throw createError({ statusCode: 400, message: 'Ce lien est invalide ou a déjà été utilisé' })
    }

    if (new Date() > record.expiresAt) {
        throw createError({ statusCode: 400, message: 'Ce lien a expiré. Faites une nouvelle demande.' })
    }

    return { valid: true }
})
