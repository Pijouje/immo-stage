/// <reference path="../../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const offre = await prisma.offre.findUnique({ where: { id } })

  if (!offre) {
    throw createError({ statusCode: 404, statusMessage: 'Offre non trouvée' })
  }

  const userId = parseInt(session.user.id)
  const isAdmin = session.user.role === 'ADMIN'
  const isOwner = offre.proprietaireId === userId

  if (!isAdmin && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  if (offre.status !== 'ARCHIVED') {
    throw createError({ statusCode: 400, statusMessage: 'Cette offre n\'est pas archivée' })
  }

  const updated = await prisma.offre.update({
    where: { id },
    data: { status: 'ACTIVE', archivedAt: null }
  })

  return { success: true, offre: updated }
})
