<script setup lang="ts">

definePageMeta({
  pageTransition: {
    name: 'hero-flow',
    mode: 'out-in'
  }
})

// SEO : Meta tags
useSeoMeta({
  title: 'Offres de Location Étudiante à Amiens | Agence Immo',
  description: 'Consultez toutes nos offres de location étudiante à Amiens : studios, T2, T3, colocations meublées. Prix, photos et avis de locataires pour chaque logement.',
  ogTitle: 'Offres de Location Étudiante à Amiens',
  ogDescription: 'Consultez toutes nos offres de location étudiante à Amiens. Studios, appartements et colocations meublées.',
  ogUrl: 'https://ton-site-stage.com/offres',
})

// SEO : Breadcrumb JSON-LD
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://ton-site-stage.com' },
          { '@type': 'ListItem', position: 2, name: 'Offres de location', item: 'https://ton-site-stage.com/offres' },
        ],
      }),
    },
  ],
})

const { t, locale } = useI18n()
const { data: session } = useAuth()

const canCreateOffre = computed(() => {
  const role = session.value?.user?.role
  return role === 'ADMIN' || role === 'PROPRIETAIRE'
})

// Onglet actif (visible uniquement pour PROPRIETAIRE/ADMIN)
const currentTab = ref<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE')

const changeTab = (tab: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => {
  currentTab.value = tab
  page.value = 1
}

// Suppression (soft delete ou permanent)
const deleteTarget = ref<{ id: number; titre: string } | null>(null)
const deleting = ref(false)
const isPermanentDelete = ref(false)

const confirmDelete = (id: number, titre: string, permanent: boolean = false) => {
  deleteTarget.value = { id, titre }
  isPermanentDelete.value = permanent
}

const cancelDelete = () => {
  deleteTarget.value = null
  isPermanentDelete.value = false
}

const deleteOffre = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const url = isPermanentDelete.value
      ? `/api/offres/${deleteTarget.value.id}?permanent=true`
      : `/api/offres/${deleteTarget.value.id}`
    await $fetch(url, { method: 'DELETE' })
    deleteTarget.value = null
    isPermanentDelete.value = false
    await refresh()
  } catch (e) {
    console.error(e)
    deleteTarget.value = null
    isPermanentDelete.value = false
  } finally {
    deleting.value = false
  }
}

// Toggle activer/désactiver
const togglingId = ref<number | null>(null)

const toggleStatus = async (id: number) => {
  togglingId.value = id
  try {
    await $fetch(`/api/offres/${id}/toggle-status`, { method: 'POST' })
    await refresh()
  } catch (e) {
    console.error(e)
  } finally {
    togglingId.value = null
  }
}

// Restaurer depuis la corbeille
const restoringId = ref<number | null>(null)

const restoreOffre = async (id: number) => {
  restoringId.value = id
  try {
    await $fetch(`/api/offres/${id}/restore`, { method: 'POST' })
    await refresh()
  } catch (e) {
    console.error(e)
  } finally {
    restoringId.value = null
  }
}

const page = ref(1)

const statusQuery = computed(() => {
  if (!canCreateOffre.value) return undefined
  return currentTab.value
})

const { data, pending, error, refresh } = await useFetch('/api/offres', {
  query: { page, status: statusQuery },
  lazy: true,
  watch: [page, statusQuery]
})

const offres = computed(() => data.value?.offres ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 1)

// SEO : Schema ItemList dynamique pour les offres
const itemListSchema = computed(() => {
  if (!offres.value || offres.value.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Offres de location étudiante à Amiens',
    numberOfItems: offres.value.length,
    itemListElement: offres.value.map((offre: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://ton-site-stage.com/offres/${offre.id}`,
      name: offre.titre,
    })),
  }
})

useHead({
  script: computed(() => {
    if (!itemListSchema.value) return []
    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(itemListSchema.value),
    }]
  }),
})

const retryFetch = async () => {
  error.value = undefined
  await refresh()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

</script>

<template>
  <section class="offres-page" aria-label="Liste des offres de location">
    <div class="container">

      <h1 class="sr-only">Offres de location étudiante à Amiens</h1>

      <!-- Bouton flottant "Créer une offre" (visible uniquement pour admin/proprio) -->
      <NuxtLink
        v-if="canCreateOffre"
        to="/offres/create"
        class="btn-floating-create"
        title="Créer une nouvelle offre"
        aria-label="Créer une nouvelle offre de location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span class="btn-text">{{ $t('offers.createOffer') }}</span>
      </NuxtLink>

      <!-- ONGLETS (visibles uniquement pour PROPRIETAIRE/ADMIN) -->
      <div v-if="canCreateOffre" class="tabs-bar">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'ACTIVE' }"
          @click="changeTab('ACTIVE')"
        >
          {{ $t('offers.tabs.active') }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'INACTIVE' }"
          @click="changeTab('INACTIVE')"
        >
          {{ $t('offers.tabs.inactive') }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'ARCHIVED' }"
          @click="changeTab('ARCHIVED')"
        >
          {{ $t('offers.tabs.archived') }}
        </button>
      </div>

      <div v-if="error" class="state-box error-box" role="alert">
        <div class="icon" aria-hidden="true">⚠️</div>
        <h2>{{ $t('offers.errorTitle') }}</h2>
        <p>{{ $t('offers.errorMessage') }}</p>
        <button @click="retryFetch" class="btn-retry">{{ $t('offers.retry') }}</button>
      </div>

      <div v-else-if="pending" class="state-box loading-box" aria-live="polite">
        <div class="loader" aria-hidden="true"></div>
        <p>{{ $t('offers.loading') }}</p>
      </div>

      <!-- Empty states selon l'onglet -->
      <div v-else-if="!offres || offres.length === 0" class="state-box empty-box">
        <template v-if="currentTab === 'ARCHIVED' && canCreateOffre">
          <div class="icon" aria-hidden="true">🗑️</div>
          <h2>{{ $t('offers.emptyTrash') }}</h2>
          <p>{{ $t('offers.emptyTrashMessage') }}</p>
        </template>
        <template v-else-if="currentTab === 'INACTIVE' && canCreateOffre">
          <div class="icon" aria-hidden="true">⏸️</div>
          <h2>{{ $t('offers.noInactiveOffers') }}</h2>
          <p>{{ $t('offers.noInactiveOffersMessage') }}</p>
        </template>
        <template v-else>
          <div class="icon" aria-hidden="true">📭</div>
          <h2>{{ $t('offers.noOffers') }}</h2>
          <p>{{ $t('offers.noOffersMessage') }}</p>
          <NuxtLink v-if="canCreateOffre" to="/offres/create" class="btn-create-first">
            {{ $t('offers.createFirst') }}
          </NuxtLink>
        </template>
      </div>

      <div v-else class="offres-grid">
        <article
          v-for="offre in offres"
          :key="offre.id"
          class="card"
          :class="{ 'card-inactive': offre.status === 'INACTIVE', 'card-archived': offre.status === 'ARCHIVED' }"
        >
          <div class="card-image">
            <img
              :src="offre.image || '/images/default.png'"
              :alt="`${offre.titre} - Location à ${offre.lieu}`"
              loading="lazy"
              width="350"
              height="220"
            >
            <!-- Badge de statut -->
            <span v-if="offre.status === 'INACTIVE'" class="badge badge-inactive">
              {{ $t('offers.status.inactive') }}
            </span>
            <span v-if="offre.status === 'ARCHIVED'" class="badge badge-archived">
              {{ $t('offers.status.archived') }}
            </span>
          </div>
          <div class="card-content">
            <h2>{{ offre.titre }}</h2>
            <p class="location">
              <span class="pin" aria-hidden="true">📍</span> {{ offre.lieu }}
            </p>
            <p class="price"><strong>{{ offre.prix }}</strong> /mois</p>

            <!-- Date d'archivage -->
            <p v-if="offre.status === 'ARCHIVED' && offre.archivedAt" class="archived-date">
              {{ $t('offers.archivedOn', { date: formatDate(offre.archivedAt) }) }}
            </p>

            <div class="card-action">
             <OffreBouton :to="`/offres/${offre.id}`">
               {{ $t('offers.viewOffer') }}
             </OffreBouton>

             <!-- Actions pour les offres ACTIVES -->
             <template v-if="canCreateOffre && currentTab === 'ACTIVE'">
               <button
                 @click.prevent="toggleStatus(offre.id)"
                 class="btn-action-card btn-toggle-card"
                 :title="$t('offers.deactivate')"
                 :disabled="togglingId === offre.id"
               >
                 ⏸️
               </button>
               <button
                 @click.prevent="confirmDelete(offre.id, offre.titre)"
                 class="btn-delete-card"
                 :title="$t('offers.moveToTrash')"
               >
                 🗑️
               </button>
             </template>

             <!-- Actions pour les offres INACTIVES -->
             <template v-if="canCreateOffre && currentTab === 'INACTIVE'">
               <button
                 @click.prevent="toggleStatus(offre.id)"
                 class="btn-action-card btn-activate-card"
                 :title="$t('offers.activate')"
                 :disabled="togglingId === offre.id"
               >
                 ▶️
               </button>
               <button
                 @click.prevent="confirmDelete(offre.id, offre.titre)"
                 class="btn-delete-card"
                 :title="$t('offers.moveToTrash')"
               >
                 🗑️
               </button>
             </template>

             <!-- Actions pour les offres ARCHIVÉES -->
             <template v-if="canCreateOffre && currentTab === 'ARCHIVED'">
               <button
                 @click.prevent="restoreOffre(offre.id)"
                 class="btn-action-card btn-restore-card"
                 :title="$t('offers.restore')"
                 :disabled="restoringId === offre.id"
               >
                 ↩️
               </button>
               <button
                 @click.prevent="confirmDelete(offre.id, offre.titre, true)"
                 class="btn-delete-card btn-permanent-delete"
                 :title="$t('offers.permanentDelete')"
               >
                 ❌
               </button>
             </template>
            </div>
          </div>
        </article>
      </div>

      <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination des offres">
        <button :disabled="page <= 1" @click="page--" class="page-btn" aria-label="Page précédente">{{ $t('common.prev') }}</button>
        <span class="page-info" aria-current="page">{{ $t('common.page', { page: page, total: totalPages }) }}</span>
        <button :disabled="page >= totalPages" @click="page++" class="page-btn" aria-label="Page suivante">{{ $t('common.next') }}</button>
      </nav>

    </div>

    <!-- MODALE CONFIRMATION SUPPRESSION -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="delete-overlay" @click.self="cancelDelete">
        <div class="delete-modal" role="dialog" aria-modal="true" :aria-label="isPermanentDelete ? $t('offers.permanentDeleteConfirmTitle') : $t('offers.moveToTrashConfirmTitle')">
          <h2>{{ isPermanentDelete ? $t('offers.permanentDeleteConfirmTitle') : $t('offers.moveToTrashConfirmTitle') }}</h2>
          <p>{{ isPermanentDelete ? $t('offers.permanentDeleteConfirmMessage') : $t('offers.moveToTrashConfirmMessage') }}</p>
          <p class="delete-modal-name">« {{ deleteTarget.titre }} »</p>
          <div class="delete-modal-actions">
            <button @click="cancelDelete" class="btn-cancel-delete" :disabled="deleting">
              {{ $t('offers.deleteCancel') }}
            </button>
            <button @click="deleteOffre" class="btn-confirm-delete" :disabled="deleting">
              {{ deleting ? $t('offers.deleting') : (isPermanentDelete ? $t('offers.permanentDeleteConfirmBtn') : $t('offers.moveToTrash')) }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.offres-page {
  box-sizing: border-box;
  min-height: calc(100vh - 90px);
  width: 100%;
  background-color: #f4f7f6;
  background-image: url('/images/bg.png');
  background-size: cover;
  background-position: center;
  padding: 120px 0 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
}

/* Bouton flottant "Créer une offre" */
.btn-floating-create {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 50px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
  z-index: 100;
}

.btn-floating-create:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
}

.btn-floating-create svg {
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
}

/* Responsive : Bouton plus compact sur mobile */
@media (max-width: 768px) {
  .btn-floating-create {
    bottom: 20px;
    right: 20px;
    padding: 14px 20px;
    font-size: 0.9rem;
  }

  .btn-text {
    display: none; /* Masquer le texte sur mobile, garder juste l'icône */
  }

  .btn-floating-create {
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }
}

/* ===== ONGLETS ===== */
.tabs-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  max-width: 420px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #01111d;
  background: #f1f5f9;
}

.tab-btn.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* Bouton de création pour l'état vide */
.btn-create-first {
  display: inline-block;
  margin-top: 20px;
  padding: 14px 30px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-create-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.state-box {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  max-width: 600px;
  margin: 0 auto;
}

.state-box .icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.state-box h3 {
  color: #01111d;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.state-box p {
  color: #64748b;
  margin-bottom: 25px;
}

/* Style spécifique Erreur */
.error-box {
  border: 2px solid #fee2e2;
  background: #fef2f2;
}
.error-box h3 { color: #991b1b; }
.error-box p { color: #b91c1c; }

.btn-retry {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-retry:hover {
  background-color: #dc2626;
  transform: scale(1.05);
}

/* Style Chargement */
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

.offres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  justify-items: center;
}

/* STYLE DE LA CARTE */
.card {
  background: white;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 350px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
}

.card-inactive {
  opacity: 0.7;
  border: 2px solid #f59e0b;
}

.card-archived {
  opacity: 0.6;
  border: 2px solid #ef4444;
}

.card-image {
  position: relative;
}

.card-image img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

/* Badges de statut */
.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-inactive {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.badge-archived {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.card-content {
  padding: 25px;
  text-align: left;
}

.card-content h2 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #01111d;
  margin: 0 0 10px 0;
}

.location {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.price {
  font-size: 1rem;
  color: #333;
  margin-bottom: 20px;
}

.price strong {
  font-size: 1.3rem;
  color: #01111d;
}

.archived-date {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 15px;
  font-style: italic;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .offres-grid { grid-template-columns: 1fr; }
  .tabs-bar { max-width: 100%; }
}

/* PAGINATION */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 50px;
}

.page-btn {
  background: white;
  border: 2px solid #2563eb;
  color: #2563eb;
  padding: 10px 22px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #2563eb;
  color: white;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-info {
  font-weight: 700;
  color: #01111d;
  font-size: 0.95rem;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-delete-card {
  background: none;
  border: 2px solid #fb8080;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  flex-shrink: 0;
  line-height: 1;
}
.btn-delete-card:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.btn-permanent-delete {
  border-color: #ef4444;
  background: #fef2f2;
}
.btn-permanent-delete:hover {
  background: #ef4444;
}

.btn-action-card {
  background: none;
  border: 2px solid #94a3b8;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  flex-shrink: 0;
  line-height: 1;
}
.btn-action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-toggle-card {
  border-color: #f59e0b;
}
.btn-toggle-card:hover:not(:disabled) {
  background: #fef3c7;
}

.btn-activate-card {
  border-color: #10b981;
}
.btn-activate-card:hover:not(:disabled) {
  background: #d1fae5;
}

.btn-restore-card {
  border-color: #2563eb;
}
.btn-restore-card:hover:not(:disabled) {
  background: #dbeafe;
}

.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.delete-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.delete-modal h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #01111d;
  margin: 0 0 12px 0;
}

.delete-modal p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.delete-modal-name {
  font-weight: 700;
  color: #01111d;
  margin-bottom: 24px !important;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel-delete {
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  background: white;
  color: #334155;
  transition: all 0.2s;
}
.btn-cancel-delete:hover:not(:disabled) { border-color: #94a3b8; }
.btn-cancel-delete:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-confirm-delete {
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  background: #ef4444;
  color: white;
  transition: all 0.2s;
}
.btn-confirm-delete:hover:not(:disabled) { background: #dc2626; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
