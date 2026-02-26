<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 1. Interface des données
interface Offre {
  id: number;
  titre: string;
  titreEn: string | null;
  description: string;
  descriptionEn: string | null;
  prix: number;
  lieu: string;
  charges: number;
  caution: number;
  coloc: number;
  surface: number | null;
  chambresDisponibles: number | null;
  proprietaireId: number;
  tags: string[] | string;
  images: { url: string }[];
  avis: { note: number }[];
}

const { t, locale } = useI18n()
const route = useRoute()
const { data: session } = useAuth()

// 2. Fetch des données
const { data: offreRaw, error, refresh } = await useFetch<Offre>(`/api/offres/${route.params.id}`)

if (error.value || !offreRaw.value) {
  throw createError({ statusCode: 404, statusMessage: 'Annonce non trouvée', fatal: true })
}

// SEO : Meta tags dynamiques
useSeoMeta({
  title: `${offreRaw.value?.titre || 'Offre'} - Location Amiens | Agence Immo`,
  description: `${offreRaw.value?.titre} à ${offreRaw.value?.lieu}. ${offreRaw.value?.prix}€/mois. ${offreRaw.value?.description?.substring(0, 140) || 'Logement étudiant à Amiens.'}`,
  ogTitle: `${offreRaw.value?.titre} - ${offreRaw.value?.prix}€/mois`,
  ogDescription: `Location à ${offreRaw.value?.lieu}. ${offreRaw.value?.charges > 0 ? offreRaw.value.charges + '€ de charges' : 'Charges comprises'}.`,
  ogUrl: `https://ton-site-stage.com/offres/${route.params.id}`,
  ogType: 'website',
  ogImage: offreRaw.value?.images?.[0]?.url || '/images/default.png',
})

// SEO : Breadcrumb + RealEstateListing JSON-LD
useHead({
  script: computed(() => {
    const o = offreRaw.value
    if (!o) return []

    const noteMoyenne = o.avis && o.avis.length > 0
      ? o.avis.reduce((acc: number, curr: any) => acc + curr.note, 0) / o.avis.length
      : 0

    const schemas: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://ton-site-stage.com' },
          { '@type': 'ListItem', position: 2, name: 'Offres', item: 'https://ton-site-stage.com/offres' },
          { '@type': 'ListItem', position: 3, name: o.titre, item: `https://ton-site-stage.com/offres/${o.id}` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: o.titre,
        description: o.description,
        url: `https://ton-site-stage.com/offres/${o.id}`,
        datePosted: new Date().toISOString().split('T')[0],
        ...(o.images?.length > 0 && { image: o.images.map((img: any) => img.url) }),
        offers: {
          '@type': 'Offer',
          price: o.prix,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: o.lieu || 'Amiens',
          addressRegion: 'Hauts-de-France',
          addressCountry: 'FR',
        },
        ...(o.surface && {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: o.surface,
            unitCode: 'MTK',
          },
        }),
        numberOfRooms: o.coloc || undefined,
        ...(o.avis && o.avis.length > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(noteMoyenne.toFixed(1)),
            bestRating: 5,
            ratingCount: o.avis.length,
          },
        }),
        provider: {
          '@id': 'https://ton-site-stage.com/#organization',
        },
      },
    ]

    return schemas.map(s => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(s),
    }))
  }),
})

// --- ADAPTATION DES DONNÉES ---
const offre = computed(() => {
  const o = offreRaw.value
  if (!o) {
    return {
      id: 0, titre: 'Chargement...', lieu: '', prix: 0, desc: '', imgs: [],
      chargesRaw: 0, chargesText: '', rating: 0, avisCount: 0, tags: [] as string[],
      caution: 0, coloc: 0, surface: null as number | null,
      chambresDisponibles: null as number | null, proprietaireId: 0
    }
  }

  const noteMoyenne = o.avis && o.avis.length > 0
    ? o.avis.reduce((acc: number, curr: any) => acc + curr.note, 0) / o.avis.length
    : 0

  const isEn = locale.value === 'en'
  return {
    ...o,
    titre: isEn && o.titreEn ? o.titreEn : o.titre,
    desc: (isEn && o.descriptionEn ? o.descriptionEn : o.description) || '',
    imgs: o.images ? o.images.map((img: any) => img.url) : [],
    chargesRaw: o.charges || 0,
    chargesText: o.charges && o.charges > 0 ? `${o.charges}€ charges` : 'Charges comprises',
    rating: Number(noteMoyenne.toFixed(1)),
    avisCount: o.avis ? o.avis.length : 0,
    tags: Array.isArray(o.tags) ? o.tags : []
  }
})

