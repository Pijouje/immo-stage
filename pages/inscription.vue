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
const confirmPassword = ref('')
const compteCreé = ref(false)
const prenomCreé = ref('')
const { t } = useI18n()

const hasMinLength = computed(() => password.value.length >= 12)
const hasUpper = computed(() => /[A-Z]/.test(password.value))
const hasLower = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))
const hasSpecial = computed(() => /[@$!%*?&_]/.test(password.value))

const isValid = computed(() => hasMinLength.value && hasUpper.value && hasLower.value && hasNumber.value && hasSpecial.value)


const handleInscription = async () => {
    MessageError.value = ''

    if(!email.value || !password.value || !nom.value || !prenom.value) {
        MessageError.value = t('errors.fillAllFields')
        return
    }

    if (!isValid.value) {
        MessageError.value = t('errors.passwordCriteria')
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

        prenomCreé.value = prenom.value
        compteCreé.value = true

    } catch (error) {
        MessageError.value = error.statusMessage || t('errors.signupError')
    }finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="inscription-page">
    <div class="Carte">

        <!-- ÉCRAN DE SUCCÈS -->
        <div v-if="compteCreé" class="succes-container">
            <div class="succes-icone">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h2>{{ $t('auth.welcome', { name: prenomCreé }) }}</h2>
            <p>{{ $t('auth.accountCreated') }}</p>
            <button @click="router.push('/connexion')" class="btn-connexion">
                {{ $t('auth.connect') }}
            </button>
        </div>

        <!-- FORMULAIRE -->
        <template v-else>
            <div class="Haut_carte">
                <h1>STUD'LOC.</h1>
                <div class="soustitre">{{ $t('auth.studentSpace') }}</div>
            </div>

            <div class="Zone_Onglets">
                <NuxtLink to="/connexion" class="Onglet inactif">{{ $t('auth.login') }}</NuxtLink>
                <NuxtLink to="/inscription" class="Onglet actif">{{ $t('auth.createAccount') }}</NuxtLink>
            </div>

            <form @submit.prevent="handleInscription" class="Formulaire">

                <div class="Groupe_Input">
                    <label for="nom">{{ $t('auth.name') }}</label>
                    <input v-model="nom" type="text" id="nom" placeholder="LeDudu" class="Input_Style">
                </div>

                <div class="Groupe_Input">
                    <label for="prenom">{{ $t('auth.firstname') }}</label>
                    <input v-model="prenom" type="text" id="prenom" placeholder="Thomas" class="Input_Style">
                </div>

                <div class="Groupe_Input">
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input v-model="email" type="email" id="email" placeholder="thomas@exemple.com" class="Input_Style">
                </div>

                <div class="Groupe_Input">
                    <PasswordInput
                        v-model="password"
                        :label="$t('auth.password')"
                        id="password"
                        :required="true"
                    />
                    <div v-if="password.length > 0" class="password-checklist">
                        <div :class="{ 'valid': hasMinLength, 'invalid': !hasMinLength }">
                            <span class="icon">{{ hasMinLength ? '✔' : '○' }}</span> {{ $t('password.minLength') }}
                        </div>
                        <div :class="{ 'valid': hasUpper, 'invalid': !hasUpper }">
                            <span class="icon">{{ hasUpper ? '✔' : '○' }}</span> {{ $t('password.uppercase') }}
                        </div>
                        <div :class="{ 'valid': hasLower, 'invalid': !hasLower }">
                            <span class="icon">{{ hasLower ? '✔' : '○' }}</span> {{ $t('password.lowercase') }}
                        </div>
                        <div :class="{ 'valid': hasNumber, 'invalid': !hasNumber }">
                            <span class="icon">{{ hasNumber ? '✔' : '○' }}</span> {{ $t('password.number') }}
                        </div>
                        <div :class="{ 'valid': hasSpecial, 'invalid': !hasSpecial }">
                            <span class="icon">{{ hasSpecial ? '✔' : '○' }}</span> {{ $t('password.special') }}
                        </div>
                    </div>
                </div>

                <p v-if="MessageError" class="error-text">
                    {{ MessageError }}
                </p>

                <Bouton>{{ $t('auth.signupNow') }}</Bouton>
            </form>
        </template>

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
  margin-top: 5px;
  margin-bottom: 0px;
  text-align: center;
  padding: 2px;
}

/* ÉCRAN SUCCÈS */
.succes-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px 0;
    gap: 20px;
}

.succes-icone {
    width: 80px;
    height: 80px;
    background: #2563EB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
}

.succes-container h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 900;
    color: #0f172a;
}

.succes-container p {
    color: #64748b;
    font-size: 1rem;
    line-height: 1.6;
    max-width: 380px;
    margin: 0;
}

.btn-connexion {
    margin-top: 10px;
    background: #2563EB;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 14px 36px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-connexion:hover {
    background: #1d4ed8;
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