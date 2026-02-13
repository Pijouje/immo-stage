<script setup lang="ts">
// --- META ---
definePageMeta({
  layout: 'home', // Utilise le layout home avec navbar transparente
  pageTransition: {
    name: 'hero-flow',
    mode: 'out-in'
  }
})

useHead({
  title: 'Accueil - NOM DU SITE'
})
</script>

<template>
  <!-- La vidéo et l'overlay sont maintenant dans le contenu de la page -->
  <div class="home-hero">
    
    <!-- Vidéo de fond en plein écran -->
    <div class="video-bg">
      <video autoplay loop muted playsinline>
        <source src="/videos/video_presentation_salon.mp4" type="video/mp4">
      </video>
      <div class="overlay"></div>
    </div>

    <!-- Contenu Hero par-dessus la vidéo -->
    <div class="hero-content">
      <h1 class="main-title">
        LOUEZ VOTRE FUTUR<br>
        CHEZ-VOUS EN<br>
        TOUTE CONFIANCE.
      </h1>

      <NuxtLink to="/offres" class="cta-button">
        VOIR LES<br>OFFRES
      </NuxtLink>
    </div>

  </div>
</template>

<style scoped>
/* Container principal de la home hero */
.home-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Vidéo de fond en plein écran */
.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.video-bg video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Overlay sombre pour améliorer la lisibilité du texte */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}

/* Contenu Hero (titre + bouton) */
.hero-content {
  position: relative;
  z-index: 5;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 5%;
}

.main-title {
  color: white;
  font-size: 3.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
  margin-bottom: 100px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Ombre pour meilleure lisibilité */
}

.cta-button {
  align-self: center;
  margin-left: -5%;
  background-color: #f2f2f2;
  color: #01111d;
  text-decoration: none;
  width: 180px;
  padding: 18px 0;
  border-radius: 50px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cta-button:hover {
  background-color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* RESPONSIVE MOBILE */
@media (max-width: 768px) {
  .hero-content {
    padding-left: 0;
    align-items: center;
    text-align: center;
  }

  .main-title {
    font-size: 2rem;
    margin-bottom: 40px;
    padding: 0 20px;
  }

  .cta-button {
    margin-left: 0;
    margin-top: 60px;
  }
}
</style>