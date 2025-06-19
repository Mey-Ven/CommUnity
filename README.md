# CommUnity 💬

Une application mobile de communication d'équipe développée avec React Native et Expo.

## 🎯 Fonctionnalités

✅ **Authentification complète**
- Connexion / Inscription avec Firebase Auth
- Gestion des rôles (Admin / Employé)
- Code administrateur pour créer des comptes admin

✅ **Chat en temps réel**
- Messages instantanés pour toute l'équipe
- Interface intuitive et responsive
- Affichage des timestamps

✅ **Gestion des employés (Admin)**
- Ajout de nouveaux employés
- Liste des utilisateurs avec leurs rôles
- Interface d'administration dédiée

✅ **Profil utilisateur**
- Informations personnelles
- Déconnexion sécurisée
- Affichage du rôle et date d'inscription

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd CommUnity
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase**
   - Suivez les instructions dans `FIREBASE_SETUP.md`
   - Remplacez la configuration dans `config/firebase.ts`

4. **Lancer l'application**
   ```bash
   npm run web    # Pour le web
   npm run ios    # Pour iOS
   npm run android # Pour Android
   ```

## 🔧 Technologies utilisées

- **React Native** avec Expo
- **Firebase** (Auth, Firestore, Storage)
- **React Navigation** pour la navigation
- **TypeScript** pour le typage
- **Expo Router** pour le routing

## 📱 Écrans

1. **Authentification**
   - Connexion
   - Inscription (avec option admin)

2. **Chat principal**
   - Messages en temps réel
   - Interface de saisie

3. **Administration** (Admin uniquement)
   - Ajout d'employés
   - Liste des utilisateurs

4. **Profil**
   - Informations utilisateur
   - Déconnexion

## 🔐 Rôles et permissions

### Administrateur
- Peut ajouter de nouveaux employés
- Accès à l'interface d'administration
- Toutes les fonctionnalités employé

### Employé
- Accès au chat d'équipe
- Gestion de son profil
- Consultation des messages

## 🎨 Design

- Interface moderne et épurée
- Couleurs cohérentes (bleu #007AFF)
- Responsive design
- Animations fluides

## 📋 Code administrateur

Le code par défaut pour créer un compte administrateur est : **ADMIN2024**

Vous pouvez le modifier dans `app/auth/register.tsx` ligne 18.

## 🔮 Fonctionnalités futures

- Upload de fichiers dans le chat
- Notifications push
- Gestion des équipes/groupes
- Modération des messages
- Mode sombre
- Recherche dans les messages

## 📄 Licence

Ce projet est sous licence MIT.
