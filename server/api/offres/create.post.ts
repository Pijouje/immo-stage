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

  // SECURITE : Validation de la longueur des champs texte
  if (body.titre.trim().length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Le titre ne doit pas dépasser 200 caractères' })
  }
  if (body.description.trim().length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'La description ne doit pas dépasser 5000 caractères' })
  }
  if (body.lieu.trim().length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Le lieu ne doit pas dépasser 200 caractères' })
  }

  // SECURITE : Validation des URLs d'images (empêcher javascript:, data:, etc.)
  let imagesValidees: { url: string }[] = []
  if (body.images && body.images.length > 0) {
    const urlsFiltrees = body.images
      .filter((url: string) => url && url.trim() !== '')
      .map((url: string) => url.trim())

    for (const url of urlsFiltrees) {
      const lower = url.toLowerCase()
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
        throw createError({ statusCode: 400, statusMessage: 'URL d\'image invalide' })
      }
    }
    imagesValidees = urlsFiltrees.map((url: string) => ({ url }))
  }
  if (imagesValidees.length === 0) {
    imagesValidees = [{ url: '/images/default.png' }]
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

        // Création des images validées
        images: {
          create: imagesValidees
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