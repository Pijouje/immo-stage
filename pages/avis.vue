<script setup>
import { ref } from 'vue'

const avisClients = ref([
  { id: 1, nom: 'Dupont', commentaire: 'Très bon service!', note: 4 },
  { id: 2, nom: 'Martin', commentaire: 'Je recommande vivement.', note: 5 },
  { id: 3, nom: 'Durand', commentaire: 'Expérience satisfaisante.', note: 3 }
])

const nbAvis = computed (() => avisClients.value.length)
const moyAvis = computed (() => {
  if (avisClients.value.length === 0){
    return 0
  }
  const total = avisClients.value.reduce((acc, avis) => acc + avis.note, 0)
  return (total / avisClients.value.length).toFixed(0)
})

</script>

<template>
  <div class="page">
    <div class="partie-haut">
      <div class="block-titre">
        <h1>Avis des clients</h1>
        <div class="nb-avis">({{ nbAvis }} avis)</div>
      </div>
      <div class="bloc-note">
        <div class="note-container">
          <span class="etoile">⭐</span> 
          <strong><span class="Avis">{{ moyAvis }}/5</span></strong>
        </div>
        <p class="sous-texte">Moyenne des avis</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page{
  background-image: url('/images/bg.png');
  background-size: cover;
  background-position: center;
  min-height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.partie-haut {
  display: flex;
  align-items: center;
  margin: 120px;
  margin: 70px auto 30px 130px;
  width: calc(100% - 200px);
  gap: 15px; 
  justify-content: space-between;
  width: 90%;
  max-width: 1100px;
}

.block-titre {
    display: flex;
    align-items: baseline;
    gap: 15px;
}

.block-titre h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.nb-avis {
  color: #64748b;
  font-size: 0.8;
}

.bloc-note {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.note-container {
    display: flex;
    align-items: center;
    gap: 5px;

}

.etoile {
    font-size: 1.5rem;
    color: #FBBF24;
}

.grosse-note {
    font-size: 1.8rem;
    font-weight: 800;
    color: #0f172a;
}

.sous-texte {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: -5px;
}

</style>