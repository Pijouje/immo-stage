<template>
  <div class="home-layout">
    <Navbar transparent />
    <main class="home-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.home-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.home-content {
  width: 100%;
  min-height: 100vh;
}
</style>
