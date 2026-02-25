<script setup lang="ts">
// SEO : Données structurées globales (Organization + WebSite)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://ton-site-stage.com/#organization',
            name: 'Agence Immo Amiens',
            url: 'https://ton-site-stage.com',
            description: 'Agence de location de logements étudiants et jeunes actifs à Amiens.',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Amiens',
              addressRegion: 'Hauts-de-France',
              addressCountry: 'FR',
            },
            areaServed: {
              '@type': 'City',
              name: 'Amiens',
            },
            serviceType: 'Location immobilière étudiante',
          },
          {
            '@type': 'WebSite',
            '@id': 'https://ton-site-stage.com/#website',
            url: 'https://ton-site-stage.com',
            name: 'Agence Immo Amiens',
            publisher: { '@id': 'https://ton-site-stage.com/#organization' },
            inLanguage: ['fr-FR', 'en-US'],
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://ton-site-stage.com/offres?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 1. Animation unique pour ton flux Accueil -> Offres */
@keyframes smoothEntrance {
    from {
        opacity: 0;
        transform: scale(1.05);
        filter: blur(8px);
    }
    to {
        opacity: 1;
        transform: scale(1);
        filter: blur(0);
    }
}

/* 2. Classes de transition liées au nom "hero-flow" */
.hero-flow-enter-active {
  animation: smoothEntrance 0.6s ease-out;
}

.hero-flow-leave-active {
  transition: opacity 0.4s ease-in;
}

.hero-flow-leave-to {
  opacity: 0;
}

html {
  overflow-y: scroll;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
}

/* Transition de layout (changement home <-> default) */
.layout-fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.layout-fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style>
