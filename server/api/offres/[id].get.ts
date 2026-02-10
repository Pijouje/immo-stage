import { prisma } from '../../utils/prisma'


export default defineEventHandler(async (event) => {
  // On récupère l'ID depuis l'URL (ex: /api/offres/1)
  const id = Number(getRouterParam(event, 'id'))

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const offre = await prisma.offre.findUnique({
    where: { id },
    include: {
      images: true, // Toutes les images pour la galerie
      avis: true,   // Pour calculer la note et le nombre d'avis
      proprietaire: { // Optionnel: si tu veux afficher le nom du proprio plus tard
        select: { nom: true, prenom: true, email: true }
      }
    }
  })

  if (!offre) {
    throw createError({ statusCode: 404, statusMessage: 'Annonce non trouvée' })
  }

  return offre
})