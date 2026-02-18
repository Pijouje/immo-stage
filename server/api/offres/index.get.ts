import { prisma } from '../../utils/prisma'

const LIMIT = 9

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)

  const [offres, total] = await Promise.all([
    prisma.offre.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        images: { take: 1 }
      }
    }),
    prisma.offre.count()
  ])

  return {
    offres: offres.map(offre => ({
      id: offre.id,
      titre: offre.titre,
      lieu: offre.lieu,
      prix: `${offre.prix}€`,
      image: offre.images[0]?.url || '/images/default.png'
    })),
    total,
    page,
    totalPages: Math.ceil(total / LIMIT)
  }
})