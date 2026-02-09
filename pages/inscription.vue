<script setup>

definePageMeta({
  pageTransition: {
    name: 'auth',
    mode: 'out-in'
  }
})

import { ref, computed } from 'vue'

const nom = ref('')
const prenom = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const MessageError = ref('')

const hasMinLength = computed(() => password.value.length >= 12)
const hasUpper = computed(() => /[A-Z]/.test(password.value))
const hasLower = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))
const hasSpecial = computed(() => /[@$!%*?&_]/.test(password.value))

const isValid = computed(() => hasMinLength.value && hasUpper.value && hasLower.value && hasNumber.value && hasSpecial.value)


const handleInscription = async () => {
    MessageError.value = ''

    if(!email.value || !password.value || !nom.value || !prenom.value) {
        alert('Veuillez remplir tous les champs')
        return
    }

    if (!isValid.value) {
        MessageError.value = "Veuillez respecter tous les critères du mot de passe."
        return
    }

    loading.value = true
    try{
        await $fetch('/api/auth/register', {
            method: 'POST',
            body: {
                nom: nom.value,
                prenom: prenom.value,
                email: email.value,
                password: password.value
            }
        })

        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        router.push('/connexion')

    } catch (error) {
        MessageError.value = error.statusMessage || 'Une erreur est survenue lors de l\'inscription.'
    }finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="inscription-page">
    <div class="Carte">
        <div class="Haut_carte">
            <h1>STUD'LOC.</h1>
            <div class="soustitre">Espace Étudiant</div>
        </div>

        <div class="Zone_Onglets">
            <NuxtLink to="/connexion" class="Onglet inactif">Se connecter</NuxtLink>
            <NuxtLink to="/inscription" class="Onglet actif">Créer un compte</NuxtLink>
        </div>

        <form @submit.prevent="handleInscription" class="Formulaire">

            <div class="Groupe_Input">
                <label for="nom">Nom</label>
                <input v-model="nom" type="text" id="nom" placeholder="LeDudu" class="Input_Style">
            </div>

            <div class="Groupe_Input">
                <label for="prenom">Prénom</label>
                <input v-model="prenom" type="text" id="prenom" placeholder="Thomas" class="Input_Style">
            </div>

            <div class="Groupe_Input">
                <label for="email">Email</label>
                <input v-model="email" type="email" id="email" placeholder="thomas@exemple.com" class="Input_Style">
            </div>

            <div class="Groupe_Input">
                <label for="password">Mot de passe</label>
                <input v-model="password" type="password" id="password" placeholder="••••••••" class="Input_Style">
                <div v-if="password.length > 0" class="password-checklist">
                    <div :class="{ 'valid': hasMinLength, 'invalid': !hasMinLength }">
                        <span class="icon">{{ hasMinLength ? '✔' : '○' }}</span> 12 Caractères
                    </div>
                    <div :class="{ 'valid': hasUpper, 'invalid': !hasUpper }">
                        <span class="icon">{{ hasUpper ? '✔' : '○' }}</span> 1 Majuscule
                    </div>
                    <div :class="{ 'valid': hasLower, 'invalid': !hasLower }">
                        <span class="icon">{{ hasLower ? '✔' : '○' }}</span> 1 Minuscule
                    </div>
                    <div :class="{ 'valid': hasNumber, 'invalid': !hasNumber }">
                        <span class="icon">{{ hasNumber ? '✔' : '○' }}</span> 1 Chiffre
                    </div>
                    <div :class="{ 'valid': hasSpecial, 'invalid': !hasSpecial }">
                        <span class="icon">{{ hasSpecial ? '✔' : '○' }}</span> 1 Symbole (@$!%*?&_)
                    </div>
                </div>
            </div>
            
            
            <p v-if="MessageError" class="error-text">
                {{ MessageError }}
            </p>

            <Bouton>S'inscrire maintenant</Bouton>

            <NuxtLink to="/mot-de-passe-oublie" class="Lien_Oubli">J'ai oublié mon mot de passe</NuxtLink>

        </form>
    </div>

  </div>
</template>

<style scoped>

.inscription-page {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f1f5f9;
    min-height: calc(100vh - 90px); 
    display: flex;
    flex-direction: column;
}
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

.Onglet.inactif:hover { 
    color: #000; 
}

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

.Lien_Oubli {
    text-align: center;
    color: #2563EB;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 10px;
}

.Lien_Oubli:hover { 
    text-decoration: underline;
}

.password-checklist {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
    font-size: 0.7rem;
    background-color: #f8fafc;
    padding: 10px;
    border-radius: 8px;
}

.password-checklist div {
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
}

.invalid {
    color: #94a3b8; 
}

.valid {
    color: #10b981;
    font-weight: 600;
}

.icon {
    font-size: 0.8rem;
}

.error-text {
  color: #ff4d4d;
  font-size: 0.9rem;
  margin-top: 2px;
  margin-bottom: 0px;
  text-align: center;
  padding: 2px;
}

@media (max-width: 768px) {
    
    .inscription-page {
        min-height: auto; 
        padding-bottom: 40px;
    }

    .Carte {
        margin: 40px auto; 
        width: 90%;
        padding: 30px 20px; 
    }


    .Haut_carte h1 {
        font-size: 1.8rem;
    }

    .Onglet {
        font-size: 0.9rem;
        padding-bottom: 12px;
    }

    .Input_Style {
        padding: 15px;
        font-size: 1rem;
    }
}

@media (max-width: 380px) {
    .Carte {
        margin: 20px auto;
        padding: 20px 15px;
    }
    
    .Haut_carte h1 {
        font-size: 1.5rem;
    }
    
    .Menu_navigation {
        gap: 10px;
    }
}

</style>