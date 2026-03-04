<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  transparent: {
    type: Boolean,
    default: false
  }
})

const { data: session, status, signOut } = useAuth()
const { locale, setLocale } = useI18n()

const menuOuvert = ref(false)
const dropdownOuvert = ref(false)
const refMenu = ref(null)
const refBurger = ref(null)
const refDropdownZone = ref(null)

const toggleMenu = () => {
    menuOuvert.value = !menuOuvert.value
    if (menuOuvert.value) dropdownOuvert.value = false
}

const toggleDropdown = () => {
    dropdownOuvert.value = !dropdownOuvert.value
    if (dropdownOuvert.value) menuOuvert.value = false
}

const fermerDropdown = () => {
    dropdownOuvert.value = false
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
  dropdownOuvert.value = false
  await signOut({ callbackUrl: '/' })
}

const changerLangue = (lang) => {
  setLocale(lang)
  dropdownOuvert.value = false
}

const fermerMenuSiClicDehors = (event) => {
    if (menuOuvert.value) {
        const clickedInsideMenu = refMenu.value?.contains(event.target)
        const clickedBurger = refBurger.value?.contains(event.target)
        if (!clickedInsideMenu && !clickedBurger) {
            menuOuvert.value = false
        }
    }
    if (dropdownOuvert.value) {
        const clickedInsideDropdown = refDropdownZone.value?.contains(event.target)
        if (!clickedInsideDropdown) {
            dropdownOuvert.value = false
        }
    }
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

            <div class="nav-droite">
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
            </nav>

            <div class="zone-droite">
                <!-- Settings : avatar si connecté, engrenage sinon -->
                <div class="settings-zone" ref="refDropdownZone">
                    <button
                        class="settings-trigger"
                        @click="toggleDropdown"
                        :aria-expanded="dropdownOuvert"
                        :aria-label="$t('nav.settings')"
                    >
                        <div v-if="isAuthenticated" class="avatar-cercle">
                            {{ userInitial }}
                        </div>
                        <div v-else class="avatar-cercle avatar-cercle-invite" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </button>

                    <Transition name="dropdown">
                        <div v-if="dropdownOuvert" class="settings-dropdown" role="menu">
                            <!-- Langue -->
                            <div class="dropdown-section">
                                <span class="dropdown-label">{{ $t('nav.language') }}</span>
                                <div class="lang-buttons">
                                    <button
                                        class="lang-btn"
                                        :class="{ actif: locale === 'fr' }"
                                        @click="changerLangue('fr')"
                                    >FR</button>
                                    <button
                                        class="lang-btn"
                                        :class="{ actif: locale === 'en' }"
                                        @click="changerLangue('en')"
                                    >EN</button>
                                </div>
                            </div>

                            <div class="dropdown-separator"></div>

                            <!-- Connecté -->
                            <template v-if="isAuthenticated">
                                <NuxtLink to="/profile" class="dropdown-item" @click="fermerDropdown">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    {{ $t('nav.profile') }}
                                </NuxtLink>
                                <button class="dropdown-item dropdown-item-danger" @click="handleLogout">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    {{ $t('nav.logout') }}
                                </button>
                            </template>

                            <!-- Non connecté -->
                            <template v-else>
                                <NuxtLink to="/connexion" class="dropdown-item" @click="fermerDropdown">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                        <polyline points="10 17 15 12 10 7"></polyline>
                                        <line x1="15" y1="12" x2="3" y2="12"></line>
                                    </svg>
                                    {{ $t('auth.login') }}
                                </NuxtLink>
                                <NuxtLink to="/inscription" class="dropdown-item" @click="fermerDropdown">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="8.5" cy="7" r="4"></circle>
                                        <line x1="20" y1="8" x2="20" y2="14"></line>
                                        <line x1="23" y1="11" x2="17" y2="11"></line>
                                    </svg>
                                    {{ $t('auth.signup') }}
                                </NuxtLink>
                            </template>
                        </div>
                    </Transition>
                </div>

                <button class="bouton-burger" @click="toggleMenu" ref="refBurger" aria-label="Ouvrir le menu de navigation" :aria-expanded="menuOuvert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>
            </div><!-- fin nav-droite -->
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

.navbar-transparent:has(.Menu_navigation.actif),
.navbar-transparent:has(.settings-dropdown) {
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
    padding: 25px 7%;
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
    gap: 60px;
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

/* === NAV-DROITE : regroupe liens + avatar à droite === */
.nav-droite {
    display: flex;
    align-items: center;
    gap: 60px;
}

/* === ZONE DROITE (settings + burger) === */
.zone-droite {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* === SETTINGS ZONE === */
.settings-zone {
    position: relative;
}

.settings-trigger {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
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
    transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
}

.settings-trigger:hover .avatar-cercle {
    transform: scale(1.1);
    background-color: #8b5e54;
    border-color: white;
}

.avatar-cercle-invite {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25);
}

.settings-trigger:hover .avatar-cercle-invite {
    background-color: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.5);
}

/* === DROPDOWN PANEL === */
.settings-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 210px;
    background: #01111d;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    padding: 6px 0;
    z-index: 1001;
    overflow: hidden;
}

/* Transition dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

.dropdown-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    gap: 10px;
}

.dropdown-label {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    white-space: nowrap;
}

.lang-buttons {
    display: flex;
    gap: 4px;
}

.lang-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.55);
    padding: 3px 9px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    transition: all 0.15s;
}

.lang-btn:hover {
    border-color: rgba(255, 255, 255, 0.35);
    color: white;
}

.lang-btn.actif {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.35);
    color: white;
}

.dropdown-separator {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 4px 0;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    box-sizing: border-box;
    transition: background 0.15s, color 0.15s;
    text-transform: none;
}

.dropdown-item:hover {
    background: rgba(255, 255, 255, 0.07);
    color: white;
}

.dropdown-item-danger {
    color: rgba(239, 68, 68, 0.8);
}

.dropdown-item-danger:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
}

/* === BURGER === */
.bouton-burger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
}

/* === MOBILE === */
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
        max-height: 400px;
        opacity: 1;
        padding: 20px 0;
    }

    .Menu_navigation a {
        margin: 10px 0;
        text-shadow: none;
    }

    /* Sur mobile, le dropdown s'ouvre depuis la droite */
    .settings-dropdown {
        right: 0;
    }
}
</style>
