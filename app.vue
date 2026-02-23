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

html {
  overflow-y: scroll;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.auth-enter-active {
  animation: fadeUp 0.3s ease-out;
}

.auth-leave-active {
  transition: opacity 0.3s ease-in;
}

.auth-leave-to {
  opacity: 0;
}

/* Transition de layout (changement home <-> default) */
.layout-fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.layout-fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style>