<script setup>
/*definePageMeta({ middleware: 'auth'})
const { data: session } = useAuth()*/

const session = ref({ user: { id: 1 } }) 

const contactId = ref(2)
const messages = ref([])
const nouveauMessage = ref('')

const chargerMessages = async () => {
    const data = await $fetch('/api/messages/get?contactId=' + contactId.value)
    messages.value = data
}

const envoyerMessages = async () => {
    
    if(!nouveauMessage.value){
        return
    }

    await $fetch('/api/messages/send', {
        method: 'POST',
        body: {
            destinataireId: contactId.value,
            contenu: nouveauMessage.value
        }
    })

    nouveauMessage.value = ''
    chargerMessages()
}

onMounted(() => {
    chargerMessages()
    setInterval(chargerMessages, 3000)
})

const heureActuelle = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="page">
    <div class="carte" :class="{ 'mode-chat': conversationOuverte }">
      <div class="partie-gauche">
        <h2>Mes Messages</h2>
        
        <div class="contact active" @click="ouvrirConversation">
          
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
            <button class="btn-retour" @click="fermerConversation">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>
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
        <div class="conversation">
            <div v-for="msg in messages" :key="msg.id" 
                :class="msg.expediteurId == session?.user?.id ? 'receveur' : 'destinataire'">
                <div :class="msg.expediteurId == session?.user?.id ? 'message-envoye' : 'message-recu'">
                    <p>{{ msg.contenu }}</p>
                
                    <div :class="msg.expediteurId == session?.user?.id ? 'heure-receveur' : 'heure-destinataire'">
                        {{ new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                </div>

            </div>

        </div>
        <div class="partie-envoie">
            <button class="btn-trombone">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            
            <input type="text" v-model="nouveauMessage" placeholder="Ecrivez votre texte ..." class="champ-texte"@keyup.enter="envoyerMessages" />
            
            <button class="btn-envoyer" @click="envoyerMessages">Envoyer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
    height: calc(100vh - 90px); 
    width: 100%;
    background-image: url('/images/bg.png');
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px; 
    box-sizing: border-box;
}

.carte {
    background-color: white;
    width: 100%;
    max-width: 1200px; 
    height: 85%; 
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    display: flex; 
    flex-direction: row; 
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

.conversation {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
}

.destinataire {
    display: flex;
    justify-content: flex-start;
    padding: 10px 30px;
    width: 100%;
    box-sizing: border-box;
    background-color: transparent;
}

.receveur {
    display: flex;
    justify-content: flex-end;
    padding: 10px 30px;
    width: 100%;
    box-sizing: border-box;
    background-color: transparent;
}

.message-recu {
    background-color: white;
    padding: 15px 20px;
    border-radius: 20px 20px 20px 0;
    border: 1px solid #e2e8f0;
    max-width: 60%;
    width: fit-content;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.message-envoye {
    background-color: #2563EB;
    color: white;
    padding: 15px 20px;
    border-radius: 20px 20px 0 20px;
    max-width: 60%;
    width: fit-content;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.message-recu p, .message-envoye p {
    margin: 0;
    line-height: 1.4;
}

.heure-destinataire {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 5px;
    text-align: right;
}

.heure-receveur {
    font-size: 0.75rem;
    color: white;
    margin-top: 5px;
    text-align: right;
}

/* --- LA BARRE D'ENVOI --- */
.partie-envoie {
    height: 80px;
    background-color: white;
    border-top: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 30px;
    gap: 15px;
}

.btn-trombone {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
}

.btn-trombone:hover {
    color: #2563EB;
}

.champ-texte {
    flex: 1;
    background-color: #f1f5f9;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #334155;
    outline: none;
}

.champ-texte::placeholder {
    color: #94a3b8;
}


.btn-envoyer {
    background-color: #2563EB;
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-envoyer:hover {
    background-color: #1d4ed8;
}

.btn-retour {
    display: none; 
    background: none;
    border: none;
    cursor: pointer;
    color: #334155; 
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%; 
    margin-right: 10px;
    transition: background-color 0.2s;
}


.btn-retour:hover {
    background-color: #f1f5f9; 
}

@media (max-width: 768px) {
    
    .page {
        padding: 0;
        height: calc(100vh - 90px);
    }
    
    .carte {
        height: 100%;
        border-radius: 0;
        max-width: 100%;
    }

    .partie-gauche {
        width: 100%;
        display: flex;
    }

    .zone-chat {
        display: none;
    }

    /* QUAND UNE CONVERSATION EST OUVERTE (Classe .mode-chat active) */
    .carte.mode-chat .partie-gauche {
        display: none;
    }

    .carte.mode-chat .zone-chat {
        display: flex;
        width: 100%;
    }

    .btn-retour {
        display: flex;
    }
}

</style>