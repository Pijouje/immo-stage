<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── INTERFACES ──────────────────────────────────────────────────────────────

interface Auteur {
  id: number
  prenom: string
  nom: string
  avatar: string | null
}

interface AvisItem {
  id: number
  note: number
  commentaire: string
  auteurId: number
  offreId: number
  createdAt: string
  auteur: Auteur
}

interface Offre {
  id: number
  titre: string
}

interface AvisResponse {
  avis: AvisItem[]
  peutPoster: boolean
  aDejaPoste: boolean
  peutModerer: boolean
}

// ─── SESSION & RÔLE ──────────────────────────────────────────────────────────

const { data: session } = useAuth()

const isAdmin = computed(() => session.value?.user?.role === 'ADMIN')
const isProprietaire = computed(() => session.value?.user?.role === 'PROPRIETAIRE')
const canManage = computed(() => isAdmin.value || isProprietaire.value)

// ─── SÉLECTION DE L'OFFRE ────────────────────────────────────────────────────

// On récupère toutes les offres pour le sélecteur
const { data: offres } = await useFetch<Offre[]>('/api/offres')

const offreSelectionnee = ref<number | null>(null)

// Sélectionner la première offre par défaut
if (offres.value && offres.value.length > 0) {
  offreSelectionnee.value = offres.value[0].id
}

// ─── CHARGEMENT DES AVIS ─────────────────────────────────────────────────────

const avisData = ref<AvisResponse | null>(null)
const loadingAvis = ref(false)
const errorAvis = ref('')

const chargerAvis = async () => {
  if (!offreSelectionnee.value) return
  loadingAvis.value = true
  errorAvis.value = ''
  try {
    avisData.value = await $fetch<AvisResponse>('/api/avis', {
      query: { offreId: offreSelectionnee.value }
    })
  } catch (e: any) {
    errorAvis.value = e.data?.statusMessage || 'Erreur lors du chargement'
  } finally {
    loadingAvis.value = false
  }
}

// Charger au montage
await chargerAvis()

// Recharger quand l'offre change
watch(offreSelectionnee, chargerAvis)

// ─── STATISTIQUES CALCULÉES ──────────────────────────────────────────────────

const avis = computed(() => avisData.value?.avis || [])

const nbAvis = computed(() => avis.value.length)

const moyAvis = computed(() => {
  if (avis.value.length === 0) return '0'
  const total = avis.value.reduce((acc, a) => acc + a.note, 0)
  return (Math.round((total / avis.value.length) * 10) / 10).toString().replace('.', ',')
})

const moyenneNumerique = computed(() => {
  if (avis.value.length === 0) return 0
  const total = avis.value.reduce((acc, a) => acc + a.note, 0)
  return total / avis.value.length
})

// Distribution des notes (pour la barre de progression)
const distributionNotes = computed(() => {
  return [5, 4, 3, 2, 1].map(note => {
    const count = avis.value.filter(a => a.note === note).length
    const pct = nbAvis.value > 0 ? (count / nbAvis.value) * 100 : 0
    return { note, count, pct }
  })
})

// ─── FORMULAIRE D'AJOUT D'AVIS ───────────────────────────────────────────────

const formAvis = ref({ note: 5, commentaire: '' })
const noteHover = ref(0)
const loadingPost = ref(false)
const errorPost = ref('')
const successPost = ref('')

const peutPoster = computed(() => avisData.value?.peutPoster && !avisData.value?.aDejaPoste)
const aDejaPoste = computed(() => avisData.value?.aDejaPoste)
const peutModerer = computed(() => avisData.value?.peutModerer)

const posterAvis = async () => {
  if (!offreSelectionnee.value) return
  errorPost.value = ''
  successPost.value = ''
  loadingPost.value = true

  try {
    await $fetch('/api/avis/create', {
      method: 'POST',
      body: {
        offreId: offreSelectionnee.value,
        note: formAvis.value.note,
        commentaire: formAvis.value.commentaire
      }
    })
    successPost.value = 'Votre avis a été publié avec succès !'
    formAvis.value = { note: 5, commentaire: '' }
    await chargerAvis()
  } catch (e: any) {
    errorPost.value = e.data?.statusMessage || 'Erreur lors de la publication'
  } finally {
    loadingPost.value = false
  }
}

