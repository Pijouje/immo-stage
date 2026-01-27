<script setup>
// 1. On désactive le layout standard pour cette page uniquement
// car on veut un menu transparent sur la vidéo, pas la barre blanche.
definePageMeta({
  layout: false
})

useHead({
  title: 'Accueil - Immobilier de Luxe'
})
</script>

<template>
  <div class="home-container">

    <div class="video-bg">
      <video autoplay loop muted playsinline>
        <source src="/videos/accueil-background.mp4" type="video/mp4">
      </video>
      <div class="overlay"></div>
    </div>

    <header class="home-header">
      <div class="logo">
        <span class="icon-home">🏠</span>
        <div class="logo-text">
          <span>NOM DU</span>
          <span>SITE (AMIENS)</span>
        </div>
      </div>

      <nav class="home-nav">
        <NuxtLink to="/contact">CONTACT</NuxtLink>
        <NuxtLink to="/inscription">S'INSCRIRE</NuxtLink>
        <NuxtLink to="/connexion">SE CONNECTER</NuxtLink>
      </nav>
    </header>

    <main class="hero-content">
      <h1 class="main-title">
        LOUEZ VOTRE FUTUR<br>
        CHEZ-VOUS EN<br>
        TOUTE CONFIANCE.
      </h1>

      <NuxtLink to="/offres" class="cta-button">
        VOIR LES<br>OFFRES
      </NuxtLink>
    </main>

  </div>
</template>

<style scoped>
/* --- 1. CONFIGURATION DE LA PAGE --- */
.home-container {
  position: relative;
  width: 100%;
  height: 100vh; /* Prend 100% de la hauteur de l'écran */
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
  color: white;
}

/* --- 2. VIDÉO DE FOND --- */
.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Tout au fond */
  background-color: #333; /* Couleur de secours si pas de vidéo */
}

.video-bg video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Remplit l'écran sans déformer */
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2); /* Filtre noir transparent */
  z-index: 1;
}

/* --- 3. HEADER TRANSPARENT --- */
.home-header {
  position: absolute; /* Flotte au-dessus de la vidéo */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10; /* Devant tout le monde */
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Aligné en haut */
  padding: 40px 60px; /* Marges comme sur ton image */
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;
}

.icon-home {
  font-size: 1.8rem;
  background: white;
  color: black;
  width: 40px;
  height: 40px;
  border-radius: 50%; /* Rond parfait */
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  line-height: 1.2;
  letter-spacing: 1px;
}

.home-nav {
  display: flex;
  gap: 40px;
}

.home-nav a {
  color: white;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* --- 4. TEXTE ET BOUTON --- */
.hero-content {
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centre verticalement */
  padding-left: 60px; /* Aligné avec le logo */
}

.main-title {
  font-size: 3rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.3;
  margin-bottom: 50px;
}

.cta-button {
  background-color: #e0e0e0; /* Gris très clair/Blanc cassé */
  color: black;
  text-decoration: none;
  width: 160px;
  padding: 15px 0;
  border-radius: 30px; /* Forme de pilule */
  text-align: center;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  line-height: 1.2;
  display: inline-block;
  transition: transform 0.2s;
}

.cta-button:hover {
  background-color: white;
  transform: scale(1.05);
}

/* --- RESPONSIVE (MOBILE) --- */
@media (max-width: 768px) {
  .home-header { padding: 20px; flex-direction: column; align-items: center; gap: 20px; }
  .logo-text { display: none; } /* On cache le texte du logo sur mobile */
  .home-nav { gap: 15px; font-size: 0.7rem; }
  .hero-content { padding-left: 0; align-items: center; text-align: center; }
  .main-title { font-size: 1.8rem; margin-bottom: 30px; }
}
</style>