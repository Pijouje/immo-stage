<script setup>
import { ref, computed } from 'vue'

const avisClients = ref([
  { id: 1, nom: 'Dupont', commentaire: 'Très bon service!', note: 4, date: '22 janv. 2026' },
  { id: 2, nom: 'Martin', commentaire: 'Je recommande vivement.', note: 5, date: '12 fév. 2026' },
  { id: 3, nom: 'Durand', commentaire: 'Expérience satisfaisante.', note: 3, date: '05 mars 2026' }
])

const nbAvis = computed(() => avisClients.value.length)

const moyAvis = computed(() => {
  if (avisClients.value.length === 0) return 0
  const total = avisClients.value.reduce((acc, avis) => acc + avis.note, 0)
  const moyenne = total / avisClients.value.length
  const nombreArrondi = Math.round(moyenne * 10) / 10
  return nombreArrondi.toString().replace('.', ',')
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
    <div class="partie-texte">
      <div v-for="avis in avisClients" :key="avis.id" class="conteneur-avis"> 
        <div class="entete-avis">
            <div class="infos-gauche">
                <Etoile :note="avis.note" /> 
                <span class="nom-client">{{ avis.nom }}</span>
            </div>
            <span class="date-avis">{{ avis.date }}</span>
        </div>
        <p class="texte-commentaire">
            {{ avis.commentaire }}
        </p>
        <hr class="separateur">
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  background-image: url('/images/bg.png');
  background-size: cover;
  background-position: center;
  min-height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.partie-haut, .partie-texte {
  width: 90%;
  max-width: 1100px;
  margin: 0 auto; 
}

.partie-haut {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 70px;
  margin-bottom: 50px;
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
  font-size: 1rem;
}

.bloc-note {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.note-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.etoile {
  font-size: 1.5rem;
  color: #FBBF24;
}

.grosse-note, .Avis {
  font-size: 1.7rem;
  color: #0f172a;
}

.sous-texte {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-top: -5px;
}


.conteneur-avis {
    margin-bottom: 20px;
}

.entete-avis {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.infos-gauche {
    display: flex;
    align-items: center;
    gap: 15px;
}

.nom-client {
    font-weight: 700;
    color: #1e293b;
    font-size: 1rem;
}

.date-avis {
    font-size: 0.85rem;
    font-weight: 500;
}

.texte-commentaire {
    color: #334155;
    line-height: 1.6;
    margin-top: 0;
    margin-bottom: 25px;
    font-size: 0.95rem;
}

.separateur {
    border: none;
    border-bottom: 1px solid rgb(183, 183, 183); /* Ligne très fine et claire */
    margin-bottom: 25px;
}

@media (max-width: 768px) {
  .partie-haut {
    margin-top: 30px;
    margin-bottom: 30px; 
    flex-wrap: wrap; 
    gap: 10px;
  }

  .block-titre h1 {
    font-size: 1.3rem; 
  }
  .nb-avis {
    font-size: 0.85rem;
    white-space: nowrap; 
  }

  .grosse-note, .Avis {
    font-size: 1.4rem;
  }
  

  .entete-avis {
    align-items: flex-start;
  }

  .infos-gauche {
    flex: 1; 
    flex-wrap: wrap;
    gap: 5px;
  }

  .nom-client {
    font-size: 0.9rem;
    margin-right: 5px;
  }

  .date-avis {
    font-size: 0.75rem;
    white-space: nowrap;
    margin-top: 3px;
  }

  .texte-commentaire {
    font-size: 0.85rem;
    text-align: justify;
  }
}
</style>