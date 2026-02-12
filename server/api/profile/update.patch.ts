import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Vérifier que l'utilisateur est connecté
  const session = await getServerSession(event)
  
  if (!session || !session.user) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Vous devez être connecté' 
    })
  }

  const userId = parseInt((session.user as any).id)
  const body = await readBody(event)

  // 2. Validation des champs
  const allowedFields = ['nom', 'prenom', 'email']
  const updateData: any = {}

  // On filtre pour n'accepter que les champs autorisés
  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== '') {
      updateData[field] = body[field]
    }
  }

  // Vérification qu'il y a au moins un champ à modifier
  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aucune donnée à modifier'
    })
  }

  // 3. Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
  if (updateData.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: updateData.email,
        NOT: { id: userId } // Exclure l'utilisateur actuel
      }
    })

    if (emailExists) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cet email est déjà utilisé par un autre utilisateur'
      })
    }
  }

  // 4. Mettre à jour les données
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      avatar: true,
      role: true
    }
  })

  return {
    success: true,
    user: updatedUser,
    message: 'Profil mis à jour avec succès'
  }
})