import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. SÉCURITÉ : On récupère la session
  const session = await getServerSession(event)

  // CORRECTION ICI :
  // On vérifie que la session existe, que le user existe, et on force le type avec (as any)
  // pour accéder à .role qui n'est pas dans le type par défaut.
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Accès interdit réservé aux administrateurs.' })
  }

  // 2. Récupération des données
  const body = await readBody(event)

  // 3. Validation
  if (!body.titre || !body.prix || !body.lieu) {
    throw createError({ statusCode: 400, statusMessage: 'Champs obligatoires manquants' })
  }

  // 4. Insertion
  const nouvelleOffre = await prisma.offre.create({
    data: {
      titre: body.titre,
      description: body.desc,
      prix: Number(body.prix),
      lieu: body.lieu,
      images: {
        create: [
            // Si l'URL est vide, on met l'image par défaut
            { url: body.imageUrl || '/images/default.png' }
        ]
      },
      // CORRECTION ICI AUSSI :
      // On force le type avec (as any) pour récupérer l'ID
      proprietaireId: Number((session.user as any).id) 
    }
  })

  return { success: true, id: nouvelleOffre.id }
})