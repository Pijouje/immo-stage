<script setup>
definePageMeta({

  pageTransition: {
    name: 'auth',
    mode: 'out-in'
  }
})


import { ref } from 'vue'

const user = ref({
    prenom: 'Thomas',
    nom: 'Dubois',
    email: 'thomas.dubois@exemple.fr',
    passwordMasked: '••••••••••••' 
})

const documents = ref([
    { id: 1, nom: 'Carte d\'identité (Recto/Verso)', type: 'pdf' },
    { id: 2, nom: 'Justificatif de domicile (-3 mois)', type: 'pdf' },
    { id: 3, nom: 'Dernier avis d\'imposition', type: 'jpg' }
])

const handleEditProfile = (field) => {
    console.log("Modifier le champ :", field)
    // Logique pour ouvrir un formulaire de modification
}

const handleEditPassword = () => {
    console.log("Redirection vers la modification du mot de passe")
}

const handleAddDocument = () => {
    console.log("Ouvrir l'explorateur de fichiers")
}

</script>

<template>
  <div class="profile-page">
    <div class="Carte">
        <div class="Haut_carte">
            <h1>Test Utilisateur</h1>
        </div>

        <div class="Contenu_Profil">
            
            <div class="Profil_Header">
                <div class="Avatar_Profil">
                    <span class="Avatar_Initiales">{{ user.prenom[0] }}{{ user.nom[0] }}</span>
                </div>
                <div class="Info_Principales">
                    <div class="Editable_Field">
                        <h2 class="Nom_Complet">{{ user.prenom }} {{ user.nom }}</h2>
                        <button class="Btn_Edit_Icon" @click="handleEditProfile('name')" aria-label="Modifier le nom">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                    </div>
                    <div class="Editable_Field">
                        <p class="Email_User">{{ user.email }}</p>
                        <button class="Btn_Edit_Icon" @click="handleEditProfile('email')" aria-label="Modifier l'email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="Separateur"></div>

            <div class="Section_Securite">
                <div class="Groupe_Info">
                    <label>Mot de passe</label>
                    <div class="Password_Row">
                        <span class="Password_Value">{{ user.passwordMasked }}</span>
                        <button @click="handleEditPassword" class="Lien_Modifier">Modifier</button>
                    </div>
                </div>
            </div>

            <div class="Separateur"></div>

            <div class="Section_Documents">
                <h3>Mes documents</h3>
                
                <div class="Liste_Documents">
                    <div v-for="doc in documents" :key="doc.id" class="Document_Item">
                        <div class="Doc_Icone">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <span class="Doc_Nom">{{ doc.nom }}</span>
                    </div>
                </div>

                <Bouton @click="handleAddDocument" class="Btn_Ajout_Doc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Ajouter un document
                </Bouton>
            </div>

        </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f1f5f9;
    min-height: calc(100vh - 90px); 
    display: flex;
    flex-direction: column;
}

/* --- MODIFICATION : CARTE PLUS LARGE SUR PC --- */
.Carte {
    background-color: white;
    width: 100%;
    /* Changement : au lieu de 600px, on prend 800px ou 2/3 de l'écran */
    max-width: 800px; 
    padding: 60px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    border-top: #2563EB 6px solid; 
    display: flex;
    flex-direction: column;
    margin: 80px auto; 
    box-sizing: border-box;
}

/* On peut ajouter une media query pour les très grands écrans */
@media (min-width: 1200px) {
    .Carte {
        /* Sur grand écran, la carte prendra environ 66% de la largeur */
        max-width: 66%; 
    }
}

.Haut_carte {
    text-align: center;
    margin-bottom: 40px;
}

.Haut_carte h1 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 900;
    color: #000;
}

.Contenu_Profil {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.Profil_Header {
    display: flex;
    align-items: center;
    gap: 25px;
}

.Avatar_Profil {
    width: 80px;
    height: 80px;
    background-color: #2563EB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 4px solid #f1f5f9;
}

.Avatar_Initiales {
    color: white;
    font-size: 1.8rem;
    font-weight: 700;
    text-transform: uppercase;
}

.Info_Principales {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

/* --- NOUVEAU : Style pour le champ modifiable (Nom + Crayon) --- */
.Editable_Field {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Bouton Crayon discret */
.Btn_Edit_Icon {
    background: none;
    border: none;
    color: #94a3b8; /* Gris discret par défaut */
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0; /* Invisible par défaut */
}

/* Le crayon apparaît quand on survole le champ */
.Editable_Field:hover .Btn_Edit_Icon {
    opacity: 1;
}

.Btn_Edit_Icon:hover {
    color: #2563EB;
    background-color: #f1f5f9;
}


.Nom_Complet {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
}

.Email_User {
    margin: 0;
    color: #64748b;
    font-size: 1rem;
}

.Separateur {
    height: 1px;
    background-color: #e2e8f0;
    width: 100%;
}

label {
    font-size: 0.9rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
}

.Password_Row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.Password_Value {
    font-size: 1.1rem;
    color: #334155;
    font-family: monospace;
    letter-spacing: 2px;
}

.Lien_Modifier {
    background: none;
    border: none;
    color: #2563EB;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background 0.2s;
}

.Lien_Modifier:hover {
    background-color: #dbeafe;
}

.Section_Documents h3 {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
}

.Liste_Documents {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 25px;
}

.Document_Item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: 0.2s;
}

.Document_Item:hover {
    border-color: #bfdbfe;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.Doc_Icone {
    color: #64748b;
    margin-right: 15px;
    display: flex;
}

.Doc_Nom {
    font-weight: 600;
    color: #334155;
    flex: 1;
}

.Btn_Ajout_Doc {
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    align-self: flex-start;
    padding: 12px 24px;
}


@media (max-width: 768px) {
    .profile-page{
        min-height: auto; 
        padding-bottom: 40px;
    }

    .Carte {
        margin: 40px auto; 
        width: 90%;
        max-width: 100%; /* Annule la contrainte PC */
        padding: 30px 20px; 
    }

    .Haut_carte h1 {
        font-size: 1.8rem;
    }

    .Profil_Header {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .Info_Principales {
        align-items: center;
    }
    
    /* Sur mobile, le crayon est toujours visible car pas de survol */
    .Btn_Edit_Icon {
        opacity: 1;
        color: #2563EB; /* Plus visible sur mobile */
    }

    .Password_Row {
        padding: 15px;
    }

    .Btn_Ajout_Doc {
        width: 100%;
    }
}

@media (max-width: 380px) {
    .Carte {
        margin: 20px auto;
        padding: 20px 15px;
    }
    
    .Haut_carte h1 {
        font-size: 1.5rem;
    }

    .Nom_Complet {
        font-size: 1.3rem;
    }
}
</style>