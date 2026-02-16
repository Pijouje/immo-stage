<script setup>
import { ref, computed } from 'vue'

// Protection de la route
definePageMeta({
  middleware: 'auth'
})

// Vérification des permissions
const { data: session } = useAuth()
const router = useRouter()

// Vérifier que l'utilisateur a le bon rôle
const hasPermission = computed(() => {
  const role = session.value?.user?.role
  return role === 'ADMIN' || role === 'PROPRIETAIRE'
})

// Rediriger si pas les permissions
if (!hasPermission.value && session.value) {
  router.push('/')
}

// États du formulaire
const form = ref({
  titre: '',
  description: '',
  prix: '',
  lieu: '',
  charges: '',
  caution: '',
  coloc: '',
  surface: '',
  images: [''],
  tags: []
})

// Liste des équipements disponibles
const equipementsDisponibles = [
  'WiFi / Fibre',
  'Cuisine équipée',
  'Lave-linge',
  'Sèche-linge',
  'Lave-vaisselle',
  'Parking',
  'Balcon',
  'Terrasse',
  'Ascenseur',
  'Meublé',
  'Cave',
  'Gardien',
  'Proche transports',
  'Proche commerces'
]

// États de soumission
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Ajouter un champ d'image
const ajouterImage = () => {
  form.value.images.push('')
}

// Supprimer un champ d'image
const supprimerImage = (index) => {
  if (form.value.images.length > 1) {
    form.value.images.splice(index, 1)
  }
}

// Toggle équipement
const toggleEquipement = (equip) => {
  const index = form.value.tags.indexOf(equip)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  } else {
    form.value.tags.push(equip)
  }
}

// Validation du formulaire
const validerFormulaire = () => {
  errorMessage.value = ''

  if (!form.value.titre || !form.value.description || !form.value.prix || !form.value.lieu) {
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires (titre, description, prix, lieu)'
    return false
  }

  if (isNaN(Number(form.value.prix)) || Number(form.value.prix) <= 0) {
    errorMessage.value = 'Le prix doit être un nombre positif'
    return false
  }

  return true
}

// Soumission du formulaire
const soumettreOffre = async () => {
  if (!validerFormulaire()) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Filtrer les images vides
    const imagesValides = form.value.images.filter(url => url && url.trim() !== '')

    const response = await $fetch('/api/offres/create', {
      method: 'POST',
      body: {
        titre: form.value.titre,
        description: form.value.description,
        prix: Number(form.value.prix),
        lieu: form.value.lieu,
        charges: form.value.charges ? Number(form.value.charges) : 0,
        caution: form.value.caution ? Number(form.value.caution) : null,
        coloc: form.value.coloc ? Number(form.value.coloc) : 0,
        surface: form.value.surface ? Number(form.value.surface) : null,
        images: imagesValides,
        tags: form.value.tags
      }
    })

    successMessage.value = 'Offre créée avec succès ! Redirection...'
    
    // Rediriger vers la page de l'offre créée après 2 secondes
    setTimeout(() => {
      router.push(`/offres/${response.offre.id}`)
    }, 2000)

  } catch (error) {
    console.error('Erreur:', error)
    errorMessage.value = error.data?.statusMessage || 'Une erreur est survenue lors de la création de l\'offre'
  } finally {
    loading.value = false
  }
}

// Réinitialiser le formulaire
const reinitialiserFormulaire = () => {
  form.value = {
    titre: '',
    description: '',
    prix: '',
    lieu: '',
    charges: '',
    caution: '',
    coloc: '',
    surface: '',
    images: [''],
    tags: []
  }
  errorMessage.value = ''
  successMessage.value = ''
}
</script>

