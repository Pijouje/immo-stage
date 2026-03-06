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
  const offre = await prisma.offre.findUnique({ where: { id } })

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
      statusMessage: 'Vous n\'êtes pas autorisé à supprimer cette offre'
    })
  }

  // 5. Supprimer l'offre (les relations cascadent automatiquement via Prisma schema)
  await prisma.offre.delete({ where: { id } })

  return { success: true }
})
