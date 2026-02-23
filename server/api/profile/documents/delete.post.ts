import { getServerSession } from '#auth'
import { prisma } from '../../../utils/prisma'
import { unlink } from 'node:fs/promises'
import { join, resolve, basename } from 'node:path'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const { id } = await readBody(event)
    if (!id) {
        throw createError({ statusCode: 400, message: 'ID manquant' })
    }

    const document = await prisma.document.findUnique({
        where: { id: Number(id) }
    })

    if (!document) {
        throw createError({ statusCode: 404, message: 'Document introuvable' })
    }

    if (document.userId !== parseInt(session.user.id)) {
        throw createError({ statusCode: 403, message: 'Interdit de supprimer ce document' })
    }

    // SECURITE : Protection path traversal - on utilise uniquement le basename
    if (document.url.startsWith('/uploads/')) {
        try {
            const nomFichier = basename(document.url)
            const dossierUploads = resolve(process.cwd(), 'public', 'uploads')
            const cheminFichier = resolve(dossierUploads, nomFichier)
            // Vérifier que le chemin résolu reste dans le dossier uploads
            if (!cheminFichier.startsWith(dossierUploads)) {
                throw new Error('Chemin de fichier invalide')
            }
            await unlink(cheminFichier)
        } catch {
            // Fichier déjà supprimé ou introuvable, on continue
        }
    }

    await prisma.document.delete({ where: { id: Number(id) } })

    return { success: true }
})
