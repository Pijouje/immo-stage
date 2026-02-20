<script setup>
definePageMeta({
  auth: false,
  middleware: []
})

import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const token = ref(route.query.token?.toString() || '')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)
const tokenInvalid = ref(false)
const tokenErreur = ref('')
const verificationEnCours = ref(true)

onMounted(async () => {
    if (!token.value) {
        tokenInvalid.value = true
        tokenErreur.value = 'Lien invalide. Aucun token trouvé.'
        verificationEnCours.value = false
        return
    }
    try {
        await $fetch(`/api/auth/verify-reset-token?token=${token.value}`)
    } catch (e) {
        tokenInvalid.value = true
        tokenErreur.value = e.data?.message || 'Lien invalide ou expiré'
    } finally {
        verificationEnCours.value = false
    }
})

// Validations du mot de passe
const hasMinLength = computed(() => newPassword.value.length >= 12)
const hasUpper = computed(() => /[A-Z]/.test(newPassword.value))
const hasLower = computed(() => /[a-z]/.test(newPassword.value))
const hasNumber = computed(() => /\d/.test(newPassword.value))
const hasSpecial = computed(() => /[@$!%*?&_]/.test(newPassword.value))

const isPasswordValid = computed(() => 
    hasMinLength.value && hasUpper.value && hasLower.value && hasNumber.value && hasSpecial.value
)

const reinitialiser = async () => {
    error.value = ''
    message.value = ''

    if (!isPasswordValid.value) {
        error.value = 'Le mot de passe ne respecte pas tous les critères'
        return
    }

    if (newPassword.value !== confirmPassword.value) {
        error.value = 'Les mots de passe ne correspondent pas'
        return
    }

    loading.value = true

    try {
        const result = await $fetch('/api/auth/reset-password', {
            method: 'POST',
            body: {
                token: token.value,
                newPassword: newPassword.value
            }
        })
        message.value = result.message
        setTimeout(() => router.push('/connexion'), 2000)
    } catch (e) {
        error.value = e.data?.message || 'Erreur lors de la réinitialisation'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="page-reset">
        <div class="card-reset">

            <!-- Vérification en cours -->
            <div v-if="verificationEnCours" class="etat-token">
                <div class="spinner"></div>
                <p>Vérification du lien...</p>
            </div>

            <!-- Lien invalide ou expiré -->
            <div v-else-if="tokenInvalid" class="etat-token">
                <div class="token-icon">✗</div>
                <h1>Lien invalide</h1>
                <p class="token-erreur">{{ tokenErreur }}</p>
                <a href="/mot-de-passe-oublie" class="btn-nouveau-lien">Demander un nouveau lien</a>
            </div>

            <!-- Formulaire (token valide) -->
            <template v-else>
            <h1>Nouveau mot de passe</h1>
            <p>Entrez votre nouveau mot de passe</p>

            <form @submit.prevent="reinitialiser">
                <div class="Groupe_Input">
                    <PasswordInput 
                        v-model="newPassword"
                        label="Nouveau mot de passe"
                        id="newPassword"
                        :required="true"
                    />
                    
                    <div v-if="newPassword.length > 0" class="password-checklist">
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

                <div class="Groupe_Input">
                    <PasswordInput 
                        v-model="confirmPassword"
                        label="Confirmer le mot de passe"
                        id="confirmPassword"
                        :required="true"
                    />
                </div>

                <button type="submit" :disabled="loading || !isPasswordValid">
                    {{ loading ? 'Réinitialisation...' : 'Réinitialiser' }}
                </button>
            </form>

            <p v-if="message" class="message success">{{ message }}</p>
            <p v-if="error" class="message error">{{ error }}</p>
            </template>

        </div>
    </div>
</template>

<style scoped>
.page-reset {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    padding: 20px;
}

.card-reset {
    border-top: #2563EB 6px solid; 
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    max-width: 450px;
    width: 100%;
}

h1 {
    margin: 0 0 10px 0;
    font-size: 1.8rem;
    color: black;
}

p {
    color: black;
    margin-bottom: 25px;
}

.Groupe_Input {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}

.Groupe_Input label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #334155;
}

input {
    width: 100%;
    padding: 12px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: #2563EB;
}

button {
    width: 100%;
    padding: 12px;
    background: #2563EB;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 10px;
}

button:hover:not(:disabled) {
    background: #1d4ed8;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.password-checklist {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.85rem;
}

.password-checklist > div {
    display: flex;
    align-items: center;
    gap: 8px;
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

.message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.9rem;
}

.success {
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #166534;
}

.error {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #991b1b;
}

.etat-token {
    text-align: center;
    padding: 20px 0;
}

.spinner {
    width: 36px;
    height: 36px;
    border: 4px solid #e2e8f0;
    border-top-color: #2563EB;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.token-icon {
    width: 56px;
    height: 56px;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto 16px;
}

.token-erreur {
    color: #64748b;
    margin-bottom: 24px;
}

.btn-nouveau-lien {
    display: inline-block;
    background: #2563EB;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
}

.btn-nouveau-lien:hover {
    background: #1d4ed8;
}
</style>