import { prisma } from '../../utils/prisma'
import { getServerSession } from '#auth'
import { unlink } from 'node:fs/promises'
import { join, resolve, basename } from 'node:path'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const body = await readBody(event)
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID manquant' })
    }

    const message = await prisma.message.findUnique({
        where: { id: Number(id) }
    })

    if (!message) {
        throw createError({ statusCode: 404, message: 'Message introuvable' })
    }

    if (message.expediteurId !== Number(session.user.id)) {
        throw createError({ statusCode: 403, message: 'Interdit de supprimer ce message' })
    }

    // SECURITE : Protection path traversal - on utilise uniquement le basename du fichier
    if (['image', 'fichier'].includes(message.type) && message.contenu && message.contenu.startsWith('/uploads/')) {
        try {
            const nomFichier = basename(message.contenu)
            const dossierUploads = resolve(process.cwd(), 'public', 'uploads')
            const cheminFichier = resolve(dossierUploads, nomFichier)
            // Vérifier que le chemin résolu reste dans le dossier uploads
            if (!cheminFichier.startsWith(dossierUploads)) {
                throw new Error('Chemin de fichier invalide')
            }
            await unlink(cheminFichier)
        } catch (error) {
            console.warn("Fichier physique introuvable ou erreur :", error)
        }
    }

    await prisma.message.delete({
        where: { id: Number(id) }
    })

    return { 
        success: true 
    }
})