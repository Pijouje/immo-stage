export default defineNuxtConfig({
  compatibilityDate: '2026-02-05',
  modules: ['@sidebase/nuxt-auth', '@nuxtjs/seo', '@nuxtjs/i18n'],

  site: {
    url: 'https://ton-site-stage.com',
    name: "Stud'Loc - Location Étudiante Amiens",
    description: 'Trouvez votre logement étudiant à Amiens : appartements meublés, colocations, studios. Location vérifiée avec avis de locataires.',
    defaultLocale: 'fr',
  },

  app: {
    pageTransition: { name: 'hero-flow', mode: 'out-in' },
    layoutTransition: { name: 'layout-fade', mode: 'out-in' },

    head: {
      htmlAttrs: { lang: 'fr' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicon.png' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      ],
      meta: [
        { name: 'theme-color', content: '#01111d' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:site_name', content: "Stud'Loc" },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },

  auth: {
    baseURL: process.env.AUTH_ORIGIN ?? 'http://localhost:3000/api/auth',
    provider: {
      type: 'authjs'
    },
    globalAppMiddleware: false
  },

  // SECURITE + PERFORMANCE : Headers HTTP
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      }
    },
    // Cache statique long pour les assets
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/videos/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
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
      useCookie: false,
      redirectOn: 'root',
      fallbackLocale: 'fr'
    }
  },

  sitemap: {
    xsl: false,
    i18n: true
  },

  // SEO : Configuration du module
  seo: {
    redirectToCanonicalSiteUrl: true,
  },
})
