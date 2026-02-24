/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Vérifier l'authentification
  const session = await getServerSession(event)

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Vous devez être connecté'
    })
  }

  // 2. Récupérer l'ID de l'offre
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  // 3. Vérifier que l'offre existe
  const offre = await prisma.offre.findUnique({
    where: { id },
    include: { images: true }
  })

  if (!offre) {
    throw createError({ statusCode: 404, statusMessage: 'Offre non trouvée' })
  }

  // 4. Vérifier les permissions (proprio de l'offre ou admin)
  const userId = parseInt(session.user.id)
  const isAdmin = session.user.role === 'ADMIN'
  const isOwner = offre.proprietaireId === userId

  if (!isAdmin && !isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Vous n\'êtes pas autorisé à modifier cette offre'
    })
  }

  // 5. Lire et valider les données
  const body = await readBody(event)
  const updateData: Record<string, any> = {}

  // --- Champs texte ---
  if (body.titre !== undefined) {
    const titre = String(body.titre).trim()
    if (titre.length === 0 || titre.length > 200) {
      throw createError({ statusCode: 400, statusMessage: 'Le titre doit faire entre 1 et 200 caractères' })
    }
    updateData.titre = titre
  }

  if (body.description !== undefined) {
    const desc = String(body.description).trim()
    if (desc.length === 0 || desc.length > 5000) {
      throw createError({ statusCode: 400, statusMessage: 'La description doit faire entre 1 et 5000 caractères' })
    }
    updateData.description = desc
  }

  if (body.lieu !== undefined) {
    const lieu = String(body.lieu).trim()
    if (lieu.length === 0 || lieu.length > 200) {
      throw createError({ statusCode: 400, statusMessage: 'Le lieu doit faire entre 1 et 200 caractères' })
    }
    updateData.lieu = lieu
  }

  // --- Champs numériques ---
  if (body.prix !== undefined) {
    const val = Number(body.prix)
    if (isNaN(val) || val <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Le prix doit être un nombre positif' })
    }
    updateData.prix = val
  }

  if (body.charges !== undefined) {
    const val = Number(body.charges)
    if (isNaN(val) || val < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Les charges doivent être un nombre positif ou zéro' })
    }
    updateData.charges = val
  }

  if (body.caution !== undefined) {
    updateData.caution = body.caution ? Number(body.caution) : null
  }

  if (body.surface !== undefined) {
    updateData.surface = body.surface ? Number(body.surface) : null
  }

  if (body.coloc !== undefined) {
    const val = Number(body.coloc)
    if (isNaN(val) || val < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Le nombre de colocataires doit être positif ou zéro' })
    }
    updateData.coloc = val
  }

  if (body.chambresDisponibles !== undefined) {
    const val = Number(body.chambresDisponibles)
    if (isNaN(val) || val < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Le nombre de chambres disponibles doit être positif ou zéro' })
    }
    updateData.chambresDisponibles = val
  }

  // --- Tags (équipements) ---
  if (body.tags !== undefined) {
    if (Array.isArray(body.tags)) {
      updateData.tags = body.tags.filter((t: string) => t && t.trim() !== '')
    }
  }

  // --- Images ---
  // On reçoit un tableau d'URLs, on remplace toutes les images
  if (body.images !== undefined && Array.isArray(body.images)) {
    const urls: string[] = body.images.filter((u: string) => u && u.trim() !== '')

    // SECURITE : Valider les URLs
    for (const url of urls) {
      const lower = url.toLowerCase()
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
        throw createError({ statusCode: 400, statusMessage: 'URL d\'image invalide' })
      }
    }

    // Supprimer les anciennes images et créer les nouvelles
    await prisma.offreImage.deleteMany({ where: { offreId: id } })
    if (urls.length > 0) {
      await prisma.offreImage.createMany({
        data: urls.map(url => ({ url, offreId: id }))
      })
    }
  }

  // Vérifier qu'il y a au moins quelque chose à mettre à jour
  if (Object.keys(updateData).length === 0 && body.images === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aucune donnée à mettre à jour'
    })
  }

  // 6. Mettre à jour l'offre
  let updated
  if (Object.keys(updateData).length > 0) {
    updated = await prisma.offre.update({
      where: { id },
      data: updateData,
      include: { images: true, avis: true, proprietaire: { select: { nom: true, prenom: true } } }
    })
  } else {
    updated = await prisma.offre.findUnique({
      where: { id },
      include: { images: true, avis: true, proprietaire: { select: { nom: true, prenom: true } } }
    })
  }

  return { success: true, offre: updated }
})
