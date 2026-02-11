<script setup lang="ts">
// CORRECTION 1 : Le middleware du module auth s'appelle souvent 'sidebase-auth' 
// ou alors il faut désactiver le typage strict ici si tu n'as pas de fichier middleware/auth.ts.
// Si 'sidebase-auth' ne marche pas, retire carrément definePageMeta et laisse la vérification manuelle en dessous.
definePageMeta({
  middleware: 'sidebase-auth' 
})

const { data: session } = useAuth()

// CORRECTION 2 : On force le type avec (as any) pour accéder au role
if (!session.value || (session.value.user as any)?.role !== 'ADMIN') {
  navigateTo('/')
}

const form = ref({
  titre: '',
  prix: '',
  lieu: '',
  desc: '',
  imageUrl: '' 
})

const loading = ref(false)
const successMessage = ref('')

const soumettreOffre = async () => {
  loading.value = true
  try {
    // CORRECTION ICI : On met "as any" pour faire taire TypeScript
    await $fetch('/api/offres/create', {
      method: 'POST' as any, 
      body: form.value
    })
    
    successMessage.value = "Offre publiée avec succès ! 🚀"
    form.value = { titre: '', prix: '', lieu: '', desc: '', imageUrl: '' }
    
  } catch (error: any) { 
    alert("Erreur lors de la création : " + (error.statusMessage || error.message))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="container">
      <h1>Administration : Ajouter une offre</h1>

      <div v-if="successMessage" class="success-box">{{ successMessage }}</div>

      <form @submit.prevent="soumettreOffre" class="admin-form">
        
        <div class="form-group">
          <label>Titre de l'annonce</label>
          <input v-model="form.titre" type="text" placeholder="Ex: Studio centre ville" required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Prix (€)</label>
                <input v-model="form.prix" type="number" placeholder="450" required />
            </div>
            <div class="form-group">
                <label>Lieu</label>
                <input v-model="form.lieu" type="text" placeholder="Amiens Sud" required />
            </div>
        </div>

        <div class="form-group">
          <label>URL de l'image principale</label>
          <input v-model="form.imageUrl" type="text" placeholder="https://..." />
          <small>Copie l'adresse d'une image sur internet pour tester</small>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.desc" rows="5" placeholder="Détails du logement..."></textarea>
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
            {{ loading ? 'Publication...' : 'Publier l\'offre' }}
        </button>

      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-page { padding: 100px 0; background: #f4f7f6; min-height: 100vh; }
.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
h1 { text-align: center; color: #01111d; margin-bottom: 30px; }
.form-group { margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
input, textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box;}
.btn-submit { width: 100%; background: #2563eb; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s; }
.btn-submit:hover { background: #1d4ed8; }
.success-box { background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
</style>