<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const offreId = Number(route.params.id)

definePageMeta({
  pageTransition: { name: 'hero-flow', mode: 'out-in' },
  layoutTransition: { name: 'hero-flow', mode: 'out-in' }
})

// --- DATA ---
const database = [
  { 
    id: 1, 
    titre: 'T2 Meublé', 
    lieu: 'Quartier Saint-Leu, Amiens', 
    prix: 500, 
    charges: 'charges comprises',
    caution: 1000,
    coloc: 3,
    rating: 4.8,
    avis: 3,
    desc: "Superbe T2 situé en plein cœur de Saint-Leu...",
    imgs: [
      '/images/t2.png',
      '/images/t3.png',
      '/images/t4.png',
      '/images/t2.png',
    ], 
    tags: ['Fibre optique', 'Machine à laver', 'Cuisine équipée', 'Bus 50m']
  },
  { id: 2, titre: 'T3 Meublé', lieu: 'Centre Ville', prix: 650, imgs: ['/images/t3.png'], tags: [] },
  { id: 3, titre: 'T4 Meublé', lieu: 'Gare', prix: 800, imgs: ['/images/t4.png'], tags: [] },
]

const offreTrouvee = database.find(o => o.id === offreId)

if (!offreTrouvee) {
  throw createError({ statusCode: 404, statusMessage: 'Annonce non trouvée', fatal: true })
}

const offre = offreTrouvee

useHead({
  title: `${offre.titre} - Location Amiens`
})

// --- LOGIQUE LIGHTBOX ---
const isGalleryOpen = ref(false)
const currentImageIndex = ref(0)

const openGallery = (index: number) => {
  currentImageIndex.value = index
  isGalleryOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeGallery = () => {
  isGalleryOpen.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (currentImageIndex.value < offre.imgs.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = offre.imgs.length - 1
  }
}
</script>

<template>
  <div class="detail-page">
    <div class="container">
      
      <div class="gallery-grid">
        
        <div class="main-photo" @click="openGallery(0)" :style="{ backgroundImage: `url(${offre.imgs[0]})` }">
          <button class="btn-see-photos">📷 Voir les {{ offre.imgs.length }} photos</button>
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

      <div class="content-split">

        <div class="left-content">
          
          <div class="header-line">
            <h1>{{ offre.titre }}</h1>
            <div class="stars">⭐⭐⭐⭐⭐ <NuxtLink to="/avis">{{ offre.avis }} avis</NuxtLink></div>
          </div>
          <p class="location">📍 {{ offre.lieu }}</p>

          <div class="tags">
              <span v-for="tag in offre.tags" :key="tag" class="tag">⚡ {{ tag }}</span>
          </div>

          <div class="separator"></div>

          <h2>À propos de ce logement</h2>
          <p class="description">{{ offre.desc }}</p>

          <div class="equipments">
            <h2>Equipement inclus</h2>
              <div class="equip-list">
                <div class="equip">💻 Espace travail</div>
                <div class="equip">🍳 Cuisine équipée</div>
                <div class="equip">🚿 Salle de bain</div>
                <div class="equip">🗄️ Rangements</div>
              </div>
          </div>
        </div>

        <div class="right-sidebar">
          <div class="price-card static-card">
            <div class="card-header">
              <span class="price">{{ offre.prix }}€</span>
              <span class="sub-price">/ mois charges comprises</span>
            </div>
            
            <div class="divider"></div>

            <div class="details-list">
              <div class="row">
                <span>Caution :</span>
                <strong>{{ offre.caution || 1000 }}€</strong>
              </div>
              <div class="row">
                <span>Colocation :</span>
                <strong>{{ offre.coloc || 3 }} personnes</strong>
              </div>
            </div>

            <button class="cta-btn">Contacter le propriétaire</button>
          </div>
        </div>

      </div>
    </div>

    <Transition name="fade">
      <div v-if="isGalleryOpen" class="lightbox" @click="closeGallery">
        <button class="close-btn" @click.stop="closeGallery">✕</button>
        <button class="nav-btn prev" @click.stop="prevImage">❮</button>
        <button class="nav-btn next" @click.stop="nextImage">❯</button>
        
        <div class="lightbox-content" @click.stop>
          <img :src="offre.imgs[currentImageIndex]" class="lightbox-img" alt="Vue agrandie">
        </div>

        <div class="lightbox-footer">
          {{ currentImageIndex + 1 }} / {{ offre.imgs.length }} : {{ offre.titre }}
        </div>
      </div>
    </Transition>

  </div>
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

/* --- GALERIE (Au dessus du reste) --- */
.gallery-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  height: 450px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 40px; /* Espace avant le texte */
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

/* BOUTONS PHOTO */
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

/* --- CONTENU SPLIT (Texte vs Static Card) --- */
.content-split {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 2/3 texte, 1/3 carte */
  gap: 50px; /* Espace entre texte et carte */
  align-items: start; /* CRUCIAL pour le static */
}

/* --- TEXTE --- */
.header-line { display: flex; justify-content: space-between; align-items: center; }
h1 { margin: 0; font-size: 2rem; font-weight: 800; }
.stars { color: #f59e0b; font-weight: 600; }
.stars a { color: #2563eb; text-decoration: underline; margin-left: 5px; }
.location { color: #64748b; font-size: 1.1rem; margin: 10px 0 20px 0; font-weight: 500; }
.tags { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px; }
.tag { background: white; padding: 8px 16px; border-radius: 30px; font-weight: 600; font-size: 0.85rem; border: 1px solid #e2e8f0; }
.separator { height: 1px; background: #cbd5e1; margin: 30px 0; width: 100%; }
.description { line-height: 1.6; color: #334155; margin-bottom: 30px; }
.equip-list { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.equip { background: rgba(255,255,255,0.7); padding: 15px; border-radius: 10px; font-weight: 600; }

/* --- RIGHT SIDEBAR (STATIC) --- */
.right-sidebar {
  /* Le conteneur doit avoir la hauteur naturelle du contenu */
  height: 100%; 
}

.static-card {
  position: static;
  top: 110px; /* Décale par rapport au haut de l'écran */
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.price { font-size: 2.5rem; font-weight: 800; color: #2563eb; display: block; }
.sub-price { color: #64748b; font-size: 0.9rem; font-weight: 600; }
.divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
.details-list .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; color: #334155; }
.cta-btn { width: 100%; padding: 15px; background: white; border: 2px solid #2563eb; color: #2563eb; font-weight: 700; border-radius: 10px; cursor: pointer; margin-top: 20px; transition: all 0.2s; }
.cta-btn:hover { background: #2563eb; color: white; }

/* --- LIGHTBOX (Fixe) --- */
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

/* BOUTONS NAV FIXES */
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

/* --- MOBILE --- */
@media (max-width: 900px) {
  .content-split { grid-template-columns: 1fr; }
  .gallery-grid { height: 300px; grid-template-columns: 1fr; }
  .sub-photos { display: none; }
  .static-card { position: static; margin-top: 30px; }
  .nav-btn { font-size: 2rem; padding: 10px; }
  .nav-btn.prev { left: 5px; }
  .nav-btn.next { right: 5px; }
}
</style>