import { prisma } from '../../utils/prisma'
import { getServerSession } from '#auth'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

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

    if (['image', 'fichier'].includes(message.type) && message.contenu && message.contenu.startsWith('/uploads/')) {
        try {
            const nomFichier = message.contenu.replace('/uploads/', '')
            const cheminFichier = join(process.cwd(), 'public', 'uploads', nomFichier)
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