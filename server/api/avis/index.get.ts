/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const session = await getServerSession(event)

  // offreId est requis
  if (!query.offreId) {
    throw createError({ statusCode: 400, statusMessage: 'offreId est requis' })
  }

  const offreId = parseInt(query.offreId as string)

  // 1. Récupérer les avis avec le nom de l'auteur
  const avis = await prisma.avis.findMany({
    where: { offreId },
    include: {
      auteur: {
        select: { id: true, prenom: true, nom: true, avatar: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Vérifier si l'utilisateur connecté a la permission de poster
  let peutPoster = false
  let aDejaPoste = false

  if (session?.user?.id) {
    const userId = parseInt(session.user.id)

    const permission = await prisma.reviewPermission.findUnique({
      where: { userId_offreId: { userId, offreId } }
    })

    const avisExistant = await prisma.avis.findUnique({
      where: { auteurId_offreId: { auteurId: userId, offreId } }
    })

    peutPoster = !!permission
    aDejaPoste = !!avisExistant
  }

  // 3. Vérifier si l'utilisateur est admin/proprio pour la modération
  const peutModerer = session?.user?.role === 'ADMIN' || session?.user?.role === 'PROPRIETAIRE'

  return {
    avis,
    peutPoster,
    aDejaPoste,
    peutModerer
  }
})