/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Vérifier authentification
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const userId = parseInt(session.user.id)
  const body = await readBody(event)

  // 2. Validation des champs
  if (!body.offreId || !body.note || !body.commentaire) {
    throw createError({ statusCode: 400, statusMessage: 'offreId, note et commentaire sont requis' })
  }

  const offreId = parseInt(body.offreId)
  const note = parseInt(body.note)

  if (note < 1 || note > 5) {
    throw createError({ statusCode: 400, statusMessage: 'La note doit être entre 1 et 5' })
  }

  if (body.commentaire.trim().length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Le commentaire doit faire au moins 10 caractères' })
  }

  // 3. VÉRIFICATION DU "POUVOIR SPÉCIAL"
  const permission = await prisma.reviewPermission.findUnique({
    where: { userId_offreId: { userId, offreId } }
  })

  if (!permission) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Vous n\'avez pas la permission de laisser un avis sur cette offre'
    })
  }

  // 4. Vérifier que l'utilisateur n'a pas déjà posté un avis
  const avisExistant = await prisma.avis.findUnique({
    where: { auteurId_offreId: { auteurId: userId, offreId } }
  })

  if (avisExistant) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Vous avez déjà posté un avis pour cette offre'
    })
  }

  // 5. Vérifier que l'offre existe
  const offre = await prisma.offre.findUnique({ where: { id: offreId } })
  if (!offre) {
    throw createError({ statusCode: 404, statusMessage: 'Offre non trouvée' })
  }

  // 6. Créer l'avis
  const nouvelAvis = await prisma.avis.create({
    data: {
      note,
      commentaire: body.commentaire.trim(),
      auteurId: userId,
      offreId
    },
    include: {
      auteur: { select: { id: true, prenom: true, nom: true } }
    }
  })

  return { success: true, avis: nouvelAvis }
})