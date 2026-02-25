<template>
  <div class="layout-wrapper">
    <Navbar />
    <main role="main">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<style>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>