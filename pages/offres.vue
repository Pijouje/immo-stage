<script setup lang="ts">

definePageMeta({
  pageTransition: {
    name: 'hero-flow',
    mode: 'out-in'
  }
})

// Données factices pour tes annonces (plus facile à maintenir que de tout copier-coller)
const offres = [
  { id: 1, titre: 'T2 MEUBLÉ', lieu: 'Saint-Leu, Amiens', prix: '500€', image: '/images/t2.png' },
  { id: 2, titre: 'T3 MEUBLÉ', lieu: 'Saint-Leu, Amiens', prix: '500€', image: '/images/t3.png' },
  { id: 3, titre: 'T4 MEUBLÉ', lieu: 'Saint-Leu, Amiens', prix: '500€', image: '/images/t4.png' },
]
</script>

<template>
  <div class="offres-page">
    <div class="container">
      <div class="offres-grid">
        <div v-for="offre in offres" :key="offre.id" class="card">
          <div class="card-image">
            <img :src="offre.image" :alt="offre.titre">
          </div>
          <div class="card-content">
            <h3>{{ offre.titre }}</h3>
            <p class="location">
              <span class="pin">📍</span> {{ offre.lieu }}
            </p>
            <p class="price"><strong>{{ offre.prix }}</strong> /mois</p>
            <NuxtLink :to="`/offres/${offre.id}`" class="btn-detail">
              Voir l'annonce
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.offres-page {
  min-height: 100vh;
  background-color: #f4f7f6; /* Gris très clair */
  /* Optionnel : image de fond blueprint si tu l'as */
  background-image: url('/images/bg.png'); 
  background-size: cover;
  background-position: center;
  padding: 120px 0 60px 0; /* Marge en haut pour ne pas être sous la navbar */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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

/* BOUTON VOIR L'ANNONCE */
.btn-detail {
  display: block;
  text-align: center;
  border: 2px solid #4a90e2; /* Bleu de ta maquette */
  color: #4a90e2;
  text-decoration: none;
  padding: 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-detail:hover {
  background-color: #4a90e2;
  color: white;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .offres-grid { grid-template-columns: 1fr; }
}
</style>