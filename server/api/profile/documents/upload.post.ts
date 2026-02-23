import { getServerSession } from '#auth'
import { prisma } from '../../../utils/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const TAILLE_MAX = 5 * 1024 * 1024
const TYPES_AUTORISES = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

// SECURITE : Dériver l'extension du type MIME validé (pas du nom de fichier client)
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
}

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const formData = await readFormData(event)
    const fichier = formData.get('fichier') as File

    if (!fichier || !fichier.size) {
        throw createError({ statusCode: 400, message: 'Fichier manquant' })
    }

    if (fichier.size > TAILLE_MAX) {
        throw createError({ statusCode: 413, message: 'Fichier trop lourd (Max 5Mo)' })
    }

    if (!TYPES_AUTORISES.includes(fichier.type)) {
        throw createError({ statusCode: 415, message: 'Format non autorisé (PDF, DOC, DOCX, JPEG, PNG, WEBP)' })
    }

    const buffer = Buffer.from(await fichier.arrayBuffer())
    const dossier = join(process.cwd(), 'public', 'uploads', 'documents')
    await mkdir(dossier, { recursive: true })

    // SECURITE : Extension dérivée du MIME validé, pas du nom de fichier client
    const extension = MIME_TO_EXT[fichier.type] || '.bin'
    const nomFichier = `${randomUUID()}${extension}`
    await writeFile(join(dossier, nomFichier), buffer)

    const url = `/uploads/documents/${nomFichier}`

    const document = await prisma.document.create({
        data: {
            nom: fichier.name,
            url,
            type: fichier.type,
            userId: parseInt(session.user.id)
        }
    })

    return document
})
