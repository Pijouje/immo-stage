<template>
  <div class="legal-page">
    <div class="container">
      
      <div class="page-header">
        <div class="header-icon">📜</div>
        <h1>Conditions Générales d'Utilisation (CGU) / CGV</h1>
        <p class="header-subtitle">Dernière mise à jour : {{ dateMAJ }}</p>
      </div>

      <section class="section">
        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
          d'accès et d'utilisation de la plateforme <strong>{{ nomSite }}</strong>, 
          dédiée à la location de logements étudiants et jeunes actifs.
        </p>
        <p>
          L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.
        </p>
      </section>

      <section class="section">
        <h2>2. Accès au service</h2>
        <h3>2.1 Inscription</h3>
        <p>
          L'accès à certaines fonctionnalités (messagerie, candidature, avis) nécessite la création d'un compte. 
          Vous vous engagez à fournir des informations exactes et à les maintenir à jour.
        </p>
        <h3>2.2 Sécurité du compte</h3>
        <p>
          Vous êtes responsable de la confidentialité de vos identifiants. 
          Toute utilisation de votre compte est réputée avoir été effectuée par vous-même.
        </p>
      </section>

      <section class="section">
        <h2>3. Utilisation du service</h2>
        <h3>3.1 Pour les étudiants / locataires</h3>
        <ul>
          <li>Vous pouvez consulter les annonces, contacter les propriétaires et candidater à des logements</li>
          <li>Vous vous engagez à fournir des informations véridiques lors de votre candidature</li>
          <li>Vous pouvez laisser un avis uniquement si vous y êtes autorisé par l'administrateur</li>
        </ul>

        <h3>3.2 Pour les propriétaires</h3>
        <ul>
          <li>Vous pouvez publier des annonces de logement</li>
          <li>Vous vous engagez à publier des informations exactes et conformes à la réalité</li>
          <li>Vous êtes responsable de la conformité de votre bien aux normes de location</li>
        </ul>

        <h3>3.3 Interdictions</h3>
        <p>Il est strictement interdit de :</p>
        <ul>
          <li>Publier des annonces frauduleuses ou trompeuses</li>
          <li>Usurper l'identité d'autrui</li>
          <li>Utiliser le site à des fins commerciales non autorisées</li>
          <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
          <li>Publier des contenus illégaux, diffamatoires ou offensants</li>
        </ul>
      </section>

      <section class="section">
        <h2>4. Paiements (CGV)</h2>
        <p>
          Les paiements effectués sur la plateforme (cautions, loyers) sont sécurisés via 
          <strong>Stripe</strong> et/ou <strong>PayPal</strong>. 
          Nous ne stockons aucune information bancaire.
        </p>
        <h3>4.1 Frais de service</h3>
        <p>
          [À compléter : Précisez si vous prenez une commission, des frais de dossier, etc.]
        </p>
        <h3>4.2 Remboursements</h3>
        <p>
          Les conditions de remboursement dépendent de chaque annonce et doivent être convenues 
          directement entre le locataire et le propriétaire.
        </p>
      </section>

      <section class="section">
        <h2>5. Responsabilités</h2>
        <h3>5.1 Rôle de la plateforme</h3>
        <p>
          <strong>{{ nomSite }}</strong> est un intermédiaire technique mettant en relation 
          propriétaires et locataires. Nous ne sommes pas partie au contrat de location 
          et ne pouvons être tenus responsables des litiges entre utilisateurs.
        </p>

        <h3>5.2 Vérification des annonces</h3>
        <p>
          Nous faisons notre possible pour vérifier les annonces, mais ne garantissons pas 
          l'exactitude des informations fournies par les propriétaires.
        </p>

        <h3>5.3 Limitation de responsabilité</h3>
        <p>
          Nous ne pouvons être tenus responsables des dommages directs ou indirects 
          résultant de l'utilisation du service, sauf en cas de faute lourde ou intentionnelle.
        </p>
      </section>

      <section class="section">
        <h2>6. Modération et sanctions</h2>
        <p>
          Nous nous réservons le droit de supprimer tout contenu ou compte ne respectant pas les présentes CGU, 
          sans préavis ni indemnité.
        </p>
        <p>
          Les avis peuvent être modérés par les administrateurs et les propriétaires concernés.
        </p>
      </section>

      <section class="section">
        <h2>7. Propriété intellectuelle</h2>
        <p>
          Tous les éléments du site (design, logo, textes, code) sont protégés par le droit d'auteur. 
          Toute reproduction sans autorisation est interdite.
        </p>
        <p>
          En publiant du contenu (photos, avis), vous accordez à <strong>{{ nomSite }}</strong> 
          une licence d'utilisation non exclusive pour afficher ce contenu sur la plateforme.
        </p>
      </section>

      <section class="section">
        <h2>8. Protection des données</h2>
        <p>
          Vos données personnelles sont traitées conformément à notre 
          <NuxtLink to="/legal/privacy" class="link-inline">Politique de Confidentialité</NuxtLink>.
        </p>
      </section>

      <section class="section">
        <h2>9. Modifications des CGU</h2>
        <p>
          Nous nous réservons le droit de modifier les présentes CGU à tout moment. 
          Les modifications importantes vous seront notifiées par email.
        </p>
      </section>

      <section class="section">
        <h2>10. Résiliation</h2>
        <p>
          Vous pouvez supprimer votre compte à tout moment depuis votre profil ou en nous contactant. 
          La suppression entraîne l'effacement de vos données personnelles sous 30 jours.
        </p>
      </section>

      <section class="section">
        <h2>11. Droit applicable et juridiction</h2>
        <p>
          Les présentes CGU sont régies par le droit français. 
          En cas de litige, les tribunaux français seront seuls compétents.
        </p>
      </section>

      <section class="section section-contact">
        <h2>12. Contact</h2>
        <p>Pour toute question concernant ces CGU :</p>
        <div class="contact-box">
          <div>📧 Email : <a href="mailto:contact@votresite.fr">contact@votresite.fr</a></div>
          <div>📝 Formulaire : <NuxtLink to="/contact">Page de contact</NuxtLink></div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
