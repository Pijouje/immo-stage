<script setup>
import { ref } from 'vue'

// Variables pour récupérer ce que l'utilisateur écrit
const email = ref('')
const password = ref('')

// Fonction déclenchée quand on clique sur le bouton
const handleLogin = () => {
  console.log("Connexion avec :", email.value)
  // Ici tu mettras plus tard ton appel API vers PHP
}
</script>

<template>
  <div class="connexion-page">
    
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

    <div class="Carte">
        <div class="Haut_carte">
            <h1>STUD'LOC.</h1>
            <div class="soustitre">Espace Étudiant</div>
        </div>

        <div class="Zone_Onglets">
            <NuxtLink to="/connexion" class="Onglet actif">Se connecter</NuxtLink>
            <NuxtLink to="/inscription" class="Onglet inactif">Créer un compte</NuxtLink>
        </div>

        <form @submit.prevent="handleLogin" class="Formulaire">
            
            <div class="Groupe_Input">
                <label for="email">Email</label>
                <input v-model="email" type="email" id="email" placeholder="thomas@exemple.fr" class="Input_Style">
            </div>

            <div class="Groupe_Input">
                <label for="password">Mot de passe</label>
                <input v-model="password" type="password" id="password" placeholder="••••••••" class="Input_Style">
            </div>

            <button type="submit" class="Bouton_Action">Accéder à mon espace</button>

            <NuxtLink to="/mot-de-passe-oublie" class="Lien_Oubli">J'ai oublié mon mot de passe</NuxtLink>

        </form>
    </div>

  </div>
</template>

<style>
/* STRUCTURE DE LA PAGE */
.connexion-page {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f1f5f9;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* BANDEAU HAUT */
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

/* CARTE CENTRALE */
.Carte {
    background-color: white;
    width: 100%;
    max-width: 600px; 
    padding: 60px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    border-top: #2563EB 6px solid; 
    display: flex;
    flex-direction: column;
    margin: 80px auto; 
    box-sizing: border-box;
}

/* TITRES */
.Haut_carte {
    text-align: center;
    margin-bottom: 40px;
}

.Haut_carte h1 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 900;
    color: #000;
}

.soustitre {
    color: #64748b;
    font-size: 1.1rem;
    margin-top: 8px;
}

/* ONGLETS */
.Zone_Onglets {
    display: flex;
    width: 100%;
    margin-bottom: 35px;
    border-bottom: 2px solid #e2e8f0;
}

.Onglet {
    flex: 1;
    text-align: center;
    padding-bottom: 18px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.1rem;
    transition: 0.3s;
    color: #64748b;
}

.Onglet.actif {
    color: #2563EB;
    border-bottom: 4px solid #2563EB;
    margin-bottom: -2px;
}

.Onglet.inactif:hover { color: #000; }

/* FORMULAIRE */
.Formulaire {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.Groupe_Input {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

label {
    font-size: 1rem;
    font-weight: 800;
    color: #000;
    text-transform: uppercase;
}

.Input_Style {
    padding: 18px 20px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1.1rem;
    color: #334155;
    outline: none;
    transition: 0.2s;
}

.Input_Style:focus {
    border-color: #2563EB;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.Bouton_Action {
    background-color: #2563EB;
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    transition: background 0.2s;
    width: 100%;
}

.Bouton_Action:hover {
    background-color: #1d4ed8;
}

.Lien_Oubli {
    text-align: center;
    color: #2563EB;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 10px;
}

.Lien_Oubli:hover { text-decoration: underline; }
</style>