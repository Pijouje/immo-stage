import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const TAILLE_MAX = 5 * 1024 * 1024 
const TYPES_AUTORISES = [
    'image/jpeg', 'image/png', 'image/webp', 
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if(!session){
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const formData = await readFormData(event)
    const fichier = formData.get('fichier') as File
    const destinataireId = formData.get('destinataireId') as string

    if(!destinataireId || !fichier || !fichier.size){
        throw createError({ statusCode: 400, message: 'Fichier ou destinataire manquant' })
    }

    if (fichier.size > TAILLE_MAX) {
        throw createError({ statusCode: 413, message: 'Fichier trop lourd (Max 5Mo)' })
    }

    if (!TYPES_AUTORISES.includes(fichier.type)) {
        throw createError({ statusCode: 415, message: 'Format de fichier non autorisé' })
    }

    const byte = await fichier.arrayBuffer()
    const buffer = Buffer.from(byte)

    const dossier = join(process.cwd(), 'public', 'uploads')
    await mkdir(dossier, { recursive: true })

    const extension = extname(fichier.name).toLowerCase() || '.bin'
    const nomFichier = `${randomUUID()}${extension}`
    
    await writeFile(join(dossier, nomFichier), buffer)

    const urlFichier = `/uploads/${nomFichier}`
    const typeFichier = TYPES_AUTORISES[fichier.type]

    const message = await prisma.message.create({
        data: {
            contenu: urlFichier,
            nom: fichier.name,
            type: fichier.type.startsWith('image/') ? 'image' : 'fichier',
            expediteurId: parseInt(session.user.id),
            destinataireId: parseInt(destinataireId),
            lu: false
        }
    })

    return message
})