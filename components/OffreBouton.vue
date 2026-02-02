<script setup lang="ts">
// On définit les propriétés
defineProps({
  // Si on passe un lien "to", ça devient un lien. Sinon c'est un bouton.
  to: {
    type: String,
    default: null
  }
})
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="offre-btn">
    <slot /> </NuxtLink>

  <button v-else class="offre-btn">
    <slot />
  </button>
</template>

<style scoped>
.offre-btn {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background-color: white;
  border: 2px solid #2563eb; /* Ton bleu */
  color: #2563eb;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  box-sizing: border-box; /* Important pour que le padding ne casse pas la largeur */
}

.offre-btn:hover {
  background-color: #2563eb;
  color: white;
  transform: translateY(-2px);
}

.offre-btn:active {
  transform: translateY(0);
}
</style>