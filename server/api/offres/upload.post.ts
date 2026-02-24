/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const TAILLE_MAX = 5 * 1024 * 1024 // 5 Mo
const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp']

// SECURITE : Extension dérivée du type MIME validé (pas du nom de fichier client)
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

export default defineEventHandler(async (event) => {
  // 1. Vérifier l'authentification
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Non connecté' })
  }

  // 2. Vérifier les permissions
  const allowedRoles = ['ADMIN', 'PROPRIETAIRE']
  if (!allowedRoles.includes(session.user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seuls les administrateurs et propriétaires peuvent uploader des images'
    })
  }

  // 3. Lire le formulaire multipart
  const formData = await readFormData(event)
  const fichier = formData.get('image') as File

  if (!fichier || !fichier.size) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune image fournie' })
  }

  // 4. Vérifier la taille
  if (fichier.size > TAILLE_MAX) {
    throw createError({ statusCode: 413, statusMessage: 'Image trop lourde (max 5 Mo)' })
  }

  // 5. Vérifier le type MIME
  if (!TYPES_AUTORISES.includes(fichier.type)) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Format non autorisé. Utilisez JPG, PNG ou WebP'
    })
  }

  // 6. Sauvegarder le fichier
  const bytes = await fichier.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const dossier = join(process.cwd(), 'public', 'uploads', 'offres')
  await mkdir(dossier, { recursive: true })

  const extension = MIME_TO_EXT[fichier.type] || '.jpg'
  const nomFichier = `${randomUUID()}${extension}`

  await writeFile(join(dossier, nomFichier), buffer)

  const url = `/uploads/offres/${nomFichier}`

  return { success: true, url }
})
