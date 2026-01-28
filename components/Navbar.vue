<template>
    <header>
        <div class="Bandeau_haut">
        <div class="Conteneur_Logo">
            <div class="Logo_Cercle">🏠</div>
            <div class="Nom_site">
                <h2>NOM DU<br>SITE (AMIENS)</h2>
            </div>
        </div>

        <div class="Menu_navigation">
            <NuxtLink to="/contact">CONTACT</NuxtLink>
            <NuxtLink to="/inscription">S'INSCRIRE</NuxtLink>
            <NuxtLink to="/connexion">SE CONNECTER</NuxtLink>
        </div>
    </div>
    </header>
</template>

<style scoped>
    .Bandeau_haut {
        width: 100%;
        height: 90px;
        background-color: #01111d;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 5%;
        padding-right: 5%;
        box-sizing: border-box;
    }

    /* LOGO */
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

    .Menu_navigation a:hover { opacity: 0.7; }

</style>