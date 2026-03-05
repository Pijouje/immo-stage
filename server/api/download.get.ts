import { getServerSession } from '#auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'Non connecté' })
    }

    const query = getQuery(event)
    const url = decodeURIComponent((query.url as string) || '')
    const nom = decodeURIComponent((query.nom as string) || '')

    if (!url) {
        throw createError({ statusCode: 400, message: 'URL manquante' })
    }

    // SECURITE : Vérifier que l'URL provient bien de notre bucket R2
    const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, '')
    if (!url.startsWith(publicUrl + '/')) {
        throw createError({ statusCode: 403, message: 'URL non autorisée' })
    }

    // Extraire la clé R2 (supprimer les slashes en début si R2_PUBLIC_URL a un slash final)
    const key = url.slice(publicUrl.length + 1).replace(/^\/+/, '')

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

        const fileName = nom || key.split('/').pop() || 'fichier'
        const contentType = response.ContentType || 'application/octet-stream'

        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`)
        if (response.ContentLength) {
            setHeader(event, 'Content-Length', response.ContentLength)
        }

        const buffer = Buffer.from(await response.Body!.transformToByteArray())
        return buffer
    } catch (e: any) {
        if (e.name === 'NoSuchKey') {
            throw createError({ statusCode: 404, message: 'Fichier introuvable' })
        }
        throw createError({ statusCode: 500, message: 'Erreur lors du téléchargement' })
    }
})
