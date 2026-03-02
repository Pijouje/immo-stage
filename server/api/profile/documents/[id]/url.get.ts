import { getServerSession } from '#auth'
import { prisma } from '../../../../utils/prisma'
import { getSignedUrlFromR2 } from '../../../../utils/r2'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) throw createError({ statusCode: 401, message: 'Non connecté' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'ID manquant' })

  const document = await prisma.document.findUnique({ where: { id } })
  if (!document) throw createError({ statusCode: 404, message: 'Document introuvable' })
  if (document.userId !== parseInt(session.user.id)) throw createError({ statusCode: 403, message: 'Accès refusé' })

  const signedUrl = await getSignedUrlFromR2(document.url)
  return { url: signedUrl }
})