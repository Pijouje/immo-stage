<template>
  <footer class="site-footer">
    <div class="footer-container">
      
      <div class="footer-col brand-col">
        <h3>NOM DU SITE</h3>
        <p>Petit texte sympa</p>
      </div>

      <div class="footer-col">
        <h3>AIDE</h3>
        <ul>
          <li><NuxtLink to="/plan-du-site">Plan du site</NuxtLink></li>
          <li><NuxtLink to="/contact">Nous contacter</NuxtLink></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3>LEGAL</h3>
        <ul>
          <li><NuxtLink to="/mentions-legales">Mentions Légales</NuxtLink></li>
          <li><NuxtLink to="/politique-confidentialite">Politique de confidentialité</NuxtLink></li>
          <li><NuxtLink to="/cgu">CGU / CGV</NuxtLink></li>
          <li><button class="link-btn">Gestion des cookies</button></li>
        </ul>
      </div>

    </div>

    <div class="footer-bottom">
      <div class="separator"></div>
      <p>BY M&A</p>
    </div>
  </footer>
</template>

<style scoped>
/* --- STYLE GLOBAL DU FOOTER --- */
.site-footer {
  background-color: #01111d; /* Même couleur que ta Navbar */
  color: white;
  padding: 30px 0 15px 0;
  font-family: 'Segoe UI', sans-serif;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; /* Espacement égal entre les colonnes */
  padding: 0 5%; /* Marge de sécurité sur les côtés */
  flex-wrap: wrap; /* Pour le mobile */
  gap: 40px;
}

/* --- COLONNES --- */
.footer-col {
  flex: 1; /* Chaque colonne prend la même largeur */
  min-width: 200px;
  text-align: center; /* Tout centré comme sur la maquette */
}

.footer-col h3 {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 15px;
  color: white;
}

.brand-col p {
  font-size: 0.9rem;
  font-weight: 400;
  opacity: 0.8;
}

/* --- LIENS --- */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 6px;
}

a, .link-btn {
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 0.8;
  transition: opacity 0.3s, transform 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

a:hover, .link-btn:hover {
  opacity: 1;
  text-decoration: underline; /* Petit détail UX classique */
}

/* --- BAS DE PAGE (BY M&A) --- */
.footer-bottom {
  margin-top: 25px;
  text-align: center;
  padding: 0 5%;
}

.separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1); /* Ligne très subtile */
  width: 100%;
  margin-bottom: 20px;
}

.footer-bottom p {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.6;
}

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>