// --- MAPPING EMOJIS + TRADUCTION ---
const tagEmojis: Record<string, string> = {
  'WiFi / Fibre': '📶', 'Cuisine équipée': '🍳', 'Lave-linge': '👕',
  'Sèche-linge': '💨', 'Lave-vaisselle': '🍽️', 'Parking': '🅿️',
  'Balcon': '🌿', 'Terrasse': '☀️', 'Ascenseur': '🛗',
  'Meublé': '🛋️', 'Cave': '📦', 'Gardien': '🔒',
  'Proche transports': '🚇', 'Proche commerces': '🛒'
}
const tagKeyMap: Record<string, string> = {
  'WiFi / Fibre': 'wifiFibre', 'Cuisine équipée': 'cuisineEquipee', 'Lave-linge': 'laveLinge',
  'Sèche-linge': 'secheLinge', 'Lave-vaisselle': 'laveVaisselle', 'Parking': 'parking',
  'Balcon': 'balcon', 'Terrasse': 'terrasse', 'Ascenseur': 'ascenseur',
  'Meublé': 'meuble', 'Cave': 'cave', 'Gardien': 'gardien',
  'Proche transports': 'procheTransports', 'Proche commerces': 'procheCommerces'
}
const getTagEmoji = (tag: string): string => tagEmojis[tag] || '✨'
const translateTag = (tag: string): string => {
  const key = tagKeyMap[tag]
  return key ? t(`offers.tags.${key}`) : tag
}

const equipementsDisponibles = [
  'WiFi / Fibre', 'Cuisine équipée', 'Lave-linge', 'Sèche-linge',
  'Lave-vaisselle', 'Parking', 'Balcon', 'Terrasse', 'Ascenseur',
  'Meublé', 'Cave', 'Gardien', 'Proche transports', 'Proche commerces'
]

// --- PERMISSIONS ---
const canEdit = computed(() => {
  if (!session.value?.user) return false
  const role = (session.value.user as any).role
  const userId = parseInt((session.value.user as any).id)
  return role === 'ADMIN' || userId === offre.value.proprietaireId
})

// =============================================
// MODE ÉDITION
// =============================================
const editMode = ref(false)
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref('')

// Formulaire d'édition (copie des données actuelles)
const editForm = ref({
  titre: '',
  titreEn: '',
  description: '',
  descriptionEn: '',
  lieu: '',
  prix: 0,
  charges: 0,
  caution: 0,
  coloc: 0,
  chambresDisponibles: 0,
  surface: 0 as number | null,
  tags: [] as string[],
  images: [] as string[]
})

// Active/Désactive le mode édition
const toggleEditMode = () => {
  if (!editMode.value) {
    // Copier les données actuelles dans le formulaire (toujours les valeurs brutes FR + EN)
    const o = offreRaw.value!
    editForm.value = {
      titre: o.titre,
      titreEn: o.titreEn || '',
      description: o.description,
      descriptionEn: o.descriptionEn || '',
      lieu: o.lieu,
      prix: o.prix,
      charges: o.charges || 0,
      caution: o.caution || 0,
      coloc: o.coloc,
      chambresDisponibles: o.chambresDisponibles ?? o.coloc,
      surface: o.surface,
      tags: Array.isArray(o.tags) ? [...o.tags] : [],
      images: o.images ? o.images.map((img: any) => img.url) : []
    }
    saveMessage.value = ''
    saveError.value = ''
  }
  editMode.value = !editMode.value
}

// Toggle un tag dans le formulaire
const toggleTag = (tag: string) => {
  const idx = editForm.value.tags.indexOf(tag)
  if (idx > -1) {
    editForm.value.tags.splice(idx, 1)
  } else {
    editForm.value.tags.push(tag)
  }
}

// --- GESTION IMAGES EN ÉDITION ---
const uploadingImage = ref(false)

const addImageFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  uploadingImage.value = true
  try {
    for (const file of Array.from(input.files)) {
      const formData = new FormData()
      formData.append('image', file)
      const result = await $fetch<{ url: string }>('/api/offres/upload', {
        method: 'POST',
        body: formData
      })
      editForm.value.images.push(result.url)
    }
  } catch (e) {
    saveError.value = t('errors.imageUploadError')
    console.error(e)
  } finally {
    uploadingImage.value = false
    input.value = ''
  }
}