const nomSite = 'NOM DU SITE'
const dateMAJ = new Date().toLocaleDateString('fr-FR', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
})

useHead({
  title: 'CGU / CGV - ' + nomSite,
  meta: [
    { name: 'description', content: 'Conditions générales d\'utilisation et de vente de ' + nomSite }
  ]
})
</script>

<style scoped>
.legal-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
  min-height: 100vh;
  padding: 60px 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #334155;
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
  font-size: 2.2rem;
  font-weight: 900;
  color: #2563eb;
  margin: 0 0 12px 0;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  font-style: italic;
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
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid #dbeafe;
}

.section h3 {
  color: #1e40af;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 24px 0 12px 0;
}

.section p {
  line-height: 1.8;
  margin-bottom: 16px;
}

.section ul {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.section li {
  padding: 8px 0 8px 28px;
  position: relative;
  line-height: 1.6;
}

.section li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #2563eb;
  font-weight: bold;
  font-size: 1.2rem;
}

.link-inline {
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
}

.link-inline:hover {
  color: #1e40af;
}

.section-contact {
  background: linear-gradient(135deg, #eff6ff, white);
}

.contact-box {
  background: white;
  border: 2px solid #dbeafe;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.contact-box div {
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.contact-box div:last-child {
  border-bottom: none;
}

.contact-box a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.contact-box a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .legal-page {
    padding: 30px 0;
  }

  .page-header {
    padding: 30px 20px;
  }

  .page-header h1 {
    font-size: 1.6rem;
  }

  .section {
    padding: 24px 20px;
  }

  .section h2 {
    font-size: 1.3rem;
  }
}
</style>