// ─── SUPPRESSION D'UN AVIS ───────────────────────────────────────────────────

const suppressionEnCours = ref<number | null>(null)

const supprimerAvis = async (avisId: number) => {
  if (!confirm('Supprimer cet avis définitivement ?')) return
  suppressionEnCours.value = avisId
  try {
    await $fetch(`/api/avis/${avisId}`, { method: 'DELETE' })
    await chargerAvis()
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Erreur lors de la suppression')
  } finally {
    suppressionEnCours.value = null
  }
}

// ─── MODAL "ACCORDER PERMISSION" (Admin/Proprio) ─────────────────────────────

const showGrantModal = ref(false)
const grantForm = ref({ userId: '', offreId: '' })
const loadingGrant = ref(false)
const errorGrant = ref('')
const successGrant = ref('')

// Liste des utilisateurs (pour le select)
const { data: utilisateurs } = await useFetch('/api/users')

const ouvrirGrantModal = () => {
  grantForm.value = {
    userId: '',
    offreId: offreSelectionnee.value?.toString() || ''
  }
  errorGrant.value = ''
  successGrant.value = ''
  showGrantModal.value = true
}

const accorderPermission = async () => {
  errorGrant.value = ''
  successGrant.value = ''

  if (!grantForm.value.userId || !grantForm.value.offreId) {
    errorGrant.value = 'Veuillez sélectionner un utilisateur et une offre'
    return
  }

  loadingGrant.value = true
  try {
    const res = await $fetch<{ message: string }>('/api/admin/grant-review', {
      method: 'POST',
      body: {
        userId: parseInt(grantForm.value.userId),
        offreId: parseInt(grantForm.value.offreId)
      }
    })
    successGrant.value = res.message
    await chargerAvis()
  } catch (e: any) {
    errorGrant.value = e.data?.statusMessage || 'Erreur lors de l\'attribution'
  } finally {
    loadingGrant.value = false
  }
}

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

const formaterDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const getInitiale = (auteur: Auteur) => {
  return (auteur.prenom?.[0] || '?').toUpperCase()
}

const labelNote = (note: number) => {
  const labels = ['', 'Décevant', 'Passable', 'Correct', 'Bien', 'Excellent']
  return labels[note] || ''
}
</script>