<template>
  <div class="create-page">
    <div class="container">

      <!-- Message si pas de permission -->
      <div v-if="!hasPermission" class="no-permission">
        <div class="icon">🔒</div>
        <h2>Accès refusé</h2>
        <p>Seuls les administrateurs et propriétaires peuvent créer des offres.</p>
        <NuxtLink to="/" class="btn-back">Retour à l'accueil</NuxtLink>
      </div>

      <!-- Formulaire -->
      <div v-else class="form-card">
        <div class="header">
          <h1>Créer une nouvelle offre</h1>
          <p class="subtitle">Remplissez les informations de votre logement</p>
        </div>

        <!-- Messages -->
        <div v-if="successMessage" class="success-message">
          ✓ {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="error-message">
          ⚠ {{ errorMessage }}
        </div>

        <form @submit.prevent="soumettreOffre" class="form">

          <!-- Informations principales -->
          <div class="section">
            <h2 class="section-title">Informations principales</h2>

            <div class="form-group">
              <label for="titre">Titre de l'annonce *</label>
              <input 
                v-model="form.titre" 
                type="text" 
                id="titre" 
                placeholder="Ex: T2 meublé centre-ville Amiens"
                class="input"
                required
              >
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea 
                v-model="form.description" 
                id="description" 
                rows="6"
                placeholder="Décrivez votre logement en détail..."
                class="input textarea"
                required
              ></textarea>
              <small class="help-text">{{ form.description.length }} caractères</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="prix">Loyer mensuel (€) *</label>
                <input 
                  v-model="form.prix" 
                  type="number" 
                  id="prix" 
                  placeholder="500"
                  class="input"
                  min="0"
                  required
                >
              </div>

              <div class="form-group">
                <label for="charges">Charges (€)</label>
                <input 
                  v-model="form.charges" 
                  type="number" 
                  id="charges" 
                  placeholder="50"
                  class="input"
                  min="0"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="lieu">Ville / Quartier *</label>
                <input 
                  v-model="form.lieu" 
                  type="text" 
                  id="lieu" 
                  placeholder="Amiens Centre"
                  class="input"
                  required
                >
              </div>

              <div class="form-group">
                <label for="surface">Surface (m²)</label>
                <input 
                  v-model="form.surface" 
                  type="number" 
                  id="surface" 
                  placeholder="45"
                  class="input"
                  min="0"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="caution">Caution (€)</label>
                <input 
                  v-model="form.caution" 
                  type="number" 
                  id="caution" 
                  placeholder="1000"
                  class="input"
                  min="0"
                >
              </div>

              <div class="form-group">
                <label for="coloc">Nombre de colocataires</label>
                <input 
                  v-model="form.coloc" 
                  type="number" 
                  id="coloc" 
                  placeholder="0"
                  class="input"
                  min="0"
                >
              </div>
            </div>
          </div>

          <!-- Images -->
          <div class="section">
            <h2 class="section-title">Images du logement</h2>
            <p class="section-description">Ajoutez des URLs d'images (hébergées en ligne)</p>

            <div v-for="(image, index) in form.images" :key="index" class="image-input-group">
              <input 
                v-model="form.images[index]" 
                type="url" 
                :placeholder="`URL de l'image ${index + 1}`"
                class="input"
              >
              <button 
                v-if="form.images.length > 1"
                @click.prevent="supprimerImage(index)" 
                class="btn-remove"
                type="button"
              >
                ✕
              </button>
            </div>

            <button @click.prevent="ajouterImage" class="btn-add-image" type="button">
              + Ajouter une image
            </button>
          </div>

          <!-- Équipements -->
          <div class="section">
            <h2 class="section-title">Équipements et services</h2>
            <p class="section-description">Sélectionnez les équipements disponibles</p>

            <div class="equipements-grid">
              <button
                v-for="equip in equipementsDisponibles"
                :key="equip"
                @click.prevent="toggleEquipement(equip)"
                class="equipement-tag"
                :class="{ 'selected': form.tags.includes(equip) }"
                type="button"
              >
                <span class="check-icon">{{ form.tags.includes(equip) ? '✓' : '' }}</span>
                {{ equip }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button 
              @click.prevent="reinitialiserFormulaire" 
              class="btn-secondary"
              type="button"
            >
              Réinitialiser
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="loading"
            >
              {{ loading ? 'Publication en cours...' : 'Publier l\'offre' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: calc(100vh - 90px);
  background-color: #f4f7f6;
  background-image: url('/images/bg.png');
  background-size: cover;
  padding: 60px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* No Permission */
.no-permission {
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.no-permission .icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-permission h2 {
  color: #ef4444;
  margin-bottom: 15px;
}

.btn-back {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

/* Messages */
.success-message,
.error-message {
  margin: 20px 40px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
}

.success-message {
  background: #dcfce7;
  color: #166534;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
}

/* Form */
.form {
  padding: 40px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.section-description {
  color: #64748b;
  font-size: 0.9rem;
  margin: 10px 0 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.help-text {
  display: block;
  margin-top: 5px;
  font-size: 0.85rem;
  color: #64748b;
}

/* Images */
.image-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.image-input-group .input {
  flex: 1;
}

.btn-remove {
  background: #ef4444;
  color: white;
  border: none;
  width: 40px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #dc2626;
}

.btn-add-image {
  background: none;
  border: 2px dashed #cbd5e1;
  color: #64748b;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.2s;
}

.btn-add-image:hover {
  border-color: #2563eb;
  color: #2563eb;
}

/* Équipements */
.equipements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.equipement-tag {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.equipement-tag:hover {
  border-color: #2563eb;
  background: #f0f9ff;
}

.equipement-tag.selected {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.check-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid currentColor;
  text-align: center;
  line-height: 16px;
  font-size: 0.75rem;
}

.equipement-tag.selected .check-icon {
  background: white;
  color: #2563eb;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 14px 30px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 30px 20px;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .form {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .equipements-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>