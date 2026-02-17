import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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

    const byte = await fichier.arrayBuffer()
    const buffer = Buffer.from(byte)

    const dossier = join(process.cwd(), 'public', 'uploads')
    await mkdir(dossier, { recursive: true })

    const nomFichier = `${Date.now()}-${fichier.name}`
    await writeFile(join(dossier, nomFichier), buffer)

    const urlFichier = `/uploads/${nomFichier}`

     const message = await prisma.message.create({
        data: {
            contenu: urlFichier,
            type: fichier.type.startsWith('image/') ? 'image' : 'fichier',
            expediteurId: parseInt((session.user as any).id),
            destinataireId: parseInt(destinataireId)
        }
    })

    return message
})
