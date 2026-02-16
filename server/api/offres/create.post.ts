/// <reference path="../../../next-auth.d.ts" />

import { getServerSession } from '#auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. SÉCURITÉ : Vérifier que l'utilisateur est connecté
  const session = await getServerSession(event)

  if (!session || !session.user) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Vous devez être connecté pour créer une offre' 
    })
  }

  // 2. SÉCURITÉ : Vérifier que l'utilisateur a le bon rôle
  const userRole = session.user.role
  const allowedRoles = ['ADMIN', 'PROPRIETAIRE']

  if (!allowedRoles.includes(userRole)) {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'Seuls les administrateurs et propriétaires peuvent créer des offres' 
    })
  }

  // 3. Récupération des données du formulaire
  const body = await readBody(event)

  // 4. Validation des champs obligatoires
  const requiredFields = ['titre', 'description', 'prix', 'lieu']
  const missingFields = requiredFields.filter(field => !body[field])

  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Champs obligatoires manquants : ${missingFields.join(', ')}`
    })
  }

  // 5. Validation du prix
  const prix = Number(body.prix)
  if (isNaN(prix) || prix <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le prix doit être un nombre positif'
    })
  }

  // 6. Préparation des tags (équipements)
  let tags: string[] = []
  if (body.tags && Array.isArray(body.tags)) {
    tags = body.tags.filter((tag: string) => tag && tag.trim() !== '')
  }

  try {
    // 7. Création de l'offre dans la base de données
    const nouvelleOffre = await prisma.offre.create({
      data: {
        titre: body.titre.trim(),
        description: body.description.trim(),
        prix: prix,
        lieu: body.lieu.trim(),
        charges: body.charges ? Number(body.charges) : 0,
        caution: body.caution ? Number(body.caution) : null,
        coloc: body.coloc ? Number(body.coloc) : 0,
        surface: body.surface ? Number(body.surface) : null,
        tags: tags.length > 0 ? tags : undefined,
        
        // Relation avec l'utilisateur connecté
        proprietaireId: parseInt(session.user.id),
        
        // Création des images (si fournies)
        images: {
          create: (body.images && body.images.length > 0) 
            ? body.images
                .filter((url: string) => url && url.trim() !== '')
                .map((url: string) => ({ url: url.trim() }))
            : [{ url: '/images/default.png' }] // Image par défaut si aucune image
        }
      },
      // Inclure les images dans la réponse
      include: {
        images: true,
        proprietaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    })

    // 8. Retourner l'offre créée
    return {
      success: true,
      message: 'Offre créée avec succès',
      offre: nouvelleOffre
    }

  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création de l\'offre. Veuillez réessayer.'
    })
  }
})