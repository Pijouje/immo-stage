export default defineNuxtConfig({
  compatibilityDate: '2026-02-05',
  modules: ['@sidebase/nuxt-auth', '@nuxtjs/seo', '@nuxtjs/i18n'],

  site: {
    url: 'https://ton-site-stage.com',
    name: 'Agence Immo',
    description: 'Location appartement étudiant et jeune actif.',
    defaultLocale: 'fr',
  },

  app: {
    pageTransition: { name: 'hero-flow', mode: 'out-in' },
    layoutTransition: { name: 'layout-fade', mode: 'out-in' }
  },

  auth: {
    baseURL: process.env.AUTH_ORIGIN ?? 'http://localhost:3000/api/auth',
    provider: {
      type: 'authjs'
    },
    globalAppMiddleware: false // ← Simplifié
  },

  // SECURITE : Headers de sécurité HTTP
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    }
  },

  i18n: {
    locales: [
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        file: 'fr.json'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
      alwaysRedirect: true,
      fallbackLocale: 'fr'
    }
  },

  sitemap: {
    xsl: false,
    i18n: true
  }
})