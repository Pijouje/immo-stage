import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

export const uploadToR2 = async (
  buffer: Buffer,
  nomFichier: string,
  contentType: string
): Promise<string> => {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: nomFichier,
    Body: buffer,
    ContentType: contentType
  }))

  return `${process.env.R2_PUBLIC_URL}/${nomFichier}`
}


export const deleteFromR2 = async (url: string): Promise<void> => {
  try {
    const publicUrl = process.env.R2_PUBLIC_URL!
    const key = url.replace(`${publicUrl}/`, '')
    if (!key) return

    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key
    }))
  } catch (error) {
    console.warn('Impossible de supprimer le fichier R2 :', error)
  }
}