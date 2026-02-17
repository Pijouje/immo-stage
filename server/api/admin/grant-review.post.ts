/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Vérifier authentification
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const granterId = parseInt(session.user.id)
  const granterRole = session.user.role

  // 2. Vérifier que l'utilisateur est ADMIN ou PROPRIETAIRE
  if (granterRole !== 'ADMIN' && granterRole !== 'PROPRIETAIRE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seuls les administrateurs et propriétaires peuvent accorder des permissions'
    })
  }

  const body = await readBody(event)

  if (!body.userId || !body.offreId) {
    throw createError({ statusCode: 400, statusMessage: 'userId et offreId sont requis' })
  }

  const targetUserId = parseInt(body.userId)
  const offreId = parseInt(body.offreId)

  // 3. Si PROPRIETAIRE, vérifier qu'il est bien le propriétaire de CETTE offre
  if (granterRole === 'PROPRIETAIRE') {
    const offre = await prisma.offre.findUnique({ where: { id: offreId } })
    if (!offre || offre.proprietaireId !== granterId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Vous ne pouvez accorder des permissions que pour vos propres offres'
      })
    }
  }

  // 4. Vérifier que l'utilisateur cible existe
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
  }

  // 5. Vérifier que l'offre existe
  const offre = await prisma.offre.findUnique({ where: { id: offreId } })
  if (!offre) {
    throw createError({ statusCode: 404, statusMessage: 'Offre non trouvée' })
  }

  // 6. Créer la permission (upsert = créer ou ignorer si existe déjà)
  const permission = await prisma.reviewPermission.upsert({
    where: { userId_offreId: { userId: targetUserId, offreId } },
    update: {}, // Si existe, ne rien changer
    create: {
      userId: targetUserId,
      offreId,
      grantedBy: granterId
    }
  })

  return {
    success: true,
    message: `Permission accordée à ${targetUser.prenom} ${targetUser.nom} pour l'offre "${offre.titre}"`,
    permission
  }
})