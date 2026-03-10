/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'


export default defineEventHandler(async (event) => {
  // On récupère l'ID depuis l'URL (ex: /api/offres/1)
  const id = Number(getRouterParam(event, 'id'))

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const offre = await prisma.offre.findUnique({
    where: { id },
    include: {
      offreimage: true, // Toutes les images pour la galerie
      avis: true,   // Pour calculer la note et le nombre d'avis
      user: {
        select: { nom: true, prenom: true }
      }
    }
  })

  if (!offre) {
    throw createError({ statusCode: 404, statusMessage: 'Annonce non trouvée' })
  }

  // Si l'offre n'est pas ACTIVE, seul le propriétaire ou un admin peut la voir
  if (offre.status !== 'ACTIVE') {
    const session = await getServerSession(event)

    if (!session || !session.user) {
      throw createError({ statusCode: 404, statusMessage: 'Annonce non trouvée' })
    }

    const userId = parseInt(session.user.id)
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = offre.proprietaireId === userId

    if (!isAdmin && !isOwner) {
      throw createError({ statusCode: 404, statusMessage: 'Annonce non trouvée' })
    }
  }

  return offre
})