<template>
  <div class="page">

    <!-- ─── EN-TÊTE ──────────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-inner">
        <div class="header-left">
          <h1>Avis des locataires</h1>
          <p class="header-sub">Retours d'expérience vérifiés</p>
        </div>

        <!-- Sélecteur d'offre -->
        <div class="offre-selector">
          <label>Logement</label>
          <select v-model="offreSelectionnee" class="select-offre">
            <option v-for="o in offres" :key="o.id" :value="o.id">
              {{ o.titre }}
            </option>
          </select>
        </div>

        <!-- Bouton accorder permission (admin/proprio) -->
        <button
          v-if="canManage"
          @click="ouvrirGrantModal"
          class="btn-grant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Accorder un droit d'avis
        </button>
      </div>
    </div>

    <div class="page-body">

      <!-- ─── CHARGEMENT ───────────────────────────────────────── -->
      <div v-if="loadingAvis" class="state-center">
        <div class="spinner"></div>
        <p>Chargement des avis...</p>
      </div>

      <div v-else-if="errorAvis" class="state-center error-state">
        <span class="icon-big">⚠️</span>
        <p>{{ errorAvis }}</p>
        <button @click="chargerAvis" class="btn-retry">Réessayer</button>
      </div>

      <template v-else>

        <!-- ─── PANNEAU DE STATISTIQUES ──────────────────────────── -->
        <div class="stats-panel" v-if="nbAvis > 0">
          <div class="stats-score">
            <div class="score-number">{{ moyAvis }}</div>
            <div class="score-label">sur 5</div>
            <Etoile :note="moyenneNumerique" />
            <div class="score-count">{{ nbAvis }} avis</div>
          </div>

          <div class="stats-bars">
            <div v-for="item in distributionNotes" :key="item.note" class="bar-row">
              <span class="bar-label">{{ item.note }}★</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
              </div>
              <span class="bar-count">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <!-- ─── BLOC : FORMULAIRE POSTER UN AVIS ────────────────── -->

        <!-- CAS 1 : Utilisateur non connecté -->
        <div v-if="!session" class="form-placeholder">
          <div class="placeholder-icon">🔐</div>
          <p>Connectez-vous pour voir si vous pouvez laisser un avis.</p>
          <NuxtLink to="/connexion" class="btn-connect">Se connecter</NuxtLink>
        </div>

        <!-- CAS 2 : Déjà posté -->
        <div v-else-if="aDejaPoste" class="form-placeholder already">
          <div class="placeholder-icon">✅</div>
          <p>Vous avez déjà laissé un avis pour ce logement.</p>
        </div>

        <!-- CAS 3 : Pas de permission -->
        <div v-else-if="!peutPoster" class="form-placeholder">
          <div class="placeholder-icon">⏳</div>
          <p>Vous ne pouvez pas encore laisser d'avis sur ce logement.<br>
          <small>Cette fonctionnalité est réservée aux locataires vérifiés.</small></p>
        </div>

        <!-- CAS 4 : Permission accordée → Afficher le formulaire -->
        <div v-else class="form-card">
          <h2 class="form-title">
            <span class="form-badge">✦ Locataire vérifié</span>
            Laisser un avis
          </h2>

          <div v-if="successPost" class="msg-success">✓ {{ successPost }}</div>
          <div v-if="errorPost" class="msg-error">⚠ {{ errorPost }}</div>

          <!-- Sélecteur d'étoiles interactif -->
          <div class="stars-picker">
            <label>Votre note</label>
            <div class="stars-row">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="star-btn"
                :class="{ active: n <= (noteHover || formAvis.note) }"
                @click="formAvis.note = n"
                @mouseenter="noteHover = n"
                @mouseleave="noteHover = 0"
              >★</button>
              <span class="note-label">{{ labelNote(noteHover || formAvis.note) }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Votre commentaire</label>
            <textarea
              v-model="formAvis.commentaire"
              rows="4"
              placeholder="Décrivez votre expérience dans ce logement (min. 10 caractères)..."
              class="textarea"
              maxlength="1000"
            ></textarea>
            <span class="char-count">{{ formAvis.commentaire.length }}/1000</span>
          </div>

          <button
            @click="posterAvis"
            :disabled="loadingPost || formAvis.commentaire.length < 10"
            class="btn-submit"
          >
            {{ loadingPost ? 'Publication...' : 'Publier mon avis' }}
          </button>
        </div>

        <!-- ─── LISTE DES AVIS ────────────────────────────────────── -->
        <div class="avis-section">

          <h2 class="section-heading" v-if="nbAvis > 0">
            {{ nbAvis }} avis pour ce logement
          </h2>

          <!-- Aucun avis -->
          <div v-if="nbAvis === 0" class="state-center empty-state">
            <div class="empty-icon">💬</div>
            <h3>Aucun avis pour le moment</h3>
            <p>Soyez le premier à partager votre expérience !</p>
          </div>

          <!-- Liste -->
          <div v-else class="avis-list">
            <div v-for="a in avis" :key="a.id" class="avis-card">
              <div class="avis-header">
                <div class="avis-auteur">
                  <div class="auteur-avatar">{{ getInitiale(a.auteur) }}</div>
                  <div class="auteur-info">
                    <strong>{{ a.auteur.prenom }} {{ a.auteur.nom }}</strong>
                    <Etoile :note="a.note" />
                  </div>
                </div>
                <div class="avis-meta">
                  <span class="avis-date">{{ formaterDate(a.createdAt) }}</span>
                  <!-- Bouton supprimer (admin / proprio de l'offre) -->
                  <button
                    v-if="peutModerer"
                    @click="supprimerAvis(a.id)"
                    :disabled="suppressionEnCours === a.id"
                    class="btn-delete"
                    title="Supprimer cet avis"
                  >
                    <svg v-if="suppressionEnCours !== a.id" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    <span v-else>...</span>
                  </button>
                </div>
              </div>
              <p class="avis-commentaire">{{ a.commentaire }}</p>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- ─── MODALE ACCORDER PERMISSION ───────────────────────── -->
    <Transition name="modal">
      <div v-if="showGrantModal" class="modal-overlay" @click.self="showGrantModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Accorder un droit d'avis</h3>
            <button @click="showGrantModal = false" class="modal-close">✕</button>
          </div>

          <p class="modal-desc">
            Donnez à un locataire le droit de poster <strong>un seul avis</strong> sur une offre précise.
          </p>

          <div v-if="successGrant" class="msg-success">✓ {{ successGrant }}</div>
          <div v-if="errorGrant" class="msg-error">⚠ {{ errorGrant }}</div>

          <div class="form-group">
            <label>Locataire</label>
            <select v-model="grantForm.userId" class="select-input">
              <option value="">-- Sélectionner un utilisateur --</option>
              <option
                v-for="u in utilisateurs"
                :key="u.id"
                :value="u.id"
              >
                {{ u.prenom }} {{ u.nom }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Offre concernée</label>
            <select v-model="grantForm.offreId" class="select-input">
              <option value="">-- Sélectionner une offre --</option>
              <option v-for="o in offres" :key="o.id" :value="o.id">
                {{ o.titre }}
              </option>
            </select>
          </div>

          <div class="modal-actions">
            <button @click="showGrantModal = false" class="btn-cancel">Annuler</button>
            <button
              @click="accorderPermission"
              :disabled="loadingGrant || !grantForm.userId || !grantForm.offreId"
              class="btn-grant-confirm"
            >
              {{ loadingGrant ? 'Attribution...' : '✦ Accorder le droit' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* ─── VARIABLES ─────────────────────────────────────────────── */
.page {
  --navy: #01111d;
  --blue: #2563eb;
  --green: #10b981;
  --red: #ef4444;
  --gold: #FBBF24;
  --bg: #f4f7f6;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --muted: #64748b;

  background-image: url('/images/bg.png');
  background-size: cover;
  background-position: center;
  min-height: calc(100vh - 90px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* ─── EN-TÊTE ───────────────────────────────────────────────── */
.page-header {
  background-color: var(--navy);
  padding: 40px 5%;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.header-left {
  flex: 1;
  min-width: 200px;
}

.header-left h1 {
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.header-sub {
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Sélecteur d'offre */
.offre-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.offre-selector label {
  color: rgba(255,255,255,0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.select-offre {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 220px;
}

.select-offre option {
  background: var(--navy);
}

/* Bouton "Accorder un droit" */
.btn-grant {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--green), #059669);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}

.btn-grant:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16,185,129,0.4);
}

/* ─── CORPS ─────────────────────────────────────────────────── */
.page-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 5% 60px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ─── ÉTATS ─────────────────────────────────────────────────── */
.state-center {
  text-align: center;
  padding: 60px 20px;
  background: var(--card);
  border-radius: 16px;
  color: var(--muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state { background: #fef2f2; }
.btn-retry {
  margin-top: 12px;
  padding: 10px 24px;
  background: var(--red);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* ─── STATS ─────────────────────────────────────────────────── */
.stats-panel {
  background: var(--card);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  gap: 40px;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
}

.stats-score {
  text-align: center;
  min-width: 120px;
}

.score-number {
  font-size: 4rem;
  font-weight: 900;
  color: var(--text);
  line-height: 1;
}

.score-label {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 8px;
}

.score-count {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 8px;
}

.stats-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
}

.bar-label {
  width: 28px;
  color: var(--muted);
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), #f59e0b);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.bar-count {
  width: 20px;
  color: var(--muted);
  font-size: 0.8rem;
}

/* ─── PLACEHOLDER (pas de permission) ───────────────────────── */
.form-placeholder {
  background: var(--card);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  border: 2px dashed var(--border);
  color: var(--muted);
}

.form-placeholder.already {
  border-color: #d1fae5;
  background: #f0fdf4;
  color: #166534;
}

.placeholder-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.btn-connect {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--blue);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
}

/* ─── FORMULAIRE D'AVIS ─────────────────────────────────────── */
.form-card {
  background: var(--card);
  border-radius: 16px;
  padding: 35px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #d1fae5;
}

.form-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-badge {
  font-size: 0.75rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Étoiles interactives */
.stars-picker {
  margin-bottom: 20px;
}

.stars-picker label,
.form-group label {
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s;
  padding: 2px;
  line-height: 1;
}

.star-btn.active {
  color: var(--gold);
  transform: scale(1.1);
}

.star-btn:hover {
  transform: scale(1.2);
}

.note-label {
  margin-left: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
  color: var(--text);
}

.textarea:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
}

.char-count {
  position: absolute;
  bottom: 10px;
  right: 14px;
  font-size: 0.75rem;
  color: var(--muted);
}

.btn-submit {
  background: linear-gradient(135deg, var(--blue), #1d4ed8);
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── MESSAGES ───────────────────────────────────────────────── */
.msg-success {
  padding: 12px 16px;
  background: #dcfce7;
  color: #166534;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
}

.msg-error {
  padding: 12px 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* ─── LISTE DES AVIS ─────────────────────────────────────────── */
.avis-section {}

.section-heading {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 20px 0;
}

.empty-state {
  border: 2px dashed var(--border);
  background: var(--card);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.avis-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.avis-card {
  background: var(--card);
  border-radius: 14px;
  padding: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}

.avis-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.avis-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.avis-auteur {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auteur-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.auteur-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auteur-info strong {
  font-size: 0.95rem;
  color: var(--text);
}

.avis-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avis-date {
  font-size: 0.8rem;
  color: var(--muted);
}

.btn-delete {
  background: none;
  border: 1px solid #fecaca;
  color: var(--red);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #fee2e2;
  border-color: var(--red);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avis-commentaire {
  color: #334155;
  line-height: 1.65;
  font-size: 0.95rem;
  margin: 0;
  padding-left: 54px; /* Aligné avec le nom (avatar 42px + gap 12px) */
}

/* ─── MODALE ─────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(1, 17, 29, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: var(--card);
  border-radius: 20px;
  padding: 40px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-header h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.modal-close:hover { background: #f1f5f9; }

.modal-desc {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.select-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  box-sizing: border-box;
}

.select-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 28px;
}

.btn-cancel {
  padding: 12px 24px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: var(--muted);
  transition: background 0.2s;
}

.btn-cancel:hover { background: #f8fafc; }

.btn-grant-confirm {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--green), #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}

.btn-grant-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16,185,129,0.4);
}

.btn-grant-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── ANIMATIONS ─────────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s ease;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95) translateY(10px);
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .select-offre {
    width: 100%;
    min-width: unset;
  }

  .btn-grant {
    width: 100%;
    justify-content: center;
  }

  .stats-panel {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .stats-bars { width: 100%; }

  .avis-commentaire {
    padding-left: 0;
    margin-top: 10px;
  }

  .avis-header {
    flex-direction: column;
    gap: 10px;
  }

  .modal-box {
    padding: 25px 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel, .btn-grant-confirm {
    width: 100%;
  }

  .form-card {
    padding: 24px 20px;
  }
}
</style>