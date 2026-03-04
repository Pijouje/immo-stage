<script setup>
import { computed } from 'vue'

const props = defineProps({
  note: { type: Number, required: true }
})

const etoiles = computed(() => {
  return [1, 2, 3, 4, 5].map(i => {
    if (i <= Math.floor(props.note)) return 'pleine'
    if (i === Math.ceil(props.note) && props.note % 1 >= 0.5) return 'demi'
    return 'vide'
  })
})
</script>

<template>
  <div class="stars-container" :aria-label="'Note de ' + note + ' sur 5'">
    <span v-for="(type, i) in etoiles" :key="i" class="star" :class="type">★</span>
  </div>
</template>

<style scoped>
.stars-container {
  display: inline-flex;
  font-size: 20px;
  line-height: 1;
}
.star { 
    -webkit-text-stroke: 0.8px 
    #FBBF24; color: transparent; 
}
.star.pleine { 
    color: #FBBF24; 
    -webkit-text-stroke: 0; 
}
.star.demi {
  background: linear-gradient(90deg, #FBBF24 50%, transparent 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
@media (max-width: 768px) {
  .stars-container { font-size: 1rem; }
}
</style>