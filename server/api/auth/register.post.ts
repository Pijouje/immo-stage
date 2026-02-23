import { prisma } from '../../utils/prisma'
import { hash } from 'bcrypt'

export default defineEventHandler(async (event) => {

    const body = await readBody(event)

    // SECURITE : Validation des champs requis
    if (!body.nom || !body.prenom || !body.email || !body.password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Tous les champs sont requis (nom, prénom, email, mot de passe)'
        })
    }

    // SECURITE : Nettoyage des inputs (trim + normalisation email en minuscules)
    const nom = String(body.nom).trim()
    const prenom = String(body.prenom).trim()
    const email = String(body.email).trim().toLowerCase()

    // SECURITE : Validation longueur des champs
    if (nom.length > 100 || prenom.length > 100) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Le nom et prénom ne doivent pas dépasser 100 caractères'
        })
    }

    // SECURITE : Validation format email côté serveur
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Format d\'email invalide'
        })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{12,}$/;

    if (!passwordRegex.test(body.password)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Le mot de passe doit faire 12 caractères avec majuscule, chiffre et symbole.'
        })
    }

    const EmailExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (EmailExists) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email déjà utilisé'
        })
    }

    const pwdCrypt = await hash(body.password, 10)

    const user = await prisma.user.create({
        data: {
            nom: nom,
            prenom: prenom,
            email: email,
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
