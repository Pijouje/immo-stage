<script setup>
import { computed } from 'vue'

const props = defineProps({
  note: {
    type: Number,
    required: true
  }
})
const largeurRemplissage = computed(() => {
  return (props.note / 5) * 100 + '%'
})
</script>

<template>
    <div class="stars-container" :aria-label="'Note de ' + note + ' sur 5'">
        
        <div class="stars-bg">
            ★★★★★
        </div>

        <div class="stars-fill" :style="{ width: largeurRemplissage }">
            ★★★★★
        </div>
        
    </div>
</template>

<style scoped>
.stars-container {
    position: relative;
    display: inline-block;
    font-size: 20px;
    line-height: 1;
}
.stars-bg, .stars-fill {
    display: block;
    user-select: none;
}
.stars-bg {
    color: transparent;
    -webkit-text-stroke: 0.8px #FBBF24;
}

.stars-fill {
    color: #FBBF24;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .stars-container {
        font-size: 1rem
    }
}
</style>