<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  transparent: {
    type: Boolean,
    default: false
  }
})

const { data: session, status, signOut } = useAuth()
const menuOuvert = ref(false)
const refMenu = ref(null)
const refBurger = ref(null)

const toggleMenu = () => {
    menuOuvert.value = !menuOuvert.value
}

const userInitial = computed(() => {
  if (!session.value?.user?.name) return 'U'
  const names = session.value.user.name.split(' ')
  return names[0]?.charAt(0)?.toUpperCase() || 'U'
})

const isAuthenticated = computed(() => status.value === 'authenticated')

const canCreateOffre = computed(() => {
  const role = session.value?.user?.role
  return role === 'ADMIN' || role === 'PROPRIETAIRE'
})

const handleLogout = async () => {
  await signOut({ callbackUrl: '/' })
}

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

<template>
    <header :class="transparent ? 'navbar-transparent' : 'navbar-solid'">
        <div class="Bandeau_haut">
            <div class="Conteneur_Logo">
                <div class="Logo_Cercle" aria-hidden="true">
                    <NuxtLink to="/" aria-label="Accueil - Stud'Loc">
                        <img src="/images/logo.png" alt="Stud'Loc logo" class="logo-img" />
                    </NuxtLink>
                </div>
                <div class="Nom_site">
                    <NuxtLink to="/" aria-label="Accueil">
                        <span class="site-name">{{ $t('footer.siteName') }}</span>
                    </NuxtLink>
                </div>
            </div>

            <button class="bouton-burger" @click="toggleMenu" ref="refBurger" aria-label="Ouvrir le menu de navigation" :aria-expanded="menuOuvert">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            <nav class="Menu_navigation" :class="{'actif': menuOuvert}" ref="refMenu" aria-label="Navigation principale">
                <NuxtLink to="/offres" @click="menuOuvert = false">{{ $t('nav.offers') }}</NuxtLink>

                <NuxtLink
                  v-if="canCreateOffre"
                  to="/offres/create"
                  @click="menuOuvert = false"
                  class="btn-create-offre"
                >
                  {{ $t('nav.createOffer') }}
                </NuxtLink>

                <NuxtLink to="/contact" @click="menuOuvert = false">{{ $t('nav.contact') }}</NuxtLink>

                <template v-if="!isAuthenticated">
                    <NuxtLink to="/inscription" @click="menuOuvert = false">{{ $t('nav.signup') }}</NuxtLink>
                    <NuxtLink to="/connexion" @click="menuOuvert = false">{{ $t('nav.login') }}</NuxtLink>
                </template>

                <template v-if="isAuthenticated">
                    <NuxtLink to="/profile" @click="menuOuvert = false" class="lien-profile">
                        <div class="avatar-cercle">
                            {{ userInitial }}
                        </div>
                        <span class="texte-profile">{{ $t('nav.mySpace') }}</span>
                    </NuxtLink>

                    <button @click="handleLogout" class="btn-logout-mobile">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        {{ $t('nav.logout') }}
                    </button>
                </template>

            </nav>
        </div>
    </header>
</template>

<style scoped>
/* === MODE SOLIDE (défaut) === */
.navbar-solid {
    background-color: #01111d;
    position: relative;
    z-index: 100;
}

/* === MODE TRANSPARENT (home) === */
.navbar-transparent {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: transparent;
    transition: background-color 0.3s ease;
}

.navbar-transparent:has(.Menu_navigation.actif) {
    background-color: rgba(1, 17, 29, 0.95);
}

.navbar-transparent .Nom_site .site-name {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.navbar-transparent .Menu_navigation a,
.navbar-transparent .Menu_navigation button {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.navbar-transparent .bouton-burger {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.navbar-transparent .avatar-cercle {
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* === COMMUN === */
.Bandeau_haut {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 25px 5%;
    box-sizing: border-box;
    position: relative;
    flex-wrap: wrap;
    align-content: flex-start;
}

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
    background: transparent !important;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s;
}

.Logo_Cercle a {
    background: transparent;
    display: flex;
    line-height: 0;
}

.Logo_Cercle:hover {
    transform: scale(1.05);
}

.logo-img {
    display: block;
    height: 44px;
    width: auto;
    background: transparent;
}

.Nom_site .site-name {
    display: block;
    color: white;
    font-size: 0.85rem;
    font-weight: 800;
    line-height: 1.2;
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

.Menu_navigation a:hover {
    opacity: 0.7;
}

.btn-create-offre {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    padding: 10px 20px !important;
    border-radius: 8px;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-create-offre:hover {
    opacity: 1 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.bouton-burger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
}

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
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s, background-color 0.2s;
}

.lien-profile:hover .avatar-cercle {
    transform: scale(1.1);
    background-color: #8b5e54;
    border-color: white;
}

.texte-profile {
    display: none;
}

.btn-logout-mobile {
    display: none;
}


@media (max-width: 768px) {
    .bouton-burger {
        display: block;
    }

    .Menu_navigation {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: rgba(1, 17, 29, 0.98);
        backdrop-filter: blur(10px);
        flex-direction: column;
        border-top: 1px solid rgba(255,255,255,0.1);
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: all 0.4s ease-in-out;
        display: flex;
        box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        z-index: 999;
    }

    .Menu_navigation.actif {
        max-height: 600px;
        opacity: 1;
        padding: 20px 0;
    }

    .Menu_navigation a {
        margin: 10px 0;
        text-shadow: none;
    }

    .texte-profile {
        display: block;
        margin-left: 0;
        font-weight: 600;
        font-size: 0.9rem;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: white;
    }

    .lien-profile {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
    }

    .avatar-cercle {
        width: 35px;
        height: 35px;
    }

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
