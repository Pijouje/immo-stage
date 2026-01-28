<script setup>
import { ref } from 'vue'

const nom = ref('')
const message = ref("Bonjour Maitre Gims, je vous envoie le dossier complet dès ce soir.")

const heureActuelle = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="page">
    <div class="carte">
      <div class="partie-gauche">
        <h2>Mes Messages</h2>
        
        <div class="contact active">
          
          <div class="avatar"></div>
          
          <div class="info-text">
              
              <div class="top-line">
                  <strong>Maitre le Gims {{ nom }}</strong>
                  <span class="date-message">{{ heureActuelle }}</span>
              </div>

              <p class="preview-message">{{ message }}</p>
          </div>
        </div>

        <div class="contact inactive">
          
          <div class="avatar"></div>
          
          <div class="info-text">
              
              <div class="top-line">
                  <strong>Maitre le Gims {{ nom }}</strong>
                  <span class="date-message">{{ heureActuelle }}</span>
              </div>

              <p class="preview-message">{{ message }}</p>
          </div>
        </div>
      </div>
      <div class="zone-chat">
        <div class="haut-contact">
          <div class="avatar-chat"></div>
          <div class="chat-info">
            <h3>Maitre le Gims</h3>
          
            <div class="status-container">
                <span class="pastille-verte"></span>
                <span class="status-text">En ligne</span>
            </div>
          </div>

          <div class="concernant">
            <div class="Logo_Cercle">🏠</div>
            <p>Concernant : T2 Meublé - Saint-Leu</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- MISE EN PAGE GLOBALE --- */
.page {
    min-height: calc(100vh - 90px);
    width: 100%;
    background-image: url('/images/bg.png');
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carte {
    background-color: white;
    width: 100%;
    max-width: 1200px; 
    height: 600px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    display: flex; 
    flex-direction: row; 
    margin: 80px auto; 
    box-sizing: border-box;
    transform: translateY(-27px);
    overflow: hidden;
}

/* --- COLONNE GAUCHE --- */
.partie-gauche {
    width: 320px;
    height: 100%;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
}

.carte h2 {
    text-align: left;
    padding: 20px 25px;
    margin: 0;
    border-bottom: 1.5px solid #e2e8f0;
    font-size: 1.2rem;
}

/* --- LE CONTACT --- */
.contact {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    cursor: pointer;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s;
}

.contact.active {
    background-color: #f1f5f9;
    border-left: #2563EB 4.5px solid; 
}

.contact:hover {
    background-color: #f8fafc;
}

.avatar {
    background-image: url('/images/Gims.webp');
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
}

.info-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}


.top-line {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
}

.contact strong {
    font-size: 15px;
    color: #0f172a;
}

.date-message {
    font-size: 12px;
    color: #64748b;
}

.preview-message {
    margin: 0;
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.haut-contact {
    height: 80px;
    background-color: white;
    border-bottom: 1px solid #e2e8f0;
    width: 100%; 
    display: flex;
    align-items: center;
    padding: 0 30px;
    box-sizing: border-box;
}

.avatar-chat {
    background-image: url('/images/Gims.webp');
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    margin-right: 20px;
}

.chat-info{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.chat-info h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #0f172a;
}

.status-container {
    display: flex;
    align-items: center;
    margin-top: 5px;
}

.pastille-verte {
    width: 8px;
    height: 8px;
    background-color: #22c55e;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
}

.status-text {
    font-size: 0.8rem;
    color: #22c55e;
    font-weight: 500;
}

.concernant {
    background-color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 8px;
    margin-right: 50px;
    padding: 1px 10px; 
}

.concernant p {
    color: #2563EB;
    font-size: 0.85rem;
    font-weight: 600;
}

.zone-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f8fafc;
}


</style>