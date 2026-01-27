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

<style scoped src="../assets/css/Style_Connexion.css"></style>