<script setup lang="ts">
definePageMeta({
  layout: false,
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
  <div class="home-container">

    <div class="video-bg">
      <video autoplay loop muted playsinline>
        <source src="/videos/video_presentation_salon.mp4" type="video/mp4">
      </video>
      <div class="overlay"></div>
    </div>

    <header class="home-header">
      <div class="Conteneur_Logo">
        <div class="Logo_Cercle">🏠</div>
        <div class="Nom_site">
          <h2>NOM DU<br>SITE (AMIENS)</h2>
        </div>
      </div>

      <nav class="Menu_navigation">
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
/* --- CONFIGURATION GÉNÉRALE --- */
.home-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* --- VIDÉO & OVERLAY --- */
.video-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
}
.video-bg video {
  width: 100%; height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.3); /* Légèrement plus sombre pour lire le menu blanc */
  z-index: 1;
}

/* --- NAVBAR TRANSPARENTE (Fusion des styles) --- */
.home-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px; /* Même hauteur que ta navbar normale */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5%;
  padding-right: 5%;
  box-sizing: border-box;
  z-index: 10;
  background-color: transparent; /* Pas de fond sombre ici */
}

/* Style du Logo récupéré de ta Navbar */
.Conteneur_Logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.Logo_Cercle {
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  color: #01111d;
}

.Nom_site h2 {
  color: white;
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  letter-spacing: 1px;
  text-align: left;
  text-transform: uppercase;
}

/* Style du Menu récupéré de ta Navbar */
.Menu_navigation {
  display: flex;
  gap: 40px;
  align-items: center;
}

.Menu_navigation a {
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: opacity 0.3s;
}

.Menu_navigation a:hover { opacity: 0.7; }

/* --- TEXTE CENTRAL ET BOUTON --- */
.hero-content {
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
}

.cta-button {
  align-self: center; /* Sort de l'alignement à gauche du parent pour se centrer */
  margin-left: -5%;   /* Compense le padding-left du parent pour être pile au centre de l'écran */
  background-color: #f2f2f2;
  color: #01111d;
  text-decoration: none;
  width: 180px;
  padding: 18px 0;
  border-radius: 50px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 100;
  letter-spacing: 1px;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.cta-button:hover {
  background-color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
</style>