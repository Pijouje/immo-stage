<template>
  <div class="legal-page">
    <div class="container">

      <div class="page-header">
        <div class="header-icon">⚖️</div>
        <h1>Mentions Légales</h1>
      </div>

      <section class="section">
        <h2>1. Éditeur du site</h2>
        <div class="info-grid">
          <div><strong>Nom :</strong> Poncey Valdemar Isabelle</div>
          <div><strong>Forme juridique :</strong> Auto-entrepreneur</div>
          <div><strong>SIRET :</strong> À compléter</div>
          <div><strong>Adresse :</strong> Quartier Sainte-Anne, Amiens (80000)</div>
          <div><strong>Email :</strong> contact@studloc.fr</div>
          <div><strong>Site web :</strong> <a href="https://studloc.fr" target="_blank" rel="noopener">https://studloc.fr</a></div>
        </div>
      </section>

      <section class="section">
        <h2>2. Directeur de la publication</h2>
        <p><strong>Nom :</strong> Poncey Valdemar Isabelle</p>
      </section>

      <section class="section">
        <h2>3. Hébergement</h2>
        <div class="info-grid">
          <div><strong>Hébergeur :</strong> OVHcloud</div>
          <div><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</div>
          <div><strong>Site web :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noopener">https://www.ovhcloud.com</a></div>
        </div>
      </section>

      <section class="section">
        <h2>4. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) est la propriété exclusive de
          <strong>Stud'Loc</strong>, sauf mention contraire. Toute reproduction, distribution ou utilisation
          sans autorisation préalable est interdite et constitue une contrefaçon sanctionnée par le Code de la Propriété Intellectuelle.
        </p>
      </section>

      <section class="section">
        <h2>5. Données personnelles</h2>
        <p>
          Pour en savoir plus sur la collecte et le traitement de vos données personnelles,
          consultez notre <NuxtLink to="/legal/privacy" class="link-inline">Politique de Confidentialité</NuxtLink>.
        </p>
      </section>

      <section class="section">
        <h2>6. Cookies</h2>
        <p>
          Ce site utilise uniquement des cookies strictement nécessaires (authentification et sécurité),
          exemptés de consentement conformément à la réglementation CNIL.
          Pour plus d'informations, consultez notre <NuxtLink to="/legal/privacy" class="link-inline">Politique de Confidentialité</NuxtLink>.
        </p>
      </section>

      <section class="section">
        <h2>7. Droit applicable et litiges</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français.
          En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </section>

    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Mentions Légales - Stud\'Loc',
  meta: [
    { name: 'description', content: 'Informations légales concernant le site Stud\'Loc' }
  ]
})
</script>

<style scoped>
.legal-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
  min-height: 100vh;
  padding: 60px 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding: 40px 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);
  border-top: 4px solid #2563eb;
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2563eb;
  margin: 0;
}

.section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.section h2 {
  color: #2563eb;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid #dbeafe;
}

.section p {
  line-height: 1.8;
  color: #334155;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  gap: 12px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.info-grid div {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.info-grid a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.info-grid a:hover {
  text-decoration: underline;
}

.link-inline {
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
}

.link-inline:hover {
  color: #1e40af;
}

@media (max-width: 768px) {
  .legal-page {
    padding: 30px 0;
  }

  .page-header {
    padding: 30px 20px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .section {
    padding: 24px 20px;
  }
}
</style>