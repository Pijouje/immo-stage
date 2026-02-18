import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const TYPES_AUTORISES: Record<string, string> = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'application/pdf': 'fichier',
    'application/msword': 'fichier',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fichier',
    'text/plain': 'fichier',
}

const TAILLE_MAX = 5 * 1024 * 1024 // 5 Mo

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if(!session){
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const formData = await readFormData(event)
    const fichier = formData.get('fichier') as File
    const destinataireId = formData.get('destinataireId') as string

    if(!destinataireId || !fichier){
        throw createError({ statusCode: 400, message: 'Fichier ou destinataire manquant' })
    }

    if(!(fichier.type in TYPES_AUTORISES)){
        throw createError({ statusCode: 400, message: 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, GIF, WEBP, PDF, DOC, DOCX, TXT.' })
    }

    if(fichier.size > TAILLE_MAX){
        throw createError({ statusCode: 400, message: 'Fichier trop volumineux (maximum 5 Mo).' })
    }

    const byte = await fichier.arrayBuffer()
    const buffer = Buffer.from(byte)

    const dossier = join(process.cwd(), 'public', 'uploads')
    await mkdir(dossier, { recursive: true })

    // Sanitisation du nom : on garde seulement les caractères sûrs
    const nomSanitise = fichier.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
    const nomFichier = `${Date.now()}-${nomSanitise}`
    await writeFile(join(dossier, nomFichier), buffer)

    const urlFichier = `/uploads/${nomFichier}`
    const typeFichier = TYPES_AUTORISES[fichier.type]

    const message = await prisma.message.create({
        data: {
            contenu: urlFichier,
            type: typeFichier,
            expediteurId: parseInt(session.user.id),
            destinataireId: parseInt(destinataireId)
        }
    })

    return message
})
