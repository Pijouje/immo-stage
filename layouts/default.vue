<template>
  <div>
    <Navbar /> <main>
      <slot /> </main>
      <Footer />
  </div>
</template>

<style>
main {
  flex: 1;
}
</style>