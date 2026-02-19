<script setup>
const email = ref('')
const message = ref('')
const loading = ref(false)

const envoyerLien = async () => {
    if (!email.value) return
    
    loading.value = true
    message.value = ''

    try {
        const result = await $fetch('/api/auth/forgot-password', {
            method: 'POST',
            body: { email: email.value }
        })
        message.value = result.message
    } catch (e) {
        message.value = 'Erreur lors de l\'envoi'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="page-reset">
        <div class="card-reset">
            <h1>Mot de passe oublié</h1>
            <p>Entrez votre email pour recevoir un lien de réinitialisation</p>

            <form @submit.prevent="envoyerLien">
                <input 
                    v-model="email" 
                    type="email" 
                    placeholder="votre@email.com"
                    required
                />
                <button type="submit" :disabled="loading">
                    {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
                </button>
            </form>

            <p v-if="message" class="message">{{ message }}</p>

            <NuxtLink to="/connexion" class="back-link">
                ← Retour à la connexion
            </NuxtLink>
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
    color: #0f172a;
}

p {
    color: #64748b;
    margin-bottom: 25px;
}

input {
    width: 100%;
    padding: 12px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 15px;
    box-sizing: border-box;
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
}

button:hover:not(:disabled) {
    background: #1d4ed8;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.message {
    margin-top: 20px;
    padding: 12px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    color: #166534;
}

.back-link {
    display: inline-block;
    margin-top: 20px;
    color: #2563EB;
    text-decoration: none;
}

.back-link:hover {
    text-decoration: underline;
}
</style>