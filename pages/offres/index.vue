<script setup lang="ts">

definePageMeta({
  pageTransition: {
    name: 'hero-flow',
    mode: 'out-in'
  }
})

const { data: session } = useAuth()

const canCreateOffre = computed(() => {
  const role = session.value?.user?.role
  return role === 'ADMIN' || role === 'PROPRIETAIRE'
})

const page = ref(1)

const { data, pending, error, refresh } = await useFetch('/api/offres', {
  query: { page },
  lazy: true,
  watch: [page]
})

const offres = computed(() => data.value?.offres ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 1)

const retryFetch = async () => {
  error.value = undefined
  await refresh()
}
</script>

<template>
  <div class="offres-page">
    <div class="container">

      <!-- Bouton flottant "Créer une offre" (visible uniquement pour admin/proprio) -->
      <NuxtLink 
        v-if="canCreateOffre" 
        to="/offres/create" 
        class="btn-floating-create"
        title="Créer une nouvelle offre"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span class="btn-text">Créer une offre</span>
      </NuxtLink>

      <div v-if="error" class="state-box error-box">
        <div class="icon">⚠️</div>
        <h3>Oups, petit problème technique</h3>
        <p>Impossible de contacter le serveur.</p>
        <button @click="retryFetch" class="btn-retry">Réessayer la connexion</button>
      </div>

      <div v-else-if="pending" class="state-box loading-box">
        <div class="loader"></div>
        <p>Recherche des meilleures offres...</p>
      </div>

      <div v-else-if="!offres || offres.length === 0" class="state-box empty-box">
        <div class="icon">📭</div>
        <h3>Aucune annonce pour le moment</h3>
        <p>Revenez un peu plus tard, nos propriétaires postent régulièrement !</p>
        
        <!-- Bouton de création si admin/proprio -->
        <NuxtLink v-if="canCreateOffre" to="/offres/create" class="btn-create-first">
          + Créer la première offre
        </NuxtLink>
      </div>

      <div v-else class="offres-grid">
        <div v-for="offre in offres" :key="offre.id" class="card">
          <div class="card-image">
            <img :src="offre.image || '/images/default.png'" :alt="offre.titre">
          </div>
          <div class="card-content">
            <h3>{{ offre.titre }}</h3>
            <p class="location">
              <span class="pin">📍</span> {{ offre.lieu }}
            </p>
            <p class="price"><strong>{{ offre.prix }}</strong> /mois</p>
            <div class="card-action">
             <OffreBouton :to="`/offres/${offre.id}`">
               Voir l'annonce
             </OffreBouton>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page <= 1" @click="page--" class="page-btn">← Précédent</button>
        <span class="page-info">Page {{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++" class="page-btn">Suivant →</button>
      </div>

    </div>
  </div>
</template>

<style scoped>

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

.card-image img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.card-content {
  padding: 25px;
  text-align: left;
}

.card-content h3 {
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .offres-grid { grid-template-columns: 1fr; }
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
</style>