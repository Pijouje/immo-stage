<script setup>

definePageMeta({
  pageTransition: {
    name: 'auth',
    mode: 'out-in'
  }
})

import { ref } from 'vue'
const { signIn } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async() => {
    errorMessage.value = ''
    if(!email.value && !password.value) {
        errorMessage.value = 'Veuillez remplir tous les champs'
        return
    }else if(!email.value) {
        errorMessage.value = 'Veuillez entrer votre email'
        return
    }else if(!password.value) {
        errorMessage.value = 'Veuillez entrer votre mot de passe'
        return
    }

    loading.value = true

    try{
        const result = await signIn('credentials', {
            email: email.value,
            password: password.value,
            redirect: false
        })

        if(result.error) {
            errorMessage.value = 'Email ou mot de passe incorrect'
            loading.value = false
        } else {
            router.push('/')
        }
    }catch (error) {
        errorMessage.value = 'Une erreur est survenue lors de la connexion.'
        loading.value = false
    }
}
</script>

<template>
  <div class="connexion-page">
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
                <input v-model="email" type="email" id="email" placeholder="thomas@exemple.com" class="Input_Style">
            </div>

            <div class="Groupe_Input">
                <PasswordInput 
                    v-model="password"
                    label="Mot de passe"
                    id="password"
                    :required="true"
                />
            </div>
            <p v-if="errorMessage" class="error-text">
                {{ errorMessage }}
            </p>

            <Bouton>Accéder à mon espace</Bouton>

            <NuxtLink to="/mot-de-passe-oublie" class="Lien_Oubli">
                Mot de passe oublié ?
            </NuxtLink>

        </form>
    </div>

  </div>
</template>

<style scoped>
.connexion-page {
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

.error-text {
  color: #ff4d4d;
  font-size: 0.9rem;
  margin-top: 2px;
  margin-bottom: 0px;
  text-align: center;
  padding: 2px;
}

:deep(.password-wrapper input) {
    padding: 18px 50px 18px 20px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1.1rem;
    color: #334155;
}

:deep(.password-wrapper input:focus) {
    border-color: #2563EB;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

@media (max-width: 768px) {
    
    .connexion-page{
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