import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {

    const body = await readBody(event)

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{12,}$/;

    if (!passwordRegex.test(body.password)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Le mot de passe doit faire 12 caractères avec majuscule, chiffre et symbole.'
        })
    }

    const EmailExists = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    })

    if (EmailExists) {
        return {
            status: 400,
            message: 'Email déjà utilisé'
        }
    }

    const pwdCrypt = await hash(body.password, 10)

    const user = await prisma.user.create({
        data: {
            nom: body.nom,
            prenom: body.prenom,
            email: body.email,
            password: pwdCrypt,
            role: 'ETUDIANT'
        }
    })  

    return {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        message: 'Utilisateur créé avec succès'
    }
})