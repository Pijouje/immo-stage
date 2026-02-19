import { prisma } from '../../utils/prisma'
import { hash } from 'bcrypt'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.token || !body.newPassword) {
        throw createError({ statusCode: 400, message: 'Token et nouveau mot de passe requis' })
    }

    const resetRecord = await prisma.passwordReset.findUnique({
        where: { token: body.token }
    })

    if(!resetRecord || resetRecord.used) {
        throw createError({ statusCode: 400, message: 'Token invalide ou déjà utilisé' })
    }

    if(new Date() > resetRecord.expiresAt) {
        throw createError({ statusCode: 400, message: 'Token expiré' })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{12,}$/
    if (!passwordRegex.test(body.newPassword)) {
        throw createError({
            statusCode: 400,
            message: 'Le mot de passe doit contenir 12 caractères, une majuscule, un chiffre et un symbole'
        })
    }

    const hashedPassword = await hash(body.newPassword, 10)

    await prisma.user.update({
        where: { email: resetRecord.email },
        data: { password: hashedPassword }
    })

    await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
    })

    return { success: true, message: 'Mot de passe réinitialisé avec succès' }
})
