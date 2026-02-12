import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Vérifier que l'utilisateur est connecté
  const session = await getServerSession(event)
  
  if (!session || !session.user) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Vous devez être connecté pour accéder à votre profil' 
    })
  }

  // 2. Récupérer l'ID de l'utilisateur depuis la session
  const userId = parseInt((session.user as any).id)

  // 3. Récupérer les données complètes de l'utilisateur depuis la base
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      // On inclut aussi les documents pour les afficher dans le profil
      documents: {
        select: {
          id: true,
          nom: true,
          type: true,
          status: true,
          url: true
        },
        orderBy: {
          id: 'desc'
        }
      }
    }
  })

  if (!user) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: 'Utilisateur non trouvé' 
    })
  }

  return user
})