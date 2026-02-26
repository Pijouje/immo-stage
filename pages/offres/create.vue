<script setup>
import { ref, computed } from 'vue'

// Protection de la route
definePageMeta({
  middleware: 'auth'
})

// Vérification des permissions
const { data: session } = useAuth()
const router = useRouter()
const { t } = useI18n()

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
  titreEn: '',
  description: '',
  descriptionEn: '',
  prix: '',
  lieu: '',
  charges: '',
  caution: '',
  coloc: '',
  chambresDisponibles: '',
  surface: '',
  tags: []
})

// --- GESTION DES IMAGES (Upload fichiers) ---
const imageFiles = ref([])       // { file: File, preview: string, url: string, uploading: boolean }
const isDragging = ref(false)
const uploadError = ref('')

// Liste des équipements disponibles (clés françaises = valeurs stockées en BDD)
const equipementsDisponibles = [
  'WiFi / Fibre', 'Cuisine équipée', 'Lave-linge', 'Sèche-linge',
  'Lave-vaisselle', 'Parking', 'Balcon', 'Terrasse', 'Ascenseur',
  'Meublé', 'Cave', 'Gardien', 'Proche transports', 'Proche commerces'
]

// Traduction des tags selon la langue active
const tagKeyMap = {
  'WiFi / Fibre': 'wifiFibre', 'Cuisine équipée': 'cuisineEquipee', 'Lave-linge': 'laveLinge',
  'Sèche-linge': 'secheLinge', 'Lave-vaisselle': 'laveVaisselle', 'Parking': 'parking',
  'Balcon': 'balcon', 'Terrasse': 'terrasse', 'Ascenseur': 'ascenseur',
  'Meublé': 'meuble', 'Cave': 'cave', 'Gardien': 'gardien',
  'Proche transports': 'procheTransports', 'Proche commerces': 'procheCommerces'
}
const translateTag = (tag) => {
  const key = tagKeyMap[tag]
  return key ? t(`offers.tags.${key}`) : tag
}

// États de soumission
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Upload d'une image vers le serveur
const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  const result = await $fetch('/api/offres/upload', {
    method: 'POST',
    body: formData
  })
  return result.url
}

// Ajouter des fichiers images (depuis input ou drag & drop)
const ajouterImages = async (files) => {
  uploadError.value = ''
  const typesAutorises = ['image/jpeg', 'image/png', 'image/webp']
  const tailleMax = 5 * 1024 * 1024

  for (const file of files) {
    if (!typesAutorises.includes(file.type)) {
      uploadError.value = t('errors.formatNotAllowed', { name: file.name })
      continue
    }
    if (file.size > tailleMax) {
      uploadError.value = t('errors.fileSizeTooLarge', { name: file.name })
      continue
    }

    // Créer la preview locale
    const preview = URL.createObjectURL(file)
    const imageEntry = { file, preview, url: '', uploading: true }
    imageFiles.value.push(imageEntry)

    // Upload vers le serveur
    try {
      imageEntry.url = await uploadImage(file)
    } catch (e) {
      uploadError.value = t('errors.imageUploadFailed', { name: file.name })
      console.error(e)
    } finally {
      imageEntry.uploading = false
    }
  }
}

// Input file change
const onFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) ajouterImages(Array.from(files))
  event.target.value = '' // Reset pour permettre de re-sélectionner le même fichier
}

// Drag & Drop
const onDragOver = (e) => { e.preventDefault(); isDragging.value = true }
const onDragLeave = () => { isDragging.value = false }
const onDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) ajouterImages(Array.from(files))
}

