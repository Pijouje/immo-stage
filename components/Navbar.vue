<script setup>
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

const fermerMenuSiClicDehors = (event) => {
    if (!menuOuvert.value){
        return;
    }
    if (
        refMenu.value && refMenu.value.contains(event.target) || 
        refBurger.value && refBurger.value.contains(event.target)
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

</script>

<template>
    <header>
        <div class="Bandeau_haut">
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

        <div class="Menu_navigation" :class="{'actif': menuOuvert}" ref="refMenu">
            <NuxtLink to="/contact" @click="menuOuvert = false">CONTACT</NuxtLink>
            <NuxtLink to="/inscription" @click="menuOuvert = false">S'INSCRIRE</NuxtLink>
            <NuxtLink to="/connexion" @click="menuOuvert = false">SE CONNECTER</NuxtLink>
            <NuxtLink to="/profile" @click="menuOuvert = false" class="lien-profile">
                <div class="avatar-cercle">
                    {{ userInitial }}
                </div>
                <span class="texte-profile">MON ESPACE</span>
            </NuxtLink>
        </div>
    </div>
    </header>
</template>

<style scoped>
    .Bandeau_haut {
        width: 100%;
        background-color: #01111d;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 25px 5%; 
        box-sizing: border-box;
        position: relative;
        z-index: 100;
        flex-wrap: wrap;
        align-content: flex-start; 
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

    /* MENU NAVIGATION */
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

    /* BOUTON BURGER */
    .bouton-burger {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
    }

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

    @media (max-width: 768px) {
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
            max-height: 500px;
            opacity: 1;
            padding: 20px 0;
        }
        
        .Menu_navigation a {
            margin: 10px 0;
        }

        .texte-profile {
            display: block; 
            margin-left: 15px;
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
            padding-right: 15px;
        }

        .avatar-cercle {
            display: none;
        }
    }
</style>