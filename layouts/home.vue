<template>
  <div class="home-layout">
    <!-- Navbar transparente flottante -->
    <header class="navbar-transparent">
      <div class="Bandeau_haut">
        <div class="Conteneur_Logo">
          <div class="Logo_Cercle">
            <NuxtLink to="/">
              <span>🏠</span>
            </NuxtLink>
          </div>
          <div class="Nom_site">
            <NuxtLink to="/">
              <h2>NOM DU<br>SITE (AMIENS)</h2>
            </NuxtLink>
          </div>
        </div>

        <button class="bouton-burger" @click="toggleMenu" ref="refBurger">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="Menu_navigation" :class="{'actif': menuOuvert}" ref="refMenu">
          <NuxtLink to="/offres" @click="menuOuvert = false">OFFRES</NuxtLink>
          
          <!-- Bouton "Créer une offre" pour ADMIN et PROPRIETAIRE -->
          <NuxtLink 
            v-if="canCreateOffre" 
            to="/offres/create" 
            @click="menuOuvert = false"
            class="btn-create-offre"
          >
            + CRÉER UNE OFFRE
          </NuxtLink>
          
          <NuxtLink to="/contact" @click="menuOuvert = false">CONTACT</NuxtLink>
          
          <!-- Afficher UNIQUEMENT si NON connecté -->
          <template v-if="!isAuthenticated">
            <NuxtLink to="/inscription" @click="menuOuvert = false">S'INSCRIRE</NuxtLink>
            <NuxtLink to="/connexion" @click="menuOuvert = false">SE CONNECTER</NuxtLink>
          </template>

          <!-- Afficher UNIQUEMENT si connecté -->
          <template v-if="isAuthenticated">
            <NuxtLink to="/profile" @click="menuOuvert = false" class="lien-profile">
              <div class="avatar-cercle">
                {{ userInitial }}
              </div>
              <span class="texte-profile">MON ESPACE</span>
            </NuxtLink>

            <!-- Bouton déconnexion (uniquement visible en mobile) -->
            <button @click="handleLogout" class="btn-logout-mobile">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Déconnexion
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Contenu de la page (Hero + vidéo) -->
    <main class="home-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Récupération de l'état d'authentification
const { data: session, status, signOut } = useAuth()

// États pour le menu burger
const menuOuvert = ref(false)
const refMenu = ref(null)
const refBurger = ref(null)

const toggleMenu = () => {
  menuOuvert.value = !menuOuvert.value
}

// Calculer l'initiale de l'utilisateur
const userInitial = computed(() => {
  if (!session.value?.user?.name) return 'U'
  const names = session.value.user.name.split(' ')
  return names[0]?.charAt(0)?.toUpperCase() || 'U'
})

// Vérifier si l'utilisateur est connecté
const isAuthenticated = computed(() => status.value === 'authenticated')

// Vérifier si l'utilisateur peut créer des offres
const canCreateOffre = computed(() => {
  const role = session.value?.user?.role
  return role === 'ADMIN' || role === 'PROPRIETAIRE'
})

// Gestion de la déconnexion
const handleLogout = async () => {
  await signOut({ callbackUrl: '/' })
}

// Fermer le menu si on clique en dehors
const fermerMenuSiClicDehors = (event) => {
  if (!menuOuvert.value) return
  if (
    (refMenu.value && refMenu.value.contains(event.target)) || 
    (refBurger.value && refBurger.value.contains(event.target))
  ) {
    return
  }
  menuOuvert.value = false
}

onMounted(() => {
  window.addEventListener('click', fermerMenuSiClicDehors)
})

onUnmounted(() => {
  window.removeEventListener('click', fermerMenuSiClicDehors)
})
</script>

<style scoped>
/* Layout global de la home */
.home-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.home-content {
  width: 100%;
  min-height: 100vh;
}

/* NAVBAR TRANSPARENTE FLOTTANTE */
.navbar-transparent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: transparent; /* Transparent par défaut */
  transition: background-color 0.3s ease;
}

/* Fond semi-transparent quand le menu mobile est ouvert */
.navbar-transparent:has(.Menu_navigation.actif) {
  background-color: rgba(1, 17, 29, 0.95);
}

.Bandeau_haut {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 5%;
  box-sizing: border-box;
}

/* LOGO */
.Conteneur_Logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.Conteneur_Logo a {
  text-decoration: none;
  color: inherit;
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
  transition: transform 0.2s;
}

.Logo_Cercle:hover {
  transform: scale(1.05);
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Ombre pour meilleure lisibilité */
}

/* MENU NAVIGATION */
.Menu_navigation {
  display: flex;
  gap: 40px;
  align-items: center;
}

.Menu_navigation a,
.Menu_navigation button {
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: opacity 0.3s;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.Menu_navigation a:hover,
.Menu_navigation button:hover {
  opacity: 0.7;
}

/* Bouton "Créer une offre" mis en avant */
.btn-create-offre {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-create-offre:hover {
  opacity: 1 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* BOUTON BURGER */
.bouton-burger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* AVATAR UTILISATEUR */
.lien-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.lien-profile:hover .avatar-cercle {
  transform: scale(1.1);
  background-color: #8b5e54;
  border-color: white;
}

.texte-profile {
  display: none;
}

/* Bouton déconnexion mobile (caché par défaut) */
.btn-logout-mobile {
  display: none;
}

/* RESPONSIVE MOBILE */
@media (max-width: 768px) {
  .bouton-burger {
    display: block;
  }

  .Menu_navigation {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: rgba(1, 17, 29, 0.98); /* Fond opaque pour le menu mobile */
    backdrop-filter: blur(10px);
    flex-direction: column;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.4s ease-in-out;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  .Menu_navigation.actif {
    max-height: 600px;
    opacity: 1;
    padding: 20px 0;
  }

  .Menu_navigation a,
  .Menu_navigation button {
    margin: 10px 0;
    text-shadow: none; /* Pas besoin d'ombre sur fond sombre */
  }

  .texte-profile {
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: white;
  }

  .lien-profile {
    margin-top: 10px;
  }

  /* Bouton déconnexion visible uniquement en mobile */
  .btn-logout-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: none;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 15px auto 5px auto;
    width: 80%;
    max-width: 250px;
    transition: all 0.3s;
  }

  .btn-logout-mobile:hover {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
  }

  .btn-logout-mobile svg {
    flex-shrink: 0;
  }
}
</style>