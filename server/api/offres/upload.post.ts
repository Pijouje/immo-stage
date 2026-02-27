import { getServerSession } from '#auth'
import { randomUUID } from 'crypto'
import { uploadToR2 } from '../../utils/r2'

const TAILLE_MAX = 5 * 1024 * 1024
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp']
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session || !session.user) throw createError({ statusCode: 401, statusMessage: 'Non connecté' })

  const allowedRoles = ['ADMIN', 'PROPRIETAIRE']
  if (!allowedRoles.includes(session.user.role)) throw createError({ statusCode: 403, statusMessage: 'Non autorisé' })

  const formData = await readFormData(event)
  const fichier = formData.get('image') as File
  if (!fichier || !fichier.size) throw createError({ statusCode: 400, statusMessage: 'Aucune image fournie' })
  if (fichier.size > TAILLE_MAX) throw createError({ statusCode: 413, statusMessage: 'Image trop lourde (max 5 Mo)' })
  if (!TYPES_AUTORISES.includes(fichier.type)) throw createError({ statusCode: 415, statusMessage: 'Format non autorisé. Utilisez JPG, PNG ou WebP' })

  const buffer = Buffer.from(await fichier.arrayBuffer())
  const extension = MIME_TO_EXT[fichier.type] || '.jpg'
  const nomFichier = `offres/${randomUUID()}${extension}`
  const url = await uploadToR2(buffer, nomFichier, fichier.type)

  return { success: true, url }
})