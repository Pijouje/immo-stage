// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Module SEO pour Google et les IA
  modules: ['@nuxtjs/seo'],

  // Infos du site
  site: {
    url: 'https://ton-site-stage.com',
    name: 'Agence Immo',
    description: 'Location appartement étudiant et jeune actif.',
    defaultLocale: 'fr',
  },

})