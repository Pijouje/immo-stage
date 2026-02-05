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
  return offres.map(offre => ({
    id: offre.id,
    titre: offre.titre,
    lieu: offre.lieu,
    // On ajoute le symbole € et on gère le cas où il n'y a pas d'image
    prix: `${offre.prix}€`, 
    image: offre.images[0]?.url || '/images/default.png' 
  }))
})