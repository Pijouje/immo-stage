<script setup>

import { nextTick, onMounted, onUnmounted, ref, reactive } from 'vue'
//definePageMeta({ middleware: 'auth'})
const { data: session } = useAuth()

const { data: contacts, error, refresh: refreshContacts } = await useFetch('/api/users')

if (error.value) {
    console.error("Erreur API Users :", error.value)
}

const contactId = ref(null)
const contactActuel = ref(null)
const messages = ref([])
const nouveauMessage = ref('')
const conversationOuverte = ref(false)
const boxConversation = ref(null)
const totalParContact = reactive({})
const vusParContact = reactive({})  
let intervalId = null
const inputFichier = ref(null)
const imageAgrandie = ref(null)


const estDernierMsgLu = (index) => {
    for (let i = index + 1; i < messages.value.length; i++) {
        const msg = messages.value[i]
        if (msg.expediteurId == Number(session.value?.user?.id) && msg.lu) {
            return false
        }
        if (msg.expediteurId != Number(session.value?.user?.id)) {
            return false
        }
    }
    return true
}

const getNonLus = (userId) => {
    const total = totalParContact[userId] ?? 0
    const vus = vusParContact[userId] ?? total
    return Math.max(0, total - vus)
}

const chargerMessages = async (forceScroll = false) => {
    if (!contactId.value) return
    const data = await $fetch('/api/messages/get?userId=' + contactId.value)
    messages.value = data
    
    if (forceScroll) {
        scrollToBottom()
    }
}

const verifierTousLesMessages = async () => {
    if (!contacts.value) return

    for (const user of contacts.value) {
        const data = await $fetch('/api/messages/get?userId=' + user.id)
        const totalReel = data.length
        totalParContact[user.id] = totalReel
        if (contactId.value === user.id) {
            vusParContact[user.id] = totalReel
            sauvegarderVus()
        }
        if (vusParContact[user.id] === undefined) {
             vusParContact[user.id] = totalReel
        }
    }
}

const chargerMemoireVus = () => {
    if (import.meta.client) { // Sécurité pour Nuxt
        const memoire = localStorage.getItem('messagerie_vus')
        if (memoire) {
            Object.assign(vusParContact, JSON.parse(memoire))
        }
    }
}

// Sauvegarde quand on lit un message
const sauvegarderVus = () => {
    if (import.meta.client) {
        localStorage.setItem('messagerie_vus', JSON.stringify(vusParContact))
    }
}

const ouvrirConversation = async (user) => {
    contactId.value = user.id
    contactActuel.value = user
    conversationOuverte.value = true
    vusParContact[user.id] = totalParContact[user.id] ?? 0
    sauvegarderVus()

    try {
        await $fetch('/api/messages/read', {
            method: 'POST',
            body: { contactId: user.id }
        })
    } catch (e) { console.error(e) }
    await chargerMessages(true) 
}

const fermerConversation = () => {
    conversationOuverte.value = false
    contactId.value = null
}

const envoyerMessages = async () => {
    if (!nouveauMessage.value || !contactId.value){
        return
    }
    try {
        await $fetch('/api/messages/send', {
            method: 'POST',
            body: { destinataireId: contactId.value, contenu: nouveauMessage.value }
        })
        nouveauMessage.value = ''
        chargerMessages(true)
        refreshContacts()
    } catch (e) {
        alert("Erreur : " + e)
    }
}

const scrollToBottom = async () => {
    await nextTick()
    if (boxConversation.value) {
        setTimeout(() => {
             boxConversation.value.scrollTop = boxConversation.value.scrollHeight
        }, 50)
    }
}

onMounted(() => {
    chargerMemoireVus()
    verifierTousLesMessages()
    intervalId = setInterval(() => {
        if (contactId.value) chargerMessages(false)
        verifierTousLesMessages()
    }, 2000)
})

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const aujourd = new Date()
    
    const memeJour = d.toDateString() === aujourd.toDateString()
    if (memeJour) {
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    
    const hier = new Date(aujourd)
    hier.setDate(hier.getDate() - 1)
    if (d.toDateString() === hier.toDateString()) return 'Hier'
    
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

const envoyerFichier = async (event) => {
    const fichier = event.target.files[0]
    if (!fichier || !contactId.value){
        return
    }

    const TAILLE_MAX = 5 * 1024 * 1024;
    if (fichier.size > TAILLE_MAX) {
        alert("⚠️ Le fichier est trop lourd ! (Max 5 Mo)");
        event.target.value = ''
        return;
    }
    const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!TYPES_AUTORISES.includes(fichier.type)) {
        alert("⛔ Type de fichier non autorisé.");
        event.target.value = ''
        return;
    }

    const formData = new FormData()
    formData.append('fichier', fichier)
    formData.append('destinataireId', contactId.value)

    try {
        await $fetch('/api/messages/upload', {
            method: 'POST',
            body: formData
        })
        chargerMessages(true)
        refreshContacts()
    } catch (e) {
        alert("Erreur upload : " + e)
    } finally {
        event.target.value = ''
    }
}

const ouvrirImage = (url) => {
    imageAgrandie.value = url
}

const fermerImage = () => {
    imageAgrandie.value = null
}

const fichiersPartages = computed(() => {
    return messages.value.filter(msg => msg.type === 'image' || msg.type === 'fichier').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// DANS LE SCRIPT SETUP

const supprimerFichier = async (fichier) => {
    const monId = Number(session.value?.user?.id)
    const expediteurId = Number(fichier.expediteurId)
    if (monId !== expediteurId) {
        alert("Erreur: Vous ne pouvez supprimer que vos propres fichiers.")
        return
    }

    if (!confirm("Voulez-vous vraiment supprimer ce fichier ?")){ 
        return 
    }

    try {
        await $fetch('/api/messages/delete', {
            method: 'POST',
            body: { id: fichier.id }
        })
        messages.value = messages.value.filter(m => m.id !== fichier.id)
        
    } catch (e) {
        alert("Erreur lors de la suppression : " + e)
    }
}
</script>

<template>
  <div class="page">
    <div class="carte" :class="{ 'mode-chat': conversationOuverte }">
      <div class="partie-gauche">
        <h2>Mes Messages</h2>
        
        <div v-if="contacts && contacts.length > 0">
            <div 
                v-for="user in contacts" 
                :key="user.id" 
                class="contact" 
                :class="{ active: contactId === user.id }"
                @click="ouvrirConversation(user)"
            >
              <div class="avatar"></div>
              
                <div class="info-text">
                    <div class="top-line">
                        <strong>{{ user.prenom }} {{ user.nom }}</strong>
                        <span class="date-message">{{ formatDate(user.dernierMessage) }}</span>
                    </div>
                    <div class="preview-line">
                        <p class="preview-message" :class="{ 'non-lu': getNonLus(user.id) > 0 }">
                            {{ user.dernierContenu ?? 'Cliquez pour discuter...' }}
                        </p>
                        <span v-if="getNonLus(user.id) > 0" class="badge">
                            {{ getNonLus(user.id) }}
                        </span>
                        <span v-else-if="user.monDernierMessageLu" class="vu-contact">
                            Vu
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="aucun-utilisateur">
            Aucun autre utilisateur trouvé.
        </div>

      </div>
      <div class="zone-chat">
        
        <div class="haut-contact">
            <template v-if="contactActuel">
                <button class="btn-retour" @click="fermerConversation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div class="avatar-chat"></div>
                <div class="chat-info">
                    <h3>{{ contactActuel.prenom }} {{ contactActuel.nom }}</h3>
                    <div class="status-container">
                        <span class="pastille-verte"></span>
                        <span class="status-text">En ligne</span>
                    </div>
                </div>
                <div class="concernant">
                    <div class="Logo_Cercle">🏠</div>
                    <p>Concernant : T2 Meublé - Saint-Leu</p>
                </div>
            </template>

            <template v-else>
                <div class="chat-info">
                    <h3>Nom du Contact</h3>
                </div>
            </template>
        </div>

        
        
        <div class="conversation" ref="boxConversation">
            
            <template v-if="contactId">
                <div v-for="(msg, index) in messages" :key="msg.id" 
                    :class="msg.expediteurId == Number(session?.user?.id) ? 'receveur' : 'destinataire'">
                    
                    <div class="message-wrapper">
                        <div :class="[msg.expediteurId == Number(session?.user?.id) ? 'message-envoye' : 'message-recu',msg.type === 'image' ? 'message-image' : '']">
                            <img v-if="msg.type === 'image'" :src="msg.contenu" class="msg-image" @click.stop="ouvrirImage(msg.contenu)"/>
                            <a v-else-if="msg.type === 'fichier'" :href="msg.contenu" target="_blank" class="msg-fichier">
                                📄 {{ msg.contenu.split('/').pop() }}
                            </a>
                            <p v-else>{{ msg.contenu }}</p>
                            <div :class="msg.expediteurId == Number(session?.user?.id) ? 'heure-receveur' : 'heure-destinataire'">
                                {{ new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                            </div>
                        </div>
                        <span v-if="msg.expediteurId == Number(session?.user?.id) && msg.lu && estDernierMsgLu(index)"class="vu-texte">
                            Vu
                        </span>
                    </div>
                </div>
            </template>
            <div v-else class="message-attente">
                <p>👈 Sélectionner la conversation pour plus d'infos</p>
            </div>

        </div>
        <div class="partie-envoie" v-if="contactId">
            <input 
                type="file" 
                ref="inputFichier" 
                @change="envoyerFichier" 
                style="display: none"
                accept="image/*,.pdf,.doc,.docx"
            />
            <button class="btn-trombone" @click="inputFichier.click()">📎</button>
            <input type="text" v-model="nouveauMessage" placeholder="Ecrivez votre texte ..." class="champ-texte" @keyup.enter="envoyerMessages" />
            <button class="btn-envoyer" @click="envoyerMessages">Envoyer</button>
        </div>

      </div>
    </div>
    <div v-if="contactId && fichiersPartages.length > 0" class="panneau-fichiers-externe">
        <div class="fichiers-container">
            <h3>📁 Fichiers partagés avec {{ contactActuel?.prenom }} {{ contactActuel?.nom }} ({{ fichiersPartages.length }})</h3>
            
            <div class="fichiers-liste">
                <div v-for="fichier in fichiersPartages" :key="fichier.id" class="fichier-item-externe">
                    <div 
                        v-if="fichier.type === 'image'" 
                        class="fichier-thumb-externe"
                        :style="{ backgroundImage: `url(${fichier.contenu})` }"
                        @click="ouvrirImage(fichier.contenu)"
                    ></div>
                    <div v-else class="fichier-thumb-externe fichier-doc-externe">📄</div>
                    
                    <div class="fichier-details">
                        <div class="fichier-nom-externe">{{ fichier.contenu.split('/').pop() }}</div>
                        <div class="fichier-date-externe">
                            {{ new Date(fichier.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                        </div>
                    </div>
                    
                    <div class="fichier-actions-externe">
                        <a :href="fichier.contenu" :download="fichier.contenu.split('/').pop()" class="btn-action-externe">
                            ⬇ Télécharger
                        </a>
                        <button class="btn-action-externe btn-supprimer-externe" @click="supprimerFichier(fichier)">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Transition name="fade">
        <div v-if="imageAgrandie" class="lightbox-img-overlay" @click="fermerImage">
            <img :src="imageAgrandie" class="lightbox-img-grande" @click.stop />
            <a 
                :href="imageAgrandie" 
                :download="imageAgrandie.split('/').pop()"
                class="btn-telecharger"
                @click.stop
            >
                ⬇ Télécharger l'image
            </a>
        </div>
    </Transition>
  </div>
</template>

<style scoped>
.page {
    height: auto; 
    width: 100%;
    background-image: url('/images/bg.png');
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding: 20px; 
    box-sizing: border-box;
    gap: 20px;
    overflow-y: auto;
}

.carte {
    background-color: white;
    width: 100%;
    max-width: 1200px; 
    height: 600px; 
    min-height: 600px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    display: flex; 
    flex-direction: row; 
    overflow: hidden;
    flex-shrink: 0;
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
    align-items: center;
    margin-bottom: 8px;
}

.contact strong {
    font-size: 15px;
    color: #0f172a;
    flex: 1; 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    flex: 1;
}

.preview-message.non-lu {
    font-weight: 700;
    color: #0f172a;
}

.preview-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
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
    overflow-wrap: break-word;
    white-space: pre-wrap;
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
    font-size: 1.4rem; /* ← Ajoute ça */
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

.aucun-utilisateur { 
    padding: 20px;
    text-align: center;
    color: gray;
}

.badge {
    background-color: #2563EB;
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    flex-shrink: 0;
}

.message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 60%;
}

.receveur .message-wrapper {
    align-items: flex-end;
}

.destinataire .message-wrapper {
    align-items: flex-start;
}

.vu-texte {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 7px;
    align-self: flex-end;
    padding-right: 2px;
}

.vu-contact {
    font-size: 0.72rem;
    color: #94a3b8;
    flex-shrink: 0;
}

.lightbox-img-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.lightbox-img-grande {
    max-width: 90%;
    max-height: 90vh;
    border-radius: 8px;
    object-fit: contain;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.msg-image {
    display: block;
    max-width: 220px;
    max-height: 220px;
    width: 100%;
    border-radius: 12px;
    cursor: pointer;
    object-fit: cover;
    transition: opacity 0.2s;
}

.msg-image:hover {
    opacity: 0.85;
}

.message-image {
    padding: 4px;
    background: transparent;
    border: none;
    box-shadow: none;
}

.message-image .heure-receveur,
.message-image .heure-destinataire {
    padding: 0 4px;
    color: #94a3b8;
}

.msg-fichier {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    padding: 4px 0;
}


.message-attente {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.95rem;
}

.btn-telecharger {
    position: absolute;
    bottom: 30px;
    background: white;
    color: #01111d;
    padding: 10px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: opacity 0.2s;
}

.btn-telecharger:hover {
    opacity: 0.85;
}

.panneau-fichiers-externe {
    width: 100%;
    max-width: 1200px;
}

.fichiers-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    padding: 25px 30px;
    height: 300px;
    display: flex;
    flex-direction: column;
}

.fichiers-container h3 {
    margin: 0 0 20px 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
}

.fichiers-liste {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    flex: 1;
    padding-right: 10px;
}

.fichier-item-externe {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: box-shadow 0.2s;
}

.fichier-item-externe:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.fichier-thumb-externe {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    cursor: pointer;
    border: 2px solid #e2e8f0;
}

.fichier-doc-externe {
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
}

.fichier-details {
    flex: 1;
}

.fichier-nom-externe {
    font-size: 0.95rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 4px;
}

.fichier-date-externe {
    font-size: 0.8rem;
    color: #94a3b8;
}

.fichier-actions-externe {
    display: flex;
    gap: 10px;
}

.btn-action-externe {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: #2563EB;
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.2s;
}

.btn-action-externe:hover {
    background: #1d4ed8;
}

.btn-supprimer-externe {
    background: #ef4444;
}

.btn-supprimer-externe:hover {
    background: #dc2626;
}

.fichiers-liste::-webkit-scrollbar {
    width: 8px;
}

.fichiers-liste::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.fichiers-liste::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.fichiers-liste::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

@media (max-width: 768px) {
    
    .concernant {
        display: none;
    }
    
    .page {
        padding: 0;
        height: auto; 
        max-height: none; 
        overflow-y: auto; 
        display: block;
    }
    
    .carte {
        height: calc(100vh - 90px);
        border-radius: 0;
        max-width: 100%;
        margin-bottom: 20px;
    }

    .partie-envoie {
        padding: 0 10px;
        gap: 8px;
    }

    .btn-envoyer {
        padding: 10px 12px;
        font-size: 0.85rem;
        flex-shrink: 0;
    }

    .champ-texte {
        min-width: 0;
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

    .panneau-fichiers-externe {
        margin-top: 20px;
        padding: 0 15px 20px 15px;
        box-sizing: border-box;
    }
    
    .fichiers-container {
        border-radius: 16px;
        height: auto;
        max-height: 400px;
    }
    .fichier-item-externe {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .fichier-actions-externe {
        width: 100%;
        justify-content: space-between;
        gap: 10px;
    }

    .btn-action-externe {
        flex: 1;
        justify-content: center;
        font-size: 0.8rem;
        padding: 10px;
    }
}

</style>