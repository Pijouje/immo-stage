<script setup>
onMounted(() => {
  // Détecte la langue du navigateur
  const browserLang = navigator.language.substring(0, 2)
  
  // Si pas français, on traduit automatiquement
  if (browserLang !== 'fr') {
    // Charge Google Translate
    const script = document.createElement('script')
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    document.head.appendChild(script)
    
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'fr',
        includedLanguages: 'en,es,it,de,pt,nl,pl,ru,zh-CN',
        autoDisplay: false
      }, 'google_translate_hidden')
      
      // Attends que le widget soit chargé puis traduit automatiquement
      setTimeout(() => {
        const selectElement = document.querySelector('.goog-te-combo')
        if (selectElement) {
          // Essaie d'abord la langue exacte du navigateur
          selectElement.value = browserLang
          selectElement.dispatchEvent(new Event('change'))
        }
      }, 1000)
    }
  }
})
</script>

<template>
  <!-- Widget complètement caché -->
  <div id="google_translate_hidden" style="display: none !important;"></div>
</template>

<style>
/* Cache ABSOLUMENT TOUT de Google Translate */
.goog-te-banner-frame,
.goog-te-banner,
.skiptranslate,
#goog-gt-tt,
.goog-te-balloon-frame,
.goog-te-menu-frame,
.goog-te-ftab,
.goog-te-gadget,
body > .skiptranslate,
body > iframe.skiptranslate {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
}

/* Empêche le décalage du body */
body {
  top: 0 !important;
  position: static !important;
}

/* Cache le conteneur parent */
#google_translate_hidden,
#google_translate_hidden * {
  display: none !important;
}
</style>