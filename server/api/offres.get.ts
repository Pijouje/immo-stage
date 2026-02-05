import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  const offres = await prisma.offre.findMany({
    orderBy: { createdAt: 'desc' }, // Les plus récentes en premier
    include: {
      images: {
        take: 1 // On prend juste la 1ère image pour la miniature
      }
    }
  })

  // On transforme un peu les données pour faciliter l'affichage côté Vue
  // Vérifie que la fin de ton fichier server/api/offres.get.ts ressemble bien à ça :
  return offres.map(offre => ({
    id: offre.id,
    titre: offre.titre,
    lieu: offre.lieu,
    prix: `${offre.prix}€`, 
    image: offre.images[0]?.url || '/images/default.png' // C'est cette ligne qui compte
  }))
})