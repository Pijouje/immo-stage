<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 1. Animation unique pour ton flux Accueil -> Offres */
@keyframes smoothEntrance { 
    from { 
        opacity: 0; 
        transform: scale(1.05); /* Effet de zoom arrière */
        filter: blur(8px);      /* Début flou pour adoucir la vidéo */
    } 
    to { 
        opacity: 1; 
        transform: scale(1); 
        filter: blur(0);
    } 
}

/* 2. Classes de transition liées au nom "hero-flow" */
.hero-flow-enter-active {
  animation: smoothEntrance 0.6s ease-out; /* Plus lent (0.6s) pour plus d'élégance */
}

.hero-flow-leave-active {
  transition: opacity 0.4s ease-in;
}

.hero-flow-leave-to {
  opacity: 0;
}

</style>