<template>
  <div class="layout-container">
    <TheNavbar />

    <main class="page-content">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Prend au moins toute la hauteur de l'écran */
}

.page-content {
  flex: 1; /* Pousse le footer vers le bas si la page est vide */
  padding-top: 20px; /* Un peu d'espace sous le menu */
  background-color: #f9f9f9; /* Fond gris très clair pour les pages standards */
}
</style>