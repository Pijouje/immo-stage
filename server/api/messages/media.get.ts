import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const query = getQuery(event)
    const messageId = parseInt((query.id as string) || '0')
    const forceDownload = query.download === '1'
    const nom = decodeURIComponent((query.nom as string) || '')

    if (!messageId) {
        throw createError({ statusCode: 400, message: 'ID message manquant' })
    }

    const userId = parseInt(session.user.id)

    // Vérifier que l'utilisateur a accès à ce message
    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message) {
        throw createError({ statusCode: 404, message: 'Message introuvable' })
    }
    if (message.expediteurId !== userId && message.destinataireId !== userId) {
        throw createError({ statusCode: 403, message: 'Accès refusé' })
    }

    // Extraire la clé R2 depuis l'URL stockée
    const publicUrl = process.env.R2_PUBLIC_URL!
    const key = message.contenu.replace(`${publicUrl}/`, '').replace(/^\/+/, '')

    const r2 = new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT!,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
        }
    })

    try {
        const response = await r2.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key
        }))

        const contentType = response.ContentType || 'application/octet-stream'
        const fileName = nom || message.nom || key.split('/').pop() || 'fichier'

        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Cache-Control', 'private, max-age=3600')

        if (forceDownload) {
            setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`)
        }

        if (response.ContentLength) {
            setHeader(event, 'Content-Length', String(response.ContentLength))
        }

        const buffer = Buffer.from(await response.Body!.transformToByteArray())
        return buffer
    } catch (e: any) {
        if (e.name === 'NoSuchKey') {
            throw createError({ statusCode: 404, message: 'Fichier introuvable' })
        }
        throw createError({ statusCode: 500, message: 'Erreur lors de la récupération du fichier' })
    }
})
