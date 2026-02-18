<template>
  <div class="privacy-page">
    <div class="container">

      <!-- En-tête -->
      <div class="page-header">
        <div class="header-icon">🔒</div>
        <h1>Politique de Confidentialité</h1>
        <p class="header-subtitle">
          Dernière mise à jour : {{ dateMAJ }}
        </p>
      </div>

      <!-- Introduction -->
      <section class="section">
        <p class="intro-text">
          Chez <strong>{{ nomSite }}</strong>, nous prenons la protection de votre vie privée très au sérieux. 
          Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles 
          lorsque vous utilisez notre plateforme de location de logements étudiants.
        </p>
        <div class="highlight-box">
          <strong>🛡️ Notre engagement :</strong> Nous ne revendons aucune donnée personnelle à des tiers. 
          Vos informations sont utilisées uniquement dans le cadre de notre service.
        </div>
      </section>

      <!-- Section 1 : Données collectées -->
      <section class="section">
        <h2>1. Données que nous collectons</h2>
        
        <h3>1.1 Lors de l'inscription</h3>
        <ul>
          <li><strong>Informations d'identification :</strong> Nom, prénom, adresse email</li>
          <li><strong>Mot de passe :</strong> Stocké de manière sécurisée (hashé avec bcrypt)</li>
          <li><strong>Rôle :</strong> Étudiant, Propriétaire ou Administrateur</li>
        </ul>

        <h3>1.2 Lors de l'utilisation du service</h3>
        <ul>
          <li><strong>Documents justificatifs :</strong> Pièce d'identité, justificatifs de garants (uniquement si nécessaire)</li>
          <li><strong>Messages :</strong> Conversations avec les propriétaires via notre messagerie interne</li>
          <li><strong>Avis :</strong> Commentaires et notes laissés sur les logements (uniquement si vous y êtes autorisé)</li>
        </ul>

        <h3>1.3 Données techniques</h3>
        <ul>
          <li><strong>Logs de connexion :</strong> Adresse IP, date et heure de connexion (conservés pour la sécurité)</li>
          <li><strong>Informations de navigation :</strong> Type de navigateur, système d'exploitation</li>
        </ul>
      </section>

      <!-- Section 2 : COOKIES (LA PLUS IMPORTANTE) -->
      <section class="section cookies-section">
        <div class="cookies-header">
          <h2>2. Cookies et traceurs</h2>
          <span class="badge badge-exempt">✓ Exemption RGPD</span>
        </div>

        <div class="info-box info-primary">
          <div class="info-icon">ℹ️</div>
          <div class="info-content">
            <strong>Bonne nouvelle :</strong> Nous n'utilisons <strong>aucun traceur publicitaire</strong> 
            ni outil de statistiques tiers (type Google Analytics, Facebook Pixel, etc.).
          </div>
        </div>

        <h3>2.1 Cookies strictement nécessaires (exemptés de consentement)</h3>
        <p>
          Conformément à l'article 82 de la loi Informatique et Libertés et aux lignes directrices de la CNIL, 
          nous utilisons uniquement des cookies <strong>strictement nécessaires au fonctionnement du site</strong>, 
          qui sont exemptés de consentement préalable.
        </p>

        <div class="cookies-table">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Finalité</th>
                <th>Durée</th>
                <th>Exemption</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>next-auth.session-token</code></td>
                <td>Maintien de votre session de connexion</td>
                <td>30 jours</td>
                <td class="exempt">✓ Technique</td>
              </tr>
              <tr>
                <td><code>csrf_token</code></td>
                <td>Protection contre les attaques CSRF</td>
                <td>Session</td>
                <td class="exempt">✓ Sécurité</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>2.2 Aucun cookie publicitaire ou de profilage</h3>
        <div class="info-box info-success">
          <div class="info-icon">✅</div>
          <div class="info-content">
            Nous ne déposons <strong>aucun cookie à des fins publicitaires, de ciblage comportemental ou de profilage</strong>. 
            Vous ne verrez donc jamais de bannière de consentement aux cookies sur notre site, car tous nos cookies 
            relèvent de l'exemption prévue par la réglementation.
          </div>
        </div>

        <h3>2.3 Comment gérer les cookies ?</h3>
        <p>
          Bien que nos cookies soient exemptés de consentement, vous pouvez toujours les bloquer via les paramètres de votre navigateur. 
          Attention : cela empêchera le bon fonctionnement du site (vous ne pourrez plus rester connecté).
        </p>
        <ul>
          <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
          <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
          <li><strong>Safari :</strong> Préférences → Confidentialité → Bloquer tous les cookies</li>
        </ul>
      </section>

      <!-- Section 3 : Utilisation des données -->
      <section class="section">
        <h2>3. Comment utilisons-nous vos données ?</h2>
        <p>Vos données personnelles sont utilisées uniquement pour :</p>
        <ul>
          <li>✓ Gérer votre compte et votre authentification</li>
          <li>✓ Vous mettre en relation avec les propriétaires (messagerie)</li>
          <li>✓ Traiter vos demandes de location</li>
          <li>✓ Vous permettre de laisser des avis (si autorisé)</li>
          <li>✓ Répondre à vos questions via le formulaire de contact</li>
          <li>✓ Assurer la sécurité et prévenir la fraude</li>
        </ul>
        <p class="emphasis">
          <strong>Nous ne vendons ni ne louons vos données à des tiers.</strong>
        </p>
      </section>

      <!-- Section 4 : Partage des données -->
      <section class="section">
        <h2>4. Partage de vos données</h2>
        <p>Vos données peuvent être partagées uniquement dans les cas suivants :</p>
        
        <h3>4.1 Avec les propriétaires</h3>
        <p>
          Lorsque vous contactez un propriétaire, celui-ci peut voir votre nom, prénom et vos messages. 
          Vos documents justificatifs ne sont visibles que par les administrateurs et le propriétaire concerné.
        </p>

        <h3>4.2 Avec des prestataires techniques</h3>
        <ul>
          <li><strong>Hébergement :</strong> Nos serveurs sont hébergés chez [Nom hébergeur, ex: OVH, Vercel]</li>
          <li><strong>Base de données :</strong> MySQL hébergé en France</li>
          <li><strong>Paiements :</strong> Stripe et/ou PayPal (selon votre choix) — ces prestataires ont leur propre politique de confidentialité</li>
        </ul>

        <h3>4.3 Obligations légales</h3>
        <p>
          Nous pouvons être amenés à communiquer vos données aux autorités compétentes si la loi nous l'impose 
          (ex : réquisition judiciaire).
        </p>
      </section>

      <!-- Section 5 : Conservation -->
      <section class="section">
        <h2>5. Durée de conservation</h2>
        <ul>
          <li><strong>Compte actif :</strong> Vos données sont conservées tant que votre compte existe</li>
          <li><strong>Compte supprimé :</strong> Vos données sont effacées sous 30 jours (sauf obligations légales)</li>
          <li><strong>Messages :</strong> Conservés pendant la durée de votre compte</li>
          <li><strong>Logs de sécurité :</strong> Conservés 1 an maximum</li>
        </ul>
      </section>

      <!-- Section 6 : Vos droits -->
      <section class="section">
        <h2>6. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
        
        <div class="rights-grid">
          <div class="right-card">
            <div class="right-icon">👁️</div>
            <h4>Droit d'accès</h4>
            <p>Vous pouvez demander une copie de toutes vos données personnelles</p>
          </div>
          <div class="right-card">
            <div class="right-icon">✏️</div>
            <h4>Droit de rectification</h4>
            <p>Vous pouvez corriger vos informations depuis votre profil</p>
          </div>
          <div class="right-card">
            <div class="right-icon">🗑️</div>
            <h4>Droit à l'effacement</h4>
            <p>Vous pouvez demander la suppression de votre compte et de vos données</p>
          </div>
          <div class="right-card">
            <div class="right-icon">📦</div>
            <h4>Droit à la portabilité</h4>
            <p>Vous pouvez récupérer vos données dans un format lisible</p>
          </div>
          <div class="right-card">
            <div class="right-icon">🚫</div>
            <h4>Droit d'opposition</h4>
            <p>Vous pouvez vous opposer à certains traitements (prospection)</p>
          </div>
          <div class="right-card">
            <div class="right-icon">⏸️</div>
            <h4>Droit à la limitation</h4>
            <p>Vous pouvez demander le gel temporaire de vos données</p>
          </div>
        </div>

        <div class="info-box info-contact">
          <div class="info-icon">📧</div>
          <div class="info-content">
            <strong>Pour exercer vos droits :</strong><br>
            Contactez-nous via notre <NuxtLink to="/contact" class="link-inline">formulaire de contact</NuxtLink> 
            ou par email à <a href="mailto:contact@votresite.fr" class="link-inline">contact@votresite.fr</a>. 
            Nous vous répondrons sous 30 jours maximum.
          </div>
        </div>
      </section>

      <!-- Section 7 : Sécurité -->
      <section class="section">
        <h2>7. Sécurité de vos données</h2>
        <p>Nous mettons en œuvre les mesures techniques et organisationnelles suivantes :</p>
        <ul>
          <li>✓ <strong>Mots de passe hashés</strong> avec bcrypt (algorithme de chiffrement robuste)</li>
          <li>✓ <strong>Connexion HTTPS</strong> (chiffrement SSL/TLS)</li>
          <li>✓ <strong>Protection CSRF</strong> contre les attaques de type Cross-Site Request Forgery</li>
          <li>✓ <strong>Limitation des tentatives de connexion</strong> (protection contre le brute-force)</li>
          <li>✓ <strong>Sauvegardes régulières</strong> de la base de données</li>
          <li>✓ <strong>Accès restreint</strong> aux données (seuls les administrateurs autorisés)</li>
        </ul>
      </section>

      <!-- Section 8 : Modifications -->
      <section class="section">
        <h2>8. Modifications de cette politique</h2>
        <p>
          Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
          La date de dernière mise à jour est indiquée en haut de cette page. 
          Les modifications importantes vous seront notifiées par email ou via une bannière sur le site.
        </p>
      </section>

      <!-- Section 9 : Contact -->
      <section class="section section-contact">
        <h2>9. Nous contacter</h2>
        <p>Pour toute question concernant cette politique de confidentialité ou vos données personnelles :</p>
        
        <div class="contact-card">
          <div class="contact-row">
            <strong>Email :</strong> 
            <a href="mailto:contact@votresite.fr">contact@votresite.fr</a>
          </div>
          <div class="contact-row">
            <strong>Formulaire :</strong> 
            <NuxtLink to="/contact">Page de contact</NuxtLink>
          </div>
          <div class="contact-row">
            <strong>Responsable des données :</strong> 
            [Nom du responsable légal]
          </div>
        </div>

        <div class="info-box info-cnil">
          <div class="info-icon">⚖️</div>
          <div class="info-content">
            <strong>Autorité de contrôle :</strong> Si vous estimez que vos droits ne sont pas respectés, 
            vous pouvez déposer une réclamation auprès de la 
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener" class="link-inline">
              CNIL (Commission Nationale de l'Informatique et des Libertés)
            </a>.
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
// Données dynamiques
const nomSite = 'NOM DU SITE'
const dateMAJ = new Date().toLocaleDateString('fr-FR', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
})

