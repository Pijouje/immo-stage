// seed.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Recherche du propriétaire...")
  
  // On cherche l'utilisateur ID 1 que tu as déjà créé (Maitre)
  const user = await prisma.user.findFirst({
    where: { id: 1 } 
  })

  if (!user) {
    console.error("❌ ERREUR : L'utilisateur ID 1 n'existe pas. Crée-le d'abord.")
    return
  }

  console.log(`✅ Propriétaire trouvé : ${user.nom}`)

  console.log("🚀 Création de l'annonce...")

  // Création de l'offre avec ses images
  const offre = await prisma.offre.create({
    data: {
      titre: "T2 de fou malade",
      lieu: "Amiens",
      prix: 500,
      description: "Super appart étudiant proche de tout.",
      caution: 1000,
      coloc: 2,
      tags: ["Fibre", "Proche Gare"], // On remplit le JSON ici
      proprietaireId: user.id,        // On fait le lien avec l'utilisateur
      images: {
        create: [
          { url: "/images/t2.png" },
          { url: "/images/t3.png" }
        ]
      }
    }
  })

  console.log("🎉 Offre créée avec succès ! ID:", offre.id)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Erreur lors du script :", e)
    await prisma.$disconnect()
    process.exit(1)
  })