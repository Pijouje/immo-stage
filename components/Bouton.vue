<template>
  <button class="Bouton_Action">
    <slot />
  </button>
</template>

<style scoped>
    .Bouton_Action {
        background-color: #2563EB;
        color: white;
        font-size: 1.2rem;
        font-weight: 700;
        padding: 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 20px;
        transition: background 0.2s;
        width: 100%;
    }

    .Bouton_Action:hover {
        background-color: #1d4ed8;
    }
</style>