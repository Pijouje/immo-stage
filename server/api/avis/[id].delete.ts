/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Vérifier authentification
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const avisId = parseInt(getRouterParam(event, 'id') as string)
  if (!avisId) {
    throw createError({ statusCode: 400, statusMessage: 'ID d\'avis invalide' })
  }

  // 2. Récupérer l'avis avec l'offre associée
  const avis = await prisma.avis.findUnique({
    where: { id: avisId },
    include: {
      offre: { select: { proprietaireId: true } }
    }
  })

  if (!avis) {
    throw createError({ statusCode: 404, statusMessage: 'Avis non trouvé' })
  }

  const userId = parseInt(session.user.id)
  const userRole = session.user.role

  // 3. Vérifier les droits : ADMIN global OU PROPRIETAIRE de l'offre
  const isAdmin = userRole === 'ADMIN'
  const isProprietaireOffre = userRole === 'PROPRIETAIRE' && avis.offre.proprietaireId === userId

  if (!isAdmin && !isProprietaireOffre) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seuls les administrateurs et le propriétaire de l\'offre peuvent supprimer des avis'
    })
  }

  // 4. Supprimer l'avis
  await prisma.avis.delete({ where: { id: avisId } })

  return { success: true, message: 'Avis supprimé avec succès' }
})