const removeImage = (index: number) => {
  editForm.value.images.splice(index, 1)
}

// --- SAUVEGARDE ---
const saveAll = async () => {
  saving.value = true
  saveMessage.value = ''
  saveError.value = ''

  try {
    await $fetch(`/api/offres/${route.params.id}`, {
      method: 'PATCH',
      body: {
        titre: editForm.value.titre,
        titreEn: editForm.value.titreEn || null,
        description: editForm.value.description,
        descriptionEn: editForm.value.descriptionEn || null,
        lieu: editForm.value.lieu,
        prix: editForm.value.prix,
        charges: editForm.value.charges,
        caution: editForm.value.caution,
        coloc: editForm.value.coloc,
        chambresDisponibles: editForm.value.chambresDisponibles,
        surface: editForm.value.surface,
        tags: editForm.value.tags,
        images: editForm.value.images
      }
    })
    saveMessage.value = t('offers.savedSuccess')
    await refresh()
    // Rester en mode édition pour continuer à modifier si besoin
    // Mettre à jour le formulaire avec les nouvelles données
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } catch (e: any) {
    saveError.value = e.data?.statusMessage || t('errors.saveError')
    console.error(e)
  } finally {
    saving.value = false
  }
}

// --- LIGHTBOX ---
const isGalleryOpen = ref(false)
const currentImageIndex = ref(0)

const openGallery = (index: number) => {
  if (editMode.value) return // Pas de lightbox en mode édition
  if (!offre.value.imgs || offre.value.imgs.length === 0) return
  currentImageIndex.value = index
  isGalleryOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeGallery = () => {
  isGalleryOpen.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (currentImageIndex.value < offre.value.imgs.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = offre.value.imgs.length - 1
  }
}
</script>

<template>
  <article class="detail-page" itemscope itemtype="https://schema.org/Apartment">
    <div class="container">

      <!-- BOUTON TOGGLE ÉDITION -->
      <div v-if="canEdit" class="edit-toolbar">
        <button @click="toggleEditMode" class="btn-toggle-edit" :class="{ active: editMode }">
          <span v-if="editMode">{{ $t('offers.visitorView') }}</span>
          <span v-else>{{ $t('offers.editMode') }}</span>
        </button>

        <template v-if="editMode">
          <button @click="saveAll" :disabled="saving" class="btn-save-all">
            {{ saving ? $t('offers.saving') : $t('offers.saveAll') }}
          </button>
        </template>

        <span v-if="saveMessage" class="save-msg success">{{ saveMessage }}</span>
        <span v-if="saveError" class="save-msg error">{{ saveError }}</span>
      </div>

      <!-- ============ GALERIE ============ -->
      <div v-if="!editMode" class="gallery-grid">
        <div class="main-photo" @click="openGallery(0)" :style="{ backgroundImage: `url(${offre.imgs[0]})` }">
          <button class="btn-see-photos">{{ $t('offers.seePhotos', { n: offre.imgs.length }) }}</button>
          <div class="photo-counter">1/{{ offre.imgs.length }}</div>
        </div>
        <div class="sub-photos">
          <div class="sub-photo" @click="openGallery(1)" :style="{ backgroundImage: `url(${offre.imgs[1] || offre.imgs[0]})` }"></div>
          <div class="sub-photo" @click="openGallery(2)" :style="{ backgroundImage: `url(${offre.imgs[2] || offre.imgs[0]})` }">
            <div class="more-overlay" v-if="offre.imgs.length > 3" @click.stop="openGallery(3)">
              +{{ offre.imgs.length - 3 }}
            </div>
          </div>
        </div>
      </div>

      <!-- GALERIE EN MODE ÉDITION -->
      <div v-else class="edit-images-section">
        <h3>{{ $t('offers.edit.images') }}</h3>
        <div class="edit-images-grid">
          <div v-for="(img, index) in editForm.images" :key="index" class="edit-image-card">
            <img :src="img" alt="Image offre" class="edit-image-thumb">
            <button @click="removeImage(index)" class="btn-remove-img" type="button">✕</button>
          </div>
          <!-- Bouton ajouter -->
          <label class="add-image-card">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="addImageFile">
            <span v-if="uploadingImage" class="spinner"></span>
            <span v-else class="add-icon">+</span>
            <span class="add-text">{{ $t('offers.edit.add') }}</span>
          </label>
        </div>
      </div>

      <!-- ============ CONTENU ============ -->
      <div class="content-split">

        <!-- COLONNE GAUCHE -->
        <div class="left-content">

          <!-- MODE VISITEUR -->
          <template v-if="!editMode">
            <div class="header-line">
              <h1>{{ offre.titre }}</h1>
              <div class="rating-block">
                <Etoile :note="offre.rating" />
                <NuxtLink :to="`/avis?offreId=${offre.id}`" class="avis-link">
                  {{ $t('reviews.reviewsCount', { n: offre.avisCount }) }}
                </NuxtLink>
              </div>
            </div>
            <p class="location">📍 {{ offre.lieu }}</p>

            <div class="tags">
              <span v-for="tag in offre.tags" :key="tag" class="tag">{{ getTagEmoji(tag) }} {{ translateTag(tag) }}</span>
            </div>

            <div class="separator"></div>

            <h2>{{ $t('offers.about') }}</h2>
            <p class="description">{{ offre.desc }}</p>
          </template>

          <!-- MODE ÉDITION -->
          <template v-else>
            <div class="edit-group">
              <label class="edit-label">{{ $t('offers.edit.titleLabel') }}</label>
              <input v-model="editForm.titre" type="text" class="edit-input" :placeholder="$t('offers.edit.titlePlaceholder')">
            </div>

            <div class="edit-group">
              <label class="edit-label">{{ $t('offers.edit.titleEnLabel') }}</label>
              <input v-model="editForm.titreEn" type="text" class="edit-input" :placeholder="$t('offers.edit.titleEnPlaceholder')">
            </div>

            <div class="edit-group">
              <label class="edit-label">{{ $t('offers.edit.locationLabel') }}</label>
              <input v-model="editForm.lieu" type="text" class="edit-input" :placeholder="$t('offers.edit.locationPlaceholder')">
            </div>

            <div class="edit-group">
              <label class="edit-label">{{ $t('offers.edit.amenitiesLabel') }}</label>
              <div class="edit-tags-grid">
                <button
                  v-for="equip in equipementsDisponibles"
                  :key="equip"
                  @click="toggleTag(equip)"
                  class="edit-tag-btn"
                  :class="{ selected: editForm.tags.includes(equip) }"
                  type="button"
                >
                  {{ getTagEmoji(equip) }} {{ translateTag(equip) }}
                </button>
              </div>
            </div>

            <div class="separator"></div>

            <div class="edit-group">
              <label class="edit-label">{{ $t('offers.edit.descriptionLabel') }}</label>
              <textarea v-model="editForm.description" class="edit-textarea" rows="8" :placeholder="$t('offers.edit.descriptionPlaceholder')"></textarea>
              <small class="edit-hint">{{ $t('offers.edit.chars', { n: editForm.description.length }) }}</small>
            </div>

            <div class="edit-group">
              <label class="edit-label">{{ $t('offers.edit.descriptionEnLabel') }}</label>
              <textarea v-model="editForm.descriptionEn" class="edit-textarea" rows="8" :placeholder="$t('offers.edit.descriptionEnPlaceholder')"></textarea>
              <small class="edit-hint">{{ $t('offers.edit.chars', { n: editForm.descriptionEn.length }) }}</small>
            </div>
          </template>

        </div>

        <!-- COLONNE DROITE (Carte prix) -->
        <div class="right-sidebar">
          <div class="price-card static-card">

            <!-- MODE VISITEUR -->
            <template v-if="!editMode">
              <div class="card-header">
                <span class="price">{{ offre.prix }}€</span>
                <span class="sub-price">{{ $t('offers.chargesIncluded') }}</span>
              </div>
              <div class="divider"></div>
              <div class="details-list">
                <div class="row">
                  <span>{{ $t('offers.deposit') }}</span>
                  <strong>{{ offre.caution || 1000 }}€</strong>
                </div>
                <div class="row">
                  <span>{{ $t('offers.roommates') }}</span>
                  <strong>{{ offre.coloc || 3 }} {{ $t('offers.people') }}</strong>
                </div>
                <div class="row">
                  <span>{{ $t('offers.availableRooms') }}</span>
                  <strong :class="{ 'text-red': (offre.chambresDisponibles ?? offre.coloc) === 0 }">
                    {{ offre.chambresDisponibles ?? offre.coloc }} / {{ offre.coloc || 3 }}
                  </strong>
                </div>
              </div>
              <OffreBouton to="/contact">
                {{ $t('offers.contactOwner') }}
              </OffreBouton>
            </template>

            <!-- MODE ÉDITION -->
            <template v-else>
              <div class="edit-card-group">
                <label class="edit-label">{{ $t('offers.edit.rentLabel') }}</label>
                <input v-model.number="editForm.prix" type="number" min="0" class="edit-input-sm">
              </div>
              <div class="edit-card-group">
                <label class="edit-label">{{ $t('offers.edit.chargesLabel') }}</label>
                <input v-model.number="editForm.charges" type="number" min="0" class="edit-input-sm">
              </div>
              <div class="divider"></div>
              <div class="edit-card-group">
                <label class="edit-label">{{ $t('offers.edit.depositLabel') }}</label>
                <input v-model.number="editForm.caution" type="number" min="0" class="edit-input-sm">
              </div>
              <div class="edit-card-group">
                <label class="edit-label">{{ $t('offers.edit.surfaceLabel') }}</label>
                <input v-model.number="editForm.surface" type="number" min="0" class="edit-input-sm">
              </div>
              <div class="divider"></div>
              <div class="edit-card-group">
                <label class="edit-label">{{ $t('offers.edit.roommatesLabel') }}</label>
                <input v-model.number="editForm.coloc" type="number" min="0" class="edit-input-sm">
              </div>
              <div class="edit-card-group">
                <label class="edit-label">{{ $t('offers.edit.availableRoomsLabel') }}</label>
                <input v-model.number="editForm.chambresDisponibles" type="number" min="0" class="edit-input-sm">
              </div>
            </template>

          </div>
        </div>
      </div>
    </div>

    <!-- LIGHTBOX -->
    <Transition name="fade">
      <div v-if="isGalleryOpen" class="lightbox" @click="closeGallery">
        <button class="close-btn" @click.stop="closeGallery">✕</button>
        <button class="nav-btn prev" @click.stop="prevImage">❮</button>
        <button class="nav-btn next" @click.stop="nextImage">❯</button>
        <div class="lightbox-content" @click.stop>
          <img :src="offre.imgs[currentImageIndex]" class="lightbox-img" :alt="`${offre.titre} - Photo ${currentImageIndex + 1}`">
        </div>
        <div class="lightbox-footer">
          {{ currentImageIndex + 1 }} / {{ offre.imgs.length }} : {{ offre.titre }}
        </div>
      </div>
    </Transition>

  </article>
</template>

<style scoped>
/* --- STRUCTURE --- */
.detail-page {
  background-color: #f4f7f6;
  background-image: url('/images/bg.png');
  background-size: cover;
  min-height: 100vh;
  padding: 90px 0 60px 0;
  font-family: 'Segoe UI', sans-serif;
  color: #01111d;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* =============================================
   BARRE D'ÉDITION (Toggle + Save)
   ============================================= */
.edit-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn-toggle-edit {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #e2e8f0;
  background: white;
  color: #334155;
}

.btn-toggle-edit:hover { border-color: #2563eb; color: #2563eb; }
.btn-toggle-edit.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-save-all {
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  background: #16a34a;
  color: white;
  transition: all 0.2s;
}
.btn-save-all:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
.btn-save-all:disabled { opacity: 0.6; cursor: not-allowed; }

.save-msg {
  font-weight: 700;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 8px;
}
.save-msg.success { background: #dcfce7; color: #166534; }
.save-msg.error { background: #fee2e2; color: #991b1b; }

/* =============================================
   GALERIE (Mode visiteur)
   ============================================= */
.gallery-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  height: 450px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 40px;
  cursor: pointer;
}

.main-photo {
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform 0.3s;
}

.sub-photos {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sub-photo {
  flex: 1;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: opacity 0.3s;
}

.main-photo:hover, .sub-photo:hover { opacity: 0.9; }

.btn-see-photos {
  position: absolute; bottom: 20px; left: 20px;
  background: white; border: none; padding: 8px 16px; border-radius: 8px;
  font-weight: 700; font-size: 0.9rem; color: #01111d; cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.photo-counter {
  position: absolute; bottom: 20px; right: 20px;
  background: rgba(0,0,0,0.6); color: white; padding: 5px 12px;
  border-radius: 20px; font-size: 0.8rem; font-weight: 600;
}
.more-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 700;
}

/* =============================================
   GALERIE EN MODE ÉDITION
   ============================================= */
.edit-images-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 30px;
  border: 2px dashed #cbd5e1;
}

.edit-images-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #334155;
}

.edit-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.edit-image-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.edit-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-img {
  position: absolute; top: 6px; right: 6px;
  background: rgba(239, 68, 68, 0.9); color: white;
  border: none; border-radius: 50%;
  width: 28px; height: 28px;
  cursor: pointer; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.edit-image-card:hover .btn-remove-img { opacity: 1; }

.add-image-card {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafbfc;
}
.add-image-card:hover { border-color: #2563eb; background: #f0f9ff; }

.add-icon { font-size: 2rem; color: #94a3b8; }
.add-text { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }

.spinner {
  width: 24px; height: 24px;
  border: 3px solid #2563eb;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* =============================================
   CONTENU SPLIT
   ============================================= */
.content-split {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 50px;
  align-items: start;
}

/* --- MODE VISITEUR (Texte) --- */
.header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
h1 { margin: 0; font-size: 2rem; font-weight: 800; }

.rating-block { display: flex; align-items: center; gap: 8px; }
.avis-link {
  color: #2563eb; text-decoration: underline; font-weight: 600;
  font-size: 0.9rem; padding-top: 3px;
}

.location { color: #64748b; font-size: 1.1rem; margin: 10px 0 20px 0; font-weight: 500; }
.tags { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px; }
.tag { background: white; padding: 8px 16px; border-radius: 30px; font-weight: 600; font-size: 0.85rem; border: 1px solid #e2e8f0; }
.separator { height: 1px; background: #cbd5e1; margin: 30px 0; width: 100%; }
.description { line-height: 1.6; color: #334155; margin-bottom: 30px; white-space: pre-wrap; }

/* =============================================
   MODE ÉDITION (Formulaire inline)
   ============================================= */
.edit-group {
  margin-bottom: 20px;
}

.edit-label {
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.edit-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;
}
.edit-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.edit-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.6;
  color: #334155;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;
}
.edit-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.edit-hint { display: block; margin-top: 5px; font-size: 0.85rem; color: #94a3b8; }

/* Tags en édition */
.edit-tags-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-tag-btn {
  padding: 8px 14px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #e2e8f0;
  background: white;
  color: #334155;
}
.edit-tag-btn:hover { border-color: #2563eb; background: #f0f9ff; }
.edit-tag-btn.selected {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* =============================================
   CARTE PRIX (Sidebar)
   ============================================= */
.right-sidebar { height: 100%; }

.static-card {
  position: static;
  top: 110px;
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.price { font-size: 2.5rem; font-weight: 800; color: #2563eb; display: block; }
.sub-price { color: #64748b; font-size: 0.9rem; font-weight: 600; }
.divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
.details-list .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.95rem; color: #334155; }
.text-red { color: #ef4444; }

/* Carte en mode édition */
.edit-card-group {
  margin-bottom: 14px;
}

.edit-input-sm {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;
}
.edit-input-sm:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* =============================================
   LIGHTBOX
   ============================================= */
.lightbox {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.95); z-index: 9999;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.lightbox-content {
  position: relative; width: 90%; height: 80%;
  display: flex; align-items: center; justify-content: center;
}
.lightbox-img { max-width: 100%; max-height: 100%; border-radius: 5px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }

.nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: white; font-size: 3rem;
  cursor: pointer; padding: 20px; opacity: 0.7; z-index: 10000;
}
.nav-btn.prev { left: 20px; }
.nav-btn.next { right: 20px; }
.nav-btn:hover { opacity: 1; }
.close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; z-index: 10001; }
.lightbox-footer { margin-top: 20px; color: white; font-size: 1.1rem; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* =============================================
   MOBILE
   ============================================= */
@media (max-width: 900px) {
  .content-split { grid-template-columns: 1fr; }
  .gallery-grid { height: 300px; grid-template-columns: 1fr; }
  .sub-photos { display: none; }
  .static-card { position: static; margin-top: 30px; }
  .nav-btn { font-size: 2rem; padding: 10px; }
  .nav-btn.prev { left: 5px; }
  .nav-btn.next { right: 5px; }
  .edit-toolbar { flex-direction: column; align-items: stretch; }
  .edit-images-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
}
</style>