// Supprimer une image
const supprimerImage = (index) => {
  URL.revokeObjectURL(imageFiles.value[index].preview)
  imageFiles.value.splice(index, 1)
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
    errorMessage.value = t('errors.requiredFields')
    return false
  }

  if (isNaN(Number(form.value.prix)) || Number(form.value.prix) <= 0) {
    errorMessage.value = t('errors.positivePrice')
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
    // Récupérer les URLs des images uploadées
    const imagesValides = imageFiles.value
      .filter(img => img.url && !img.uploading)
      .map(img => img.url)

    const response = await $fetch('/api/offres/create', {
      method: 'POST',
      body: {
        titre: form.value.titre,
        titreEn: form.value.titreEn || null,
        description: form.value.description,
        descriptionEn: form.value.descriptionEn || null,
        prix: Number(form.value.prix),
        lieu: form.value.lieu,
        charges: form.value.charges ? Number(form.value.charges) : 0,
        caution: form.value.caution ? Number(form.value.caution) : null,
        coloc: form.value.coloc ? Number(form.value.coloc) : 0,
        chambresDisponibles: form.value.chambresDisponibles ? Number(form.value.chambresDisponibles) : null,
        surface: form.value.surface ? Number(form.value.surface) : null,
        images: imagesValides,
        tags: form.value.tags
      }
    })

    successMessage.value = t('offers.create.successMessage')
    
    // Rediriger vers la page de l'offre créée après 2 secondes
    setTimeout(() => {
      router.push(`/offres/${response.offre.id}`)
    }, 2000)

  } catch (error) {
    console.error('Erreur:', error)
    errorMessage.value = error.data?.statusMessage || t('errors.createOfferError')
  } finally {
    loading.value = false
  }
}

