
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
    // Configuration pour que la session soit accessible partout
    session: {
      enableRefreshPeriodically: 5000, // Rafraîchit la session toutes les 5 secondes
      enableRefreshOnWindowFocus: true
    }
  },

  // Configuration des runtime pour que les variables d'environnement soient accessibles
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET || 'ma-cle-secrete-super-longue-et-aleatoire-minimum-32-caracteres',
    public: {
      authOrigin: process.env.AUTH_ORIGIN ?? 'http://localhost:3000'
    }
  }


})