// SEO
useHead({
  title: 'Politique de Confidentialité - ' + nomSite,
  meta: [
    { name: 'description', content: 'Découvrez comment nous protégeons vos données personnelles. Aucun traceur publicitaire, cookies strictement nécessaires.' }
  ]
})
</script>

<style scoped>
/* ─── VARIABLES ───────────────────────────────────────────────── */
.privacy-page {
  --blue-primary: #2563eb;
  --blue-dark: #1e40af;
  --blue-light: #dbeafe;
  --blue-lighter: #eff6ff;
  --green-success: #10b981;
  --green-light: #d1fae5;
  --gray-text: #334155;
  --gray-light: #f1f5f9;
  --border: #e2e8f0;

  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--gray-text);
  padding: 60px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ─── EN-TÊTE ────────────────────────────────────────────────── */
.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding: 40px 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);
  border-top: 4px solid var(--blue-primary);
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--blue-primary);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  font-style: italic;
}

/* ─── SECTIONS ───────────────────────────────────────────────── */
.section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border);
}

.section h2 {
  color: var(--blue-primary);
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--blue-light);
}

.section h3 {
  color: var(--blue-dark);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 28px 0 16px 0;
}

.section h4 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--gray-text);
}

.section p {
  line-height: 1.8;
  margin-bottom: 16px;
  color: var(--gray-text);
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
  color: var(--blue-primary);
  font-weight: bold;
  font-size: 1.2rem;
}

/* ─── INTRO ──────────────────────────────────────────────────── */
.intro-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #475569;
}

/* ─── HIGHLIGHT BOX ──────────────────────────────────────────── */
.highlight-box {
  background: linear-gradient(135deg, var(--blue-lighter), var(--blue-light));
  border-left: 4px solid var(--blue-primary);
  padding: 20px 24px;
  border-radius: 12px;
  margin: 24px 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* ─── SECTION COOKIES (LA STAR) ─────────────────────────────── */
.cookies-section {
  border: 2px solid var(--blue-primary);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.12);
}

.cookies-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--blue-light);
}

.cookies-header h2 {
  margin: 0;
  padding: 0;
  border: none;
}

.badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-exempt {
  background: var(--green-light);
  color: #065f46;
}

/* ─── INFO BOXES ─────────────────────────────────────────────── */
.info-box {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 12px;
  margin: 24px 0;
  border-left: 4px solid;
}

.info-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  line-height: 1.6;
}

.info-primary {
  background: var(--blue-lighter);
  border-color: var(--blue-primary);
}

.info-success {
  background: #f0fdf4;
  border-color: var(--green-success);
}

.info-contact {
  background: #fef3c7;
  border-color: #f59e0b;
}

.info-cnil {
  background: #fef2f2;
  border-color: #dc2626;
}

/* ─── TABLEAU COOKIES ────────────────────────────────────────── */
.cookies-table {
  margin: 24px 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

thead {
  background: var(--blue-primary);
  color: white;
}

th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid var(--border);
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:nth-child(even) {
  background: var(--gray-light);
}

td {
  padding: 14px 16px;
  font-size: 0.9rem;
}

td code {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #dc2626;
}

td.exempt {
  color: var(--green-success);
  font-weight: 700;
}

/* ─── GRILLE DES DROITS ──────────────────────────────────────── */
.rights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.right-card {
  background: var(--gray-light);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.right-card:hover {
  border-color: var(--blue-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
}

.right-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.right-card h4 {
  color: var(--blue-dark);
  margin-bottom: 8px;
}

.right-card p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* ─── CONTACT CARD ───────────────────────────────────────────── */
.section-contact {
  background: linear-gradient(135deg, var(--blue-lighter), white);
}

.contact-card {
  background: white;
  border: 2px solid var(--blue-light);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.contact-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 12px;
  align-items: center;
}

.contact-row:last-child {
  border-bottom: none;
}

.contact-row strong {
  min-width: 180px;
  color: var(--blue-dark);
}

.contact-row a {
  color: var(--blue-primary);
  text-decoration: none;
  font-weight: 600;
}

.contact-row a:hover {
  text-decoration: underline;
}

/* ─── LIENS ──────────────────────────────────────────────────── */
.link-inline {
  color: var(--blue-primary);
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.2s;
}

.link-inline:hover {
  color: var(--blue-dark);
}

.emphasis {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left: 4px solid #f59e0b;
  padding: 16px 20px;
  border-radius: 8px;
  font-weight: 600;
  color: #92400e;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .privacy-page {
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

  .section h2 {
    font-size: 1.3rem;
  }

  .cookies-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .rights-grid {
    grid-template-columns: 1fr;
  }

  .cookies-table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 10px 8px;
  }

  .contact-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .contact-row strong {
    min-width: auto;
  }
}
</style>