/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

const LIMIT = 9

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const statusFilter = (query.status as string)?.toUpperCase()

  // Par défaut, seules les offres ACTIVE sont visibles
  let whereClause: any = { status: 'ACTIVE' }

  // Si un filtre status est demandé (INACTIVE ou ARCHIVED), vérifier l'auth
  if (statusFilter === 'INACTIVE' || statusFilter === 'ARCHIVED') {
    const session = await getServerSession(event)

    if (!session || !session.user) {
      throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
    }

    const role = (session.user as any).role
    if (role !== 'ADMIN' && role !== 'PROPRIETAIRE') {
      throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
    }

    whereClause = { status: statusFilter }

    // Les propriétaires ne voient que leurs propres offres
    if (role === 'PROPRIETAIRE') {
      whereClause.proprietaireId = parseInt((session.user as any).id)
    }
  }

  const [offres, total] = await Promise.all([
    prisma.offre.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        offreimage: { take: 1 }
      }
    }),
    prisma.offre.count({ where: whereClause })
  ])

  return {
    offres: offres.map(offre => ({
      id: offre.id,
      titre: offre.titre,
      lieu: offre.lieu,
      prix: `${offre.prix}€`,
      image: offre.offreimage[0]?.url || '/images/default.png',
      status: offre.status,
      archivedAt: offre.archivedAt
    })),
    total,
    page,
    totalPages: Math.ceil(total / LIMIT)
  }
})
