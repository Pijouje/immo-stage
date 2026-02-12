import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'
import { compare, hash } from 'bcrypt'

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
  if (!body.currentPassword || !body.newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mot de passe actuel et nouveau mot de passe requis'
    })
  }

  // 3. Récupérer l'utilisateur avec son mot de passe
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Utilisateur non trouvé'
    })
  }

  // 4. Vérifier que le mot de passe actuel est correct
  const isPasswordValid = await compare(body.currentPassword, user.password)
  
  if (!isPasswordValid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mot de passe actuel incorrect'
    })
  }

  // 5. Valider le format du nouveau mot de passe
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{12,}$/
  
  if (!passwordRegex.test(body.newPassword)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nouveau mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole (@$!%*?&_)'
    })
  }

  // 6. Hasher le nouveau mot de passe
  const hashedPassword = await hash(body.newPassword, 10)

  // 7. Mettre à jour le mot de passe
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })

  return {
    success: true,
    message: 'Mot de passe modifié avec succès'
  }
})