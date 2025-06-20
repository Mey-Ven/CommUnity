# 🔥 Configuration Firebase Storage pour CommUnity

## 📋 Étapes de Configuration

### 1. **Activer Firebase Storage**

1. Allez dans la [Console Firebase](https://console.firebase.google.com/project/community-fea1f)
2. Dans le menu de gauche, cliquez sur **"Storage"**
3. Cliquez sur **"Commencer"**
4. Choisissez **"Commencer en mode test"** pour l'instant
5. Sélectionnez une région proche (ex: `europe-west1`)

### 2. **Configurer les Règles de Sécurité**

1. Dans Storage, allez dans l'onglet **"Rules"**
2. Remplacez le contenu par les règles du fichier `storage.rules` :

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Files uploaded by authenticated users
    match /files/{userId}/{fileName} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access only to the file owner
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && isValidFile();
      
      // Allow delete access to file owner or admin
      allow delete: if request.auth != null 
                    && (request.auth.uid == userId || isAdmin());
    }
    
    // Helper functions
    function isValidFile() {
      // Check file size (10MB max)
      return request.resource.size <= 10 * 1024 * 1024
             && isValidFileType();
    }
    
    function isValidFileType() {
      // Allowed file types
      return request.resource.contentType.matches('image/.*') ||
             request.resource.contentType.matches('application/pdf') ||
             request.resource.contentType.matches('application/msword') ||
             request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
             request.resource.contentType.matches('application/vnd.ms-excel') ||
             request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
             request.resource.contentType.matches('application/vnd.ms-powerpoint') ||
             request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
             request.resource.contentType.matches('text/plain');
    }
    
    function isAdmin() {
      // Check if user has admin role in Firestore
      return exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
             get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Cliquez sur **"Publier"**

### 3. **Mettre à Jour les Règles Firestore**

Ajoutez ces règles à votre `firestore.rules` existant :

```javascript
// Ajoutez ces règles à votre fichier firestore.rules existant

// Files metadata
match /files/{fileId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
  allow delete: if request.auth != null && 
                (resource.data.uploaderId == request.auth.uid || 
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}

// Download history
match /downloadHistory/{historyId} {
  allow read: if request.auth != null && 
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if request.auth != null;
}
```

## 🧪 Test de la Configuration

### **Test 1: Upload de Fichier**
1. Connectez-vous à l'application
2. Allez dans l'onglet **"Fichiers"**
3. Cliquez sur **"Partager un fichier"**
4. Sélectionnez un fichier (PDF, image, etc.)
5. ✅ **Résultat attendu**: Upload réussi, fichier visible dans la liste

### **Test 2: Téléchargement**
1. Cliquez sur l'icône de téléchargement d'un fichier
2. ✅ **Résultat attendu**: Fichier téléchargé, compteur incrémenté

### **Test 3: Suppression (Admin)**
1. Connectez-vous avec un compte admin
2. Essayez de supprimer un fichier
3. ✅ **Résultat attendu**: Fichier supprimé avec succès

### **Test 4: Permissions**
1. Connectez-vous avec un compte employé
2. Essayez de supprimer le fichier d'un autre utilisateur
3. ✅ **Résultat attendu**: Erreur de permission

## 📊 Fonctionnalités Disponibles

### ✅ **Upload de Fichiers**
- Support des formats: PDF, Word, Excel, PowerPoint, Images
- Validation de taille (10MB max)
- Validation de type de fichier
- Barre de progression en temps réel
- Gestion des erreurs

### ✅ **Gestion des Fichiers**
- Liste avec recherche et filtres
- Aperçu des métadonnées
- Statistiques de téléchargement
- Tri par date, taille, type

### ✅ **Sécurité**
- Authentification requise
- Règles de sécurité strictes
- Permissions basées sur les rôles
- Validation côté serveur

### ✅ **Administration**
- Statistiques globales
- Gestion des fichiers
- Historique des téléchargements
- Suppression administrative

## 🔧 Dépannage

### **Erreur: "Storage bucket not configured"**
- Vérifiez que Storage est activé dans Firebase Console
- Vérifiez la configuration dans `firebase.ts`

### **Erreur: "Permission denied"**
- Vérifiez les règles de sécurité Storage
- Vérifiez que l'utilisateur est connecté
- Vérifiez les permissions admin

### **Upload échoue**
- Vérifiez la taille du fichier (< 10MB)
- Vérifiez le type de fichier supporté
- Vérifiez la connexion internet

## 🚀 Optimisations Futures

- **Compression d'images** automatique
- **Aperçu de fichiers** intégré
- **Versioning** des fichiers
- **Partage par lien** temporaire
- **Notifications** d'upload
- **Synchronisation offline**

## 📱 Compatibilité

- ✅ **Web**: Fonctionnalité complète
- ⚠️ **Mobile**: Upload limité (nécessite react-native-document-picker)
- ✅ **Téléchargement**: Toutes plateformes

La fonctionnalité de partage de fichiers est maintenant entièrement intégrée à CommUnity !
