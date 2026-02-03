<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const user = ref({
    prenom: 'Alexis',
    nom: 'Dupont'
});

const userInitial = computed(() => {
    return user.value.prenom.charAt(0).toUpperCase();
});

const menuOuvert = ref(false);
const refMenu = ref(null);
const refBurger = ref(null);

const toggleMenu = () => {
    menuOuvert.value = !menuOuvert.value;
};

const fermerMenuSiClicDehors = (event: Event) => {
    if (!menuOuvert.value) return;
    if (
        (refMenu.value && (refMenu.value as HTMLElement).contains(event.target as Node)) || 
        (refBurger.value && (refBurger.value as HTMLElement).contains(event.target as Node))
    ) {
        return;
    }
    menuOuvert.value = false;
};

onMounted(() => {
    window.addEventListener('click', fermerMenuSiClicDehors);
});

onUnmounted(() => {
    window.removeEventListener('click', fermerMenuSiClicDehors);
});

// --- META ---
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

    <header class="home-header" :class="{ 'solid-bg': menuOuvert }">
      <div class="Conteneur_Logo">
        <div class="Logo_Cercle"><NuxtLink to="/"><span>🏠</span></NuxtLink></div>
        <div class="Nom_site">
          <NuxtLink to="/"><h2>NOM DU<br>SITE (AMIENS)</h2></NuxtLink>
        </div>
      </div>

      <button class="bouton-burger" @click="toggleMenu" ref="refBurger">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <nav class="Menu_navigation" :class="{'actif': menuOuvert}" ref="refMenu">
        <NuxtLink to="/contact" @click="menuOuvert = false">CONTACT</NuxtLink>
        <NuxtLink to="/inscription" @click="menuOuvert = false">S'INSCRIRE</NuxtLink>
        <NuxtLink to="/connexion" @click="menuOuvert = false">SE CONNECTER</NuxtLink>
        
        <NuxtLink to="/profile" class="lien-profile" @click="menuOuvert = false">
          <div class="avatar-cercle">
              {{ userInitial }}
          </div>
          <span class="texte-profile">MON ESPACE</span>
        </NuxtLink>
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
.home-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

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
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.home-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5%;
  padding-right: 5%;
  box-sizing: border-box;
  z-index: 10;
  background-color: transparent;
}

.Conteneur_Logo {
  display: flex;
  align-items: center;
  gap: 15px;
}
.Conteneur_Logo a {
    text-decoration: none; color: inherit;
}

.Logo_Cercle {
  width: 40px; height: 40px;
  background-color: white;
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  font-size: 1.4rem; color: #01111d;
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

/* PROFIL */
.lien-profile{
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-cercle {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: #5D4037;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s;
}

.lien-profile:hover .avatar-cercle {
    transform: scale(1.1);
    background-color: #8b5e54;
    border-color: white;
}

.texte-profile {
    display: none;
}

.bouton-burger {
    display: none;
    background: none; border: none;
    cursor: pointer; padding: 5px;
}

@media (max-width: 768px) {
    .home-header {
        transition: background-color 0.3s ease;
    }

    .home-header.solid-bg {
        background-color: #01111d;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3); 
    }

    .bouton-burger {
        display: block;
    }

    .Menu_navigation {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: #01111d; 
        flex-direction: column;
        border-top: 1px solid rgba(255,255,255,0.05);
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: all 0.4s ease-in-out;
        box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    }

    .Menu_navigation.actif {
        max-height: 500px;
        opacity: 1;
        padding-bottom: 20px;
    }

    .Menu_navigation a {
        margin: 0;
        padding: 15px 0;
        width: 100%;
        text-align: center;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .avatar-cercle { display: none; }
    .texte-profile { 
        display: block; 
        color: white;
        font-weight: 700;
    }
    .lien-profile {
        margin-top: 0;
        border-bottom: none;
    }

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
        align-self: center;
        margin-top: 60px;
    }
}
</style>