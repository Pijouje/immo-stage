<script>
import { ref } from 'vue'

const nom = ref('')
const prenom = ref('')
</script>

<template>
  <div class="page">
    <div class="carte">
      <div class="partie-gauche">
        <h2>Mes Messages</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: calc(100vh - 90px);
    width: 100%;
    background-image: url('/images/bg.png');
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
}
/* CARTE CENTRALE */
.carte {
  background-color: white;
    width: 100%;
    max-width: 1200px; 
    height: 600px;
    padding: 60px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    margin: 80px auto; 
    box-sizing: border-box;
    transform: translateY(-27px);
}

.carte h2 {
  display: flex;
  justify-content: left;
  transform: translateY(-40px);
}

.partie-gauche {
  width: 320px;
  height: 100%;
  border-right: 1px solid #e2e8f0;
}
</style>