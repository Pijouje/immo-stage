
export default defineNuxtConfig({

  compatibilityDate: '2026-02-05',
  modules: ['@sidebase/nuxt-auth', '@nuxtjs/seo'],

  site: {
    url: 'https://ton-site-stage.com',
    name: 'Agence Immo',
    description: 'Location appartement étudiant et jeune actif.',
    defaultLocale: 'fr',
  },

  app: {
    pageTransition: { name: 'hero-flow', mode: 'out-in' },
    layoutTransition: { name: 'hero-flow', mode: 'out-in' }
  },

  auth: {
    baseURL: process.env.AUTH_ORIGIN ?? 'http://localhost:3000/api/auth',
    provider: {
        type: 'authjs'
    },
    globalAppMiddleware: {
      isEnabled: false // Important : on désactive le middleware global
    },
    session: {
      enableRefreshPeriodically: 60000, // Rafraîchit la session toutes les 60 secondes
      enableRefreshOnWindowFocus: true
    }
  },

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    public: {
      authOrigin: process.env.AUTH_ORIGIN ?? 'http://localhost:3000'
    }
  }


})