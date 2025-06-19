# 🔧 Guide de Dépannage CommUnity

## ❌ Problème : Impossible d'envoyer des messages

### Cause probable : Règles Firestore non configurées

**Solution :**

1. **Allez dans la Console Firebase :**
   - Ouvrez https://console.firebase.google.com/project/community-fea1f
   - Connectez-vous avec votre compte Google

2. **Configurez Firestore :**
   - Cliquez sur **"Firestore Database"** dans le menu de gauche
   - Si ce n'est pas fait, cliquez sur **"Créer une base de données"**
   - Choisissez **"Commencer en mode test"**
   - Sélectionnez une région (Europe par exemple)

3. **Configurez les règles de sécurité :**
   - Dans Firestore, allez dans l'onglet **"Règles"**
   - Remplacez le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Règles pour les messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Cliquez sur "Publier"**

## ❌ Problème : Impossible de se déconnecter

### Cause probable : Erreur dans la gestion de l'état

**Solution :**

1. **Rechargez la page** (F5 ou Ctrl+R)
2. **Videz le cache du navigateur** :
   - Chrome : F12 → Application → Storage → Clear storage
   - Firefox : F12 → Storage → Clear All

## ❌ Problème : Erreurs d'authentification

### Cause probable : Service d'authentification non activé

**Solution :**

1. **Allez dans la Console Firebase**
2. **Cliquez sur "Authentication"**
3. **Allez dans l'onglet "Sign-in method"**
4. **Activez "Email/Password" :**
   - Cliquez sur "Email/Password"
   - Activez le premier bouton (Email/Password)
   - Cliquez sur "Enregistrer"

## 🔄 Redémarrage complet

Si les problèmes persistent :

1. **Arrêtez le serveur** (Ctrl+C dans le terminal)
2. **Redémarrez l'application :**
   ```bash
   npm run web
   ```
3. **Ouvrez http://localhost:8081 dans un nouvel onglet**

## 🆘 Vérification rapide

### Checklist Firebase :
- [ ] Projet Firebase créé
- [ ] Authentication activée (Email/Password)
- [ ] Firestore Database créée
- [ ] Règles Firestore configurées
- [ ] Configuration dans `config/firebase.ts` correcte

### Checklist Application :
- [ ] Serveur de développement démarré
- [ ] Aucune erreur dans la console du navigateur
- [ ] Page accessible sur http://localhost:8081

## 📞 Support

Si vous avez encore des problèmes :

1. **Ouvrez la console du navigateur** (F12)
2. **Regardez les erreurs** dans l'onglet "Console"
3. **Copiez les messages d'erreur** pour diagnostic

## 🎯 Test rapide

Pour tester si tout fonctionne :

1. **Créez un compte admin** avec le code `ADMIN2024`
2. **Connectez-vous**
3. **Essayez d'envoyer un message**
4. **Testez la déconnexion**

Si ces 4 étapes fonctionnent, l'application est correctement configurée !