// Réinitialiser le formulaire
const reinitialiserFormulaire = () => {
  form.value = {
    titre: '',
    titreEn: '',
    description: '',
    descriptionEn: '',
    prix: '',
    lieu: '',
    charges: '',
    caution: '',
    coloc: '',
    chambresDisponibles: '',
    surface: '',
    tags: []
  }
  // Libérer les previews
  imageFiles.value.forEach(img => URL.revokeObjectURL(img.preview))
  imageFiles.value = []
  uploadError.value = ''
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
        <h2>{{ $t('offers.create.noPermissionTitle') }}</h2>
        <p>{{ $t('offers.create.noPermissionMessage') }}</p>
        <NuxtLink to="/" class="btn-back">{{ $t('offers.create.noPermissionBack') }}</NuxtLink>
      </div>

      <!-- Formulaire -->
      <div v-else class="form-card">
        <div class="header">
          <h1>{{ $t('offers.create.pageTitle') }}</h1>
          <p class="subtitle">{{ $t('offers.create.pageSubtitle') }}</p>
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
            <h2 class="section-title">{{ $t('offers.create.sections.main') }}</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="titre">{{ $t('offers.create.fields.titleLabel') }}</label>
                <input
                  v-model="form.titre"
                  type="text"
                  id="titre"
                  :placeholder="$t('offers.create.fields.titlePlaceholder')"
                  class="input"
                  required
                >
              </div>
              <div class="form-group">
                <label for="titreEn">{{ $t('offers.create.fields.titleEnLabel') }}</label>
                <input
                  v-model="form.titreEn"
                  type="text"
                  id="titreEn"
                  :placeholder="$t('offers.create.fields.titleEnPlaceholder')"
                  class="input"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="description">{{ $t('offers.create.fields.descriptionLabel') }}</label>
                <textarea
                  v-model="form.description"
                  id="description"
                  rows="6"
                  :placeholder="$t('offers.create.fields.descriptionPlaceholder')"
                  class="input textarea"
                  required
                ></textarea>
                <small class="help-text">{{ $t('offers.create.fields.descChars', { n: form.description.length }) }}</small>
              </div>
              <div class="form-group">
                <label for="descriptionEn">{{ $t('offers.create.fields.descriptionEnLabel') }}</label>
                <textarea
                  v-model="form.descriptionEn"
                  id="descriptionEn"
                  rows="6"
                  :placeholder="$t('offers.create.fields.descriptionEnPlaceholder')"
                  class="input textarea"
                ></textarea>
                <small class="help-text">{{ $t('offers.create.fields.descChars', { n: form.descriptionEn.length }) }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="prix">{{ $t('offers.create.fields.rentLabel') }}</label>
                <input
                  v-model="form.prix"
                  type="number"
                  id="prix"
                  :placeholder="$t('offers.create.fields.rentPlaceholder')"
                  class="input"
                  min="0"
                  required
                >
              </div>

              <div class="form-group">
                <label for="charges">{{ $t('offers.create.fields.chargesLabel') }}</label>
                <input
                  v-model="form.charges"
                  type="number"
                  id="charges"
                  :placeholder="$t('offers.create.fields.chargesPlaceholder')"
                  class="input"
                  min="0"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="lieu">{{ $t('offers.create.fields.locationLabel') }}</label>
                <input
                  v-model="form.lieu"
                  type="text"
                  id="lieu"
                  :placeholder="$t('offers.create.fields.locationPlaceholder')"
                  class="input"
                  required
                >
              </div>

              <div class="form-group">
                <label for="surface">{{ $t('offers.create.fields.surfaceLabel') }}</label>
                <input
                  v-model="form.surface"
                  type="number"
                  id="surface"
                  :placeholder="$t('offers.create.fields.surfacePlaceholder')"
                  class="input"
                  min="0"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="caution">{{ $t('offers.create.fields.depositLabel') }}</label>
                <input
                  v-model="form.caution"
                  type="number"
                  id="caution"
                  :placeholder="$t('offers.create.fields.depositPlaceholder')"
                  class="input"
                  min="0"
                >
              </div>

              <div class="form-group">
                <label for="coloc">{{ $t('offers.create.fields.roommatesLabel') }}</label>
                <input
                  v-model="form.coloc"
                  type="number"
                  id="coloc"
                  :placeholder="$t('offers.create.fields.roomatesPlaceholder')"
                  class="input"
                  min="0"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="chambresDisponibles">{{ $t('offers.create.fields.availableRoomsLabel') }}</label>
                <input
                  v-model="form.chambresDisponibles"
                  type="number"
                  id="chambresDisponibles"
                  :placeholder="$t('offers.create.fields.availableRoomsPlaceholder')"
                  class="input"
                  min="0"
                >
                <small class="help-text">{{ $t('offers.create.fields.availableRoomsHint') }}</small>
              </div>
              <div class="form-group"></div>
            </div>
          </div>

          <!-- Images (Upload fichiers) -->
          <div class="section">
            <h2 class="section-title">{{ $t('offers.create.sections.images') }}</h2>
            <p class="section-description">{{ $t('offers.create.images.description') }}</p>

            <!-- Zone de drop -->
            <div
              class="drop-zone"
              :class="{ 'dragging': isDragging }"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                @change="onFileSelect"
              >
              <div class="drop-content">
                <span class="drop-icon">📷</span>
                <span class="drop-text">
                  {{ isDragging ? $t('offers.create.images.dropHere') : $t('offers.create.images.clickOrDrop') }}
                </span>
                <span class="drop-hint">{{ $t('offers.create.images.hint') }}</span>
              </div>
            </div>

            <!-- Erreur upload -->
            <div v-if="uploadError" class="upload-error">⚠ {{ uploadError }}</div>

            <!-- Previews -->
            <div v-if="imageFiles.length > 0" class="image-previews">
              <div v-for="(img, index) in imageFiles" :key="index" class="image-preview">
                <img :src="img.preview" alt="Preview" class="preview-img">
                <div v-if="img.uploading" class="upload-overlay">
                  <span class="spinner"></span>
                </div>
                <div v-else-if="img.url" class="upload-success">✓</div>
                <button @click.prevent="supprimerImage(index)" class="btn-remove-img" type="button">✕</button>
              </div>
            </div>
          </div>

          <!-- Équipements -->
          <div class="section">
            <h2 class="section-title">{{ $t('offers.create.sections.amenities') }}</h2>
            <p class="section-description">{{ $t('offers.create.amenities.description') }}</p>

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
                {{ translateTag(equip) }}
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
              {{ $t('offers.create.resetBtn') }}
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="loading"
            >
              {{ loading ? $t('offers.create.submitting') : $t('offers.create.submitBtn') }}
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

/* Images Upload */
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
}

.drop-zone:hover {
  border-color: #2563eb;
  background: #f0f9ff;
}

.drop-zone.dragging {
  border-color: #2563eb;
  background: #eff6ff;
  transform: scale(1.01);
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-icon { font-size: 2.5rem; }
.drop-text { font-weight: 700; font-size: 1rem; color: #334155; }
.drop-hint { font-size: 0.85rem; color: #94a3b8; }

.upload-error {
  margin-top: 10px;
  padding: 10px 15px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}

.spinner {
  width: 24px; height: 24px;
  border: 3px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.upload-success {
  position: absolute; bottom: 6px; right: 6px;
  background: #16a34a; color: white;
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
}

.btn-remove-img {
  position: absolute; top: 4px; right: 4px;
  background: rgba(239, 68, 68, 0.9); color: white;
  border: none; border-radius: 50%;
  width: 24px; height: 24px;
  cursor: pointer; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}

.image-preview:hover .btn-remove-img { opacity: 1; }

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