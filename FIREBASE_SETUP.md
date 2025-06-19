# Configuration Firebase pour CommUnity

## Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: "community-app")
4. Suivez les étapes de création

### 2. Configurer Authentication

1. Dans la console Firebase, allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Dans l'onglet "Sign-in method", activez "Email/Password"

### 3. Configurer Firestore Database

1. Allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Commencer en mode test" (pour le développement)
4. Sélectionnez une région proche de vous

### 4. Configurer Storage (optionnel)

1. Allez dans "Storage"
2. Cliquez sur "Commencer"
3. Acceptez les règles par défaut

### 5. Obtenir la configuration

1. Allez dans "Paramètres du projet" (icône engrenage)
2. Faites défiler jusqu'à "Vos applications"
3. Cliquez sur l'icône web (</>)
4. Nommez votre app (ex: "CommUnity Web")
5. Copiez la configuration qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 6. Mettre à jour la configuration

1. Ouvrez le fichier `config/firebase.ts`
2. Remplacez les valeurs dans `firebaseConfig` par vos vraies valeurs

### 7. Règles de sécurité Firestore

Remplacez les règles par défaut par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Permet aux autres utilisateurs de lire les profils
    }
    
    // Règles pour les messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 8. Règles de sécurité Storage (si utilisé)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Code administrateur

Le code administrateur par défaut est : `ADMIN2024`

Vous pouvez le changer dans le fichier `app/auth/register.tsx` ligne 18.

## Test de l'application

1. Lancez l'application : `npm run web` ou `npm run ios` ou `npm run android`
2. Créez un compte administrateur avec le code `ADMIN2024`
3. Testez les fonctionnalités de chat et d'ajout d'employés

## Fonctionnalités implémentées

✅ Authentification (connexion/inscription)
✅ Gestion des rôles (admin/employé)
✅ Chat en temps réel
✅ Ajout d'employés par l'admin
✅ Interface responsive
✅ Gestion des erreurs

## Fonctionnalités optionnelles à ajouter

- Upload de fichiers dans le chat
- Notifications push
- Gestion des équipes/groupes
- Modération des messages
- Historique des connexions
