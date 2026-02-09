<script setup lang="ts">

definePageMeta({
  pageTransition: {
    name: 'hero-flow',
    mode: 'out-in'
  }
})

const { data: offres, pending, error, refresh } = await useFetch('/api/offres', {
  lazy: true
})

const retryFetch = async () => {
  // 2. On "nettoie" l'erreur manuellement pour forcer l'affichage du loader
  error.value = undefined
  // On attend que le refresh se termine
  await refresh()
}
</script>

<template>
  <div class="offres-page">
    <div class="container">

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
}

.state-box {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  max-width: 600px;
  margin: 0 auto; /* Centré horizontalement */
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

/* Style Chargement (petit spinner css simple) */
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
</style>