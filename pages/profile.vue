<script setup lang="ts">
definePageMeta({
  middleware: 'auth', // Utilise notre middleware personnalisé
  pageTransition: {
    name: 'auth',
    mode: 'out-in'
  }
})

import { ref, computed } from 'vue'

// Vérification de la session
const { signOut } = useAuth()
const { t } = useI18n()

// Fonction de déconnexion
const handleLogout = () => {
  confirmDeconnexion.value = true
}

const confirmerDeconnexion = async () => {
  confirmDeconnexion.value = false
  await signOut({ callbackUrl: '/' })
}

// Récupération des données utilisateur
const { data: userData, pending, error, refresh } = await useFetch('/api/profile/me')

const user = computed(() => userData.value || {
  prenom: '',
  nom: '',
  email: ''
})

const documents = computed(() => userData.value?.documents || [])

const passwordMasked = '••••••••••••'

// États pour les modales d'édition
const isEditingName = ref(false)
const isEditingEmail = ref(false)
const isEditingPassword = ref(false)

// Données temporaires pour l'édition
const editForm = ref({
  nom: '',
  prenom: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

// Fonction pour ouvrir l'édition du nom
const handleEditProfile = (field: string) => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (field === 'name') {
    editForm.value.nom = user.value.nom
    editForm.value.prenom = user.value.prenom || ''
    isEditingName.value = true
  } else if (field === 'email') {
    editForm.value.email = user.value.email
    isEditingEmail.value = true
  }
}

// Fonction pour sauvegarder le nom/prénom
const saveNameChanges = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/profile/update', {
      method: 'PATCH',
      body: {
        nom: editForm.value.nom,
        prenom: editForm.value.prenom
      }
    })

    successMessage.value = response.message
    isEditingName.value = false
    await refresh() // Recharger les données
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || t('errors.updateError')
  } finally {
    loading.value = false
  }
}

// Fonction pour sauvegarder l'email
const saveEmailChanges = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/profile/update', {
      method: 'PATCH',
      body: {
        email: editForm.value.email
      }
    })

    successMessage.value = response.message
    isEditingEmail.value = false
    await refresh()
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || t('errors.updateError')
  } finally {
    loading.value = false
  }
}

// Fonction pour modifier le mot de passe
const handleEditPassword = () => {
  errorMessage.value = ''
  successMessage.value = ''
  editForm.value.currentPassword = ''
  editForm.value.newPassword = ''
  editForm.value.confirmPassword = ''
  isEditingPassword.value = true
}

// Fonction pour sauvegarder le nouveau mot de passe
const savePasswordChanges = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation côté client
  if (!editForm.value.currentPassword || !editForm.value.newPassword || !editForm.value.confirmPassword) {
    errorMessage.value = t('errors.fillAllFields')
    return
  }

  if (editForm.value.newPassword !== editForm.value.confirmPassword) {
    errorMessage.value = t('errors.passwordsNoMatch')
    return
  }

  loading.value = true

  try {
    const response = await $fetch('/api/profile/update-password', {
      method: 'PATCH',
      body: {
        currentPassword: editForm.value.currentPassword,
        newPassword: editForm.value.newPassword
      }
    })

    successMessage.value = response.message
    isEditingPassword.value = false
    
    // Réinitialiser le formulaire
    editForm.value.currentPassword = ''
    editForm.value.newPassword = ''
    editForm.value.confirmPassword = ''
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || t('errors.passwordChangeError')
  } finally {
    loading.value = false
  }
}

const inputDocument = ref<HTMLInputElement | null>(null)
const uploadLoading = ref(false)
const uploadError = ref('')
const deletingId = ref<number | null>(null)
const documentASupprimer = ref<number | null>(null)
const confirmDeconnexion = ref(false)

const supprimerDocument = (id: number) => {
  documentASupprimer.value = id
}

const confirmerSuppression = async () => {
  if (!documentASupprimer.value) return
  deletingId.value = documentASupprimer.value
  documentASupprimer.value = null
  try {
    await $fetch('/api/profile/documents/delete', { method: 'POST', body: { id: deletingId.value } })
    await refresh()
  } catch (err: any) {
    uploadError.value = err.data?.message || t('errors.deleteError')
  } finally {
    deletingId.value = null
  }
}

const handleAddDocument = () => {
  uploadError.value = ''
  inputDocument.value?.click()
}

const onDocumentSelected = async (event: Event) => {
  const fichier = (event.target as HTMLInputElement).files?.[0]
  if (!fichier) return

  uploadLoading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('fichier', fichier)
    await $fetch('/api/profile/documents/upload', { method: 'POST', body: formData })
    await refresh()
  } catch (err: any) {
    uploadError.value = err.data?.message || t('errors.uploadError')
  } finally {
    uploadLoading.value = false
    ;(event.target as HTMLInputElement).value = ''
  }
}

// Validation du mot de passe en temps réel
const hasMinLength = computed(() => editForm.value.newPassword.length >= 12)
const hasUpper = computed(() => /[A-Z]/.test(editForm.value.newPassword))
const hasLower = computed(() => /[a-z]/.test(editForm.value.newPassword))
const hasNumber = computed(() => /\d/.test(editForm.value.newPassword))
const hasSpecial = computed(() => /[@$!%*?&_]/.test(editForm.value.newPassword))
const isPasswordValid = computed(() => 
  hasMinLength.value && hasUpper.value && hasLower.value && hasNumber.value && hasSpecial.value
)
</script>

<template>
  <div class="profile-page">
    
    <!-- État de chargement -->
    <div v-if="pending" class="Carte loading-state">
      <div class="loader"></div>
      <p>{{ $t('profile.loading') }}</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="Carte error-state">
      <div class="icon">⚠️</div>
      <h3>{{ $t('profile.errorLoading') }}</h3>
      <p>{{ error.message }}</p>
      <button @click="() => refresh()" class="btn-retry">{{ $t('profile.retry') }}</button>
    </div>

    <!-- Contenu principal -->
    <div v-else class="Carte">
        <div class="Haut_carte">
            <h1>{{ $t('profile.title') }}</h1>
            <button @click="handleLogout" class="btn-logout-desktop" title="Se déconnecter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                {{ $t('profile.logout') }}
            </button>
        </div>

        <!-- Messages de succès/erreur globaux -->
        <div v-if="successMessage" class="success-message">
          ✓ {{ successMessage }}
        </div>
        <div v-if="errorMessage && !isEditingName && !isEditingEmail && !isEditingPassword" class="error-message">
          ⚠ {{ errorMessage }}
        </div>

        <div class="Contenu_Profil">
            
            <div class="Profil_Header">
                <div class="Avatar_Profil">
                    <span class="Avatar_Initiales">{{ user.prenom?.[0] || 'U' }}{{ user.nom?.[0] || '' }}</span>
                </div>
                <div class="Info_Principales">
                    <div class="Editable_Field">
                        <h2 class="Nom_Complet">{{ user.prenom }} {{ user.nom }}</h2>
                        <button class="Btn_Edit_Icon" @click="handleEditProfile('name')" aria-label="Modifier le nom">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                    </div>
                    <div class="Editable_Field">
                        <p class="Email_User">{{ user.email }}</p>
                        <button class="Btn_Edit_Icon" @click="handleEditProfile('email')" aria-label="Modifier l'email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="Separateur"></div>

            <div class="Section_Securite">
                <div class="Groupe_Info">
                    <label>{{ $t('profile.password') }}</label>
                    <div class="Password_Row">
                        <span class="Password_Value">{{ passwordMasked }}</span>
                        <button @click="handleEditPassword" class="Lien_Modifier">{{ $t('profile.editBtn') }}</button>
                    </div>
                </div>
            </div>

            <div class="Separateur"></div>

            <div class="Section_Documents">
                <h3>{{ $t('profile.documents.title') }}</h3>
                
                <div v-if="documents.length > 0" class="Liste_Documents">
                    <div v-for="doc in documents" :key="doc.id" class="Document_Item">
                        <div class="Doc_Icone">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div class="Doc_Info">
                          <span class="Doc_Nom">{{ doc.nom }}</span>
                        </div>
                        <button class="Doc_Supprimer" @click="supprimerDocument(doc.id)" :disabled="deletingId === doc.id" aria-label="Supprimer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                    </div>
                </div>
                <div v-else class="empty-documents">
                  <p>{{ $t('profile.documents.none') }}</p>
                </div>

                <div v-if="uploadError" class="error-message">{{ uploadError }}</div>

                <input
                  ref="inputDocument"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  style="display: none"
                  @change="onDocumentSelected"
                >

                <Bouton @click="handleAddDocument" class="Btn_Ajout_Doc" :disabled="uploadLoading">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    {{ uploadLoading ? $t('profile.documents.uploading') : $t('profile.documents.add') }}
                </Bouton>
            </div>

        </div>
    </div>

    <!-- MODALE ÉDITION NOM/PRÉNOM -->
    <Transition name="modal">
      <div v-if="isEditingName" class="modal-overlay" @click.self="isEditingName = false">
        <div class="modal-content">
          <h3>{{ $t('profile.modals.editName') }}</h3>
          
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          
          <div class="Groupe_Input">
            <label>{{ $t('profile.modals.firstname') }}</label>
            <input v-model="editForm.prenom" type="text" class="Input_Style" placeholder="Votre prénom">
          </div>
          
          <div class="Groupe_Input">
            <label>{{ $t('profile.modals.lastname') }}</label>
            <input v-model="editForm.nom" type="text" class="Input_Style" placeholder="Votre nom">
          </div>
          
          <div class="modal-actions">
            <button @click="isEditingName = false" class="btn-cancel">{{ $t('profile.modals.cancel') }}</button>
            <button @click="saveNameChanges" :disabled="loading" class="btn-save">
              {{ loading ? $t('profile.modals.saving') : $t('profile.modals.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODALE ÉDITION EMAIL -->
    <Transition name="modal">
      <div v-if="isEditingEmail" class="modal-overlay" @click.self="isEditingEmail = false">
        <div class="modal-content">
          <h3>{{ $t('profile.modals.editEmail') }}</h3>
          
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          
          <div class="Groupe_Input">
            <label>{{ $t('profile.modals.newEmail') }}</label>
            <input v-model="editForm.email" type="email" class="Input_Style" placeholder="nouveau@email.com">
          </div>
          
          <div class="modal-actions">
            <button @click="isEditingEmail = false" class="btn-cancel">{{ $t('profile.modals.cancel') }}</button>
            <button @click="saveEmailChanges" :disabled="loading" class="btn-save">
              {{ loading ? $t('profile.modals.saving') : $t('profile.modals.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODALE MODIFICATION MOT DE PASSE -->
    <Transition name="modal">
      <div v-if="isEditingPassword" class="modal-overlay" @click.self="isEditingPassword = false">
        <div class="modal-content modal-password">
          <h3>{{ $t('profile.modals.editPassword') }}</h3>
          
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          
          <div class="Groupe_Input">
            <label>{{ $t('profile.modals.currentPassword') }}</label>
            <input v-model="editForm.currentPassword" type="password" class="Input_Style" placeholder="••••••••">
          </div>
          
          <div class="Groupe_Input">
            <label>{{ $t('profile.modals.newPassword') }}</label>
            <input v-model="editForm.newPassword" type="password" class="Input_Style" placeholder="••••••••">
            
            <!-- Checklist de validation -->
            <div v-if="editForm.newPassword.length > 0" class="password-checklist">
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
          
          <div class="Groupe_Input">
            <label>{{ $t('profile.modals.confirmNewPassword') }}</label>
            <input v-model="editForm.confirmPassword" type="password" class="Input_Style" placeholder="••••••••">
          </div>
          
          <div class="modal-actions">
            <button @click="isEditingPassword = false" class="btn-cancel">{{ $t('profile.modals.cancel') }}</button>
            <button @click="savePasswordChanges" :disabled="loading || !isPasswordValid" class="btn-save">
              {{ loading ? $t('profile.modals.saving') : $t('profile.modals.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODALE CONFIRMATION SUPPRESSION DOCUMENT -->
    <Transition name="modal">
      <div v-if="documentASupprimer !== null" class="modal-overlay" @click.self="documentASupprimer = null">
        <div class="modal-content modal-delete">
          <h3>{{ $t('profile.modals.deleteDocument') }}</h3>
          <p>{{ $t('profile.modals.deleteDocumentConfirm') }}</p>
          <div class="modal-actions">
            <button @click="documentASupprimer = null" class="btn-cancel">{{ $t('profile.modals.cancel') }}</button>
            <button @click="confirmerSuppression" class="btn-delete">{{ $t('profile.modals.deleteConfirm') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODALE CONFIRMATION DÉCONNEXION -->
    <Transition name="modal">
      <div v-if="confirmDeconnexion" class="modal-overlay" @click.self="confirmDeconnexion = false">
        <div class="modal-content modal-delete">
          <h3>{{ $t('profile.modals.logoutTitle') }}</h3>
          <p>{{ $t('profile.modals.logoutConfirm') }}</p>
          <div class="modal-actions">
            <button @click="confirmDeconnexion = false" class="btn-cancel">{{ $t('profile.modals.cancel') }}</button>
            <button @click="confirmerDeconnexion" class="btn-logout-confirm">{{ $t('profile.modals.confirmLogout') }}</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.profile-page {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f1f5f9;
    min-height: calc(100vh - 90px); 
    display: flex;
    flex-direction: column;
}

.Carte {
    background-color: white;
    width: 100%;
    max-width: 800px; 
    padding: 60px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    border-top: #2563EB 6px solid; 
    display: flex;
    flex-direction: column;
    margin: 80px auto; 
    box-sizing: border-box;
}

/* États de chargement et d'erreur */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563EB;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.btn-retry {
  background-color: #2563EB;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 15px;
}

/* Messages */
.success-message, .error-message {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.success-message {
  background-color: #dcfce7;
  color: #166534;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
}

@media (min-width: 1200px) {
    .Carte {
        max-width: 66%; 
    }
}

.Haut_carte {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.Haut_carte h1 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 900;
    color: #000;
}

/* Bouton de déconnexion desktop */
.btn-logout-desktop {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s;
}

.btn-logout-desktop:hover {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
    transform: translateY(-50%) scale(1.05);
}

.btn-logout-desktop svg {
    flex-shrink: 0;
}

.Contenu_Profil {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.Profil_Header {
    display: flex;
    align-items: center;
    gap: 25px;
}

.Avatar_Profil {
    width: 80px;
    height: 80px;
    background-color: #2563EB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 4px solid #f1f5f9;
}

.Avatar_Initiales {
    color: white;
    font-size: 1.8rem;
    font-weight: 700;
    text-transform: uppercase;
}

.Info_Principales {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.Editable_Field {
    display: flex;
    align-items: center;
    gap: 10px;
}

.Btn_Edit_Icon {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0;
}

.Editable_Field:hover .Btn_Edit_Icon {
    opacity: 1;
}

.Btn_Edit_Icon:hover {
    color: #2563EB;
    background-color: #f1f5f9;
}

.Nom_Complet {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
}

.Email_User {
    margin: 0;
    color: #64748b;
    font-size: 1rem;
}

.Separateur {
    height: 1px;
    background-color: #e2e8f0;
    width: 100%;
}

label {
    font-size: 0.9rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
}

.Password_Row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.Password_Value {
    font-size: 1.1rem;
    color: #334155;
    font-family: monospace;
    letter-spacing: 2px;
}

.Lien_Modifier {
    background: none;
    border: none;
    color: #2563EB;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background 0.2s;
}

.Lien_Modifier:hover {
    background-color: #dbeafe;
}

.Section_Documents h3 {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
}

.Liste_Documents {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 25px;
}

.Document_Item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: 0.2s;
}

.Document_Item:hover {
    border-color: #bfdbfe;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.Doc_Icone {
    color: #64748b;
    margin-right: 15px;
    display: flex;
}

.Doc_Info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.Doc_Nom {
    font-weight: 600;
    color: #334155;
}

.Doc_Supprimer {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.Doc_Supprimer:hover:not(:disabled) {
  color: #dc2626;
  background-color: #fee2e2;
}

.Doc_Supprimer:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-documents {
  text-align: center;
  padding: 30px;
  color: #64748b;
}

.Btn_Ajout_Doc {
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    align-self: flex-start;
    padding: 12px 24px;
}

/* MODALES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.modal-content h3 {
  margin: 0 0 25px 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.Groupe_Input {
  margin-bottom: 20px;
}

.Input_Style {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.Input_Style:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel, .btn-save {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-save {
  background: #2563EB;
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  background: #dc2626;
  border: none;
  color: white;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #b91c1c;
}

.modal-delete p {
  color: #64748b;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.btn-logout-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  background: #ef4444;
  border: none;
  color: white;
  transition: background 0.2s;
}

.btn-logout-confirm:hover {
  background: #dc2626;
}

/* Checklist mot de passe dans la modale */
.password-checklist {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
  font-size: 0.8rem;
  background-color: #f8fafc;
  padding: 12px;
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
  font-size: 0.9rem;
}

/* Animations des modales */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 768px) {
    .profile-page{
        min-height: auto; 
        padding-bottom: 40px;
    }

    .Carte {
        margin: 40px auto; 
        width: 90%;
        max-width: 100%;
        padding: 30px 20px; 
    }

    .Haut_carte {
        flex-direction: column;
        gap: 15px;
    }

    .Haut_carte h1 {
        font-size: 1.8rem;
    }

    /* Bouton déconnexion en dessous du titre sur mobile */
    .btn-logout-desktop {
        position: static;
        transform: none;
        width: 100%;
        max-width: 250px;
        justify-content: center;
    }

    .btn-logout-desktop:hover {
        transform: scale(1.05);
    }

    .Profil_Header {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .Info_Principales {
        align-items: center;
    }
    
    .Btn_Edit_Icon {
        opacity: 1;
        color: #2563EB;
    }

    .Password_Row {
        padding: 15px;
    }

    .Btn_Ajout_Doc {
        width: 100%;
    }

    .modal-content {
      padding: 30px 20px;
    }

    .modal-actions {
      flex-direction: column;
    }

    .btn-cancel, .btn-save {
      width: 100%;
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

    .Nom_Complet {
        font-size: 1.3rem;
    }
}
</style>