<template>
  <div>
    <Navbar /> <main>
      <slot /> </main>
      <Footer />
  </div>
</template>

<style>

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1; /* Pousse le footer vers le bas */
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

}</style>