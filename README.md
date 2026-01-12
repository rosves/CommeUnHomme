# 🏋️ FITNESS - Plateforme de Gamification d'Entraînement

API REST pour une application de fitness.

### 🔗 **[Accéder à la Collection Postman](https://app.getpostman.com/join-team?invite_code=8882fcb795990e3f8701cc0a47a98abe540c34a1ae15fede9d4579de42f45e78&target_code=93542dcbb232020c4383103a29a5f036)**

---

## 📋 Table des matières
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Démarrage du projet](#-démarrage-du-projet)
- [API Endpoints](#-api-endpoints)
- [Collections Postman](#-collections-postman)

---

## ✨ Fonctionnalités

### 📋 Vue d'ensemble par Rôle

L'API supporte 3 rôles utilisateur avec permissions granulaires :
- **ADMIN** : Gestion globale (users, exercises, badges, récompenses)
- **OWNER** : Gestion de sa propre salle de sport
- **CUSTOMER** : Client fitness (défis, récompenses, badges)

---

## 👨‍💼 **SUPER ADMIN - Gestion Système**

### **Gestion des Types d'Exercices**

**Justification** : L'admin doit contrôler l'offre d'exercices disponibles pour garantir la qualité et la cohérence des défis proposés.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/exercise` | Ajouter un type d'exercice (nom, description, muscles ciblés) | ✅ ADMIN |
| `GET` | `/exercise/all` | Voir tous les exercices disponibles | ❌ PUBLIC |
| `GET` | `/exercise/:id` | Détails d'un exercice | ❌ PUBLIC |
| `PUT` | `/exercise/:id` | Modifier un exercice | ✅ ADMIN |
| `DELETE` | `/exercise/:id` | Supprimer un exercice | ✅ ADMIN |

---

### **Gestion des Salles de Sport**

**Justification** : Les admins valident les salles avant intégration (approval workflow), définissent les caractéristiques (équipements, capacité), et les associent à des exercices/niveaux de difficulté.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/gym/all` | Lister les salles approuvées | ❌ PUBLIC |
| `GET` | `/gym/:id` | Détails d'une salle | ❌ PUBLIC |
| `GET` | `/gym/admin/all` | Voir TOUTES les salles (approuvées + en attente) | ✅ ADMIN |
| `PATCH` | `/gym/approve/:id` | Approuver une salle qui demande l'intégration | ✅ ADMIN |
| `DELETE` | `/gym/:id` | Supprimer une salle de la plateforme | ✅ ADMIN |

---

### **Gestion des Badges (Gamification Dynamique)**

**Justification** : Système fondamental pour l'engagement. L'admin crée des **règles dynamiques** (sans modifier le code) pour attribuer automatiquement des badges selon les accomplissements (défis complétés, points, streaks, etc.). Les badges peuvent être assignés manuellement aussi (bonus spéciaux).

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/badge` | Créer un badge avec règles dynamiques (ex: "5 défis = badge") | ✅ ADMIN |
| `GET` | `/badge/all` | Voir tous les badges actifs | ❌ PUBLIC |
| `GET` | `/badge/:id` | Détails d'un badge | ❌ PUBLIC |
| `PUT` | `/badge/:id` | Modifier les règles d'un badge | ✅ ADMIN |
| `PATCH` | `/badge/:id/toggle` | Activer/Désactiver un badge | ✅ ADMIN |
| `DELETE` | `/badge/:id` | Archiver un badge | ✅ ADMIN |
| `POST` | `/badge/:badgeId/assign/:userId` | Attribuer manuellement un badge (bonus, correction) | ✅ ADMIN |
| `POST` | `/badge/:badgeId/remove/:userId` | Retirer un badge | ✅ ADMIN |

**Types de Règles Disponibles** :
- `challenges_completed` : N défis terminés
- `total_points` : Accumulation de points
- `streak_days` : Jours consécutifs d'entraînement
- `difficulty_master` : Maîtriser une difficulté (facile, moyen, difficile)
- `specific_challenge` : Défi spécifique complété
- `weight_milestone` : Perte/gain de poids
- `gym_attendance` : N sessions au gymnase
- `custom` : Règles personnalisées

**Opérateurs** : `égal`, `supérieur`, `supérieur_ou_égal`, `inférieur`, `inférieur_ou_égal`

---

### **Gestion des Récompenses (Incitations)**

**Justification** : Système de récompenses points-based pour convertir les accomplissements en avantages concrets (réductions, sessions gratuites, plans nutritionnels, coaching). Les utilisateurs dépensent les points gagnés dans les défis pour réclamer des récompenses.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/reward` | Créer une récompense (type, coût en points, détails) | ✅ ADMIN |
| `GET` | `/reward/all` | Voir toutes les récompenses | ❌ PUBLIC |
| `GET` | `/reward/available` | Voir récompenses non expirées | ❌ PUBLIC |
| `GET` | `/reward/:id` | Détails récompense | ❌ PUBLIC |
| `GET` | `/reward/type/:type` | Filtrer par type (discount, coaching, etc.) | ❌ PUBLIC |
| `PUT` | `/reward/:id` | Modifier une récompense | ✅ ADMIN |
| `DELETE` | `/reward/:id` | Supprimer une récompense | ✅ ADMIN |

**Types de Récompenses** : `discount`, `free_session`, `equipment`, `nutritional_plan`, `coaching_session`, `gym_membership`, `custom`

---

### **Gestion des Utilisateurs**

**Justification** : Contrôle des comptes utilisateurs - désactivation de users toxiques, suppression de propriétaires de salle, gestion des permissions.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/user/all` | Lister tous les utilisateurs | ✅ ADMIN |
| `DELETE` | `/user/:id` | Supprimer un utilisateur (user ou owner) | ✅ ADMIN |

---

## 🏢 **OWNER - Gestion Salle de Sport**

### **Informations sur la Salle**

**Justification** : Le propriétaire de salle doit pouvoir configurer sa fiche (nom, adresse, équipements, description des installations) pour que les clients trouvent sa salle et sachent ce qu'elle propose.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/gym` | Créer une salle (demande d'intégration) | ✅ AUTHENTIFIÉ |
| `PUT` | `/gym/:id` | Modifier infos basiques de la salle | ✅ OWNER |
| `POST` | `/gym/changeInfo/:id` | Mettre à jour descriptions, équipements | ✅ OWNER |

---

### **Création et Partage de Défis**

**Justification** : Les utilisateurs créent des défis d'entraînement structurés (avec objectifs, exercices, durée), les partagent avec la communauté ou des amis, augmentent leur visibilité et engagement.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/challenge` | Créer un défi (name, description, difficulty, exercices) | ✅ AUTHENTIFIÉ |
| `PUT` | `/challenge/:id` | Modifier son défi (OWNER uniquement) | ✅ OWNER |
| `DELETE` | `/challenge/:id` | Supprimer son défi | ✅ AUTHENTIFIÉ |
| `POST` | `/challenge/:id/share` | Partager défi avec amis | ✅ AUTHENTIFIÉ |

---

### **Exploration & Filtrage des Défis**

**Justification** : Les clients découvrent une variété de défis filtrables (difficulté, type, salle), encourageant l'entraînement structuré et social.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/challenge/approved` | Lister tous les défis approuvés | ✅ AUTHENTIFIÉ |
| `GET` | `/challenge/gym/:gymId` | Défis d'une salle spécifique | ✅ AUTHENTIFIÉ |
| `GET` | `/challenge/:id` | Détails d'un défi | ✅ AUTHENTIFIÉ |
| `GET` | `/challenge/shared/with-me` | Défis partagés avec moi | ✅ AUTHENTIFIÉ |

---

### **Suivi de la Progression & Statistiques**

**Justification** : Les users tracent leur avancée (défis en cours, complétés, points accumulés, streaks) pour mesurer les progrès et rester motivés.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/challenge/me/participating` | Mes défis en cours | ✅ AUTHENTIFIÉ |
| `GET` | `/challenge/me/completed` | Mes défis complétés | ✅ AUTHENTIFIÉ |
| `GET` | `/challenge/me/points` | Mes points accumulés | ✅ AUTHENTIFIÉ |
| `POST` | `/challenge/:id/join` | Rejoindre un défi | ✅ AUTHENTIFIÉ |
| `POST` | `/challenge/:id/complete` | Marquer défi comme complété → gain points + éval badges | ✅ AUTHENTIFIÉ |
| `DELETE` | `/challenge/:id/leave` | Quitter un défi | ✅ AUTHENTIFIÉ |

---

### **Gestion Admin des Défis**

**Justification** : Les admins valident/approuvent les défis avant publication, gèrent les versions, assurent la qualité du contenu.

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `PATCH` | `/challenge/approve/:id` | Approuver/Valider un défi | ✅ ADMIN/OWNER |
| `GET` | `/challenge/challenge/:id` | Voir détails (OWNER) | ✅ OWNER |

---

---

## 👤 **CUSTOMER - Utilisateur Client**

### **Authentification & Profil**

**Justification** : Base de la plateforme - les utilisateurs se créent un compte, se connectent, et gèrent leur profil (poids, données d'entraînement).

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/register` | Créer un compte (email, password, nom) | ❌ PUBLIC |
| `POST` | `/login` | Se connecter (obtient JWT token) | ❌ PUBLIC |
| `GET` | `/user/:id` | Voir son profil | ✅ AUTHENTIFIÉ |
| `PUT` | `/user/:id` | Mettre à jour profil (poids, infos) | ✅ AUTHENTIFIÉ |

---

### **Récompenses & Badges (Gamification)**

**Justification** : Concrétisation de l'engagement - les utilisateurs gagnent des points en complétant des défis, les convertissent en récompenses, reçoivent des badges d'accomplissement. Système gamifié complet qui crée une boucle de motivation.

#### **Badges**

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/badge/all` | Voir tous les badges actifs | ❌ PUBLIC |
| `GET` | `/badge/:id` | Détails d'un badge et ses règles | ❌ PUBLIC |
| `GET` | `/badge/user/:userId` | Ses badges gagnés | ❌ PUBLIC |

#### **Récompenses**

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/reward/all` | Voir toutes les récompenses | ❌ PUBLIC |
| `GET` | `/reward/available` | Voir récompenses non expirées | ❌ PUBLIC |
| `GET` | `/reward/:id` | Détails récompense | ❌ PUBLIC |
| `GET` | `/reward/type/:type` | Filtrer par type (discount, coaching, etc.) | ❌ PUBLIC |
| `POST` | `/reward/claim/:rewardId` | Réclamer une récompense (dépenser points) | ✅ AUTHENTIFIÉ |
| `GET` | `/reward/user/:userId` | Ses récompenses réclamées | ✅ AUTHENTIFIÉ |
| `GET` | `/reward/user/:userId/unclaimed` | Récompenses non utilisées | ✅ AUTHENTIFIÉ |
| `PATCH` | `/reward/use/:userRewardId` | Utiliser/activer une récompense | ✅ AUTHENTIFIÉ |

---

### **Classements & Leaderboards**

**Justification** : Système de compétition sain - afficher les meilleurs utilisateurs par points, défis complétés ou activité globale crée une dynamique communautaire motivante. Les users voient leur position et sont poussés à progresser.

#### **Leaderboards Publics** (Classements Globaux)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/leaderboard/top-points?` | Top utilisateurs par points accumulés | ❌ PUBLIC |
| `GET` | `/leaderboard/top-challenges?` | Top utilisateurs par défis complétés | ❌ PUBLIC |
| `GET` | `/leaderboard/most-active?` | Top utilisateurs les plus actifs (participation + completion rate + badges) | ❌ PUBLIC |



**Réponse Leaderboard (Exemple)** :
```json
{
  "rank": 2,
  "userId": "507f1f77bcf86cd799439011",
  "firstname": "Jean",
  "lastname": "Dupont",
  "login": "jean.dupont@email.com",
  "totalPoints": 450,
  "completedChallenges": 8,
  "completionRate": 0.80,
  "badgesEarned": 3
}
```

---

---

## 🔄 **Flux Gamification Complet**

```
1. CUSTOMER crée/rejoint un CHALLENGE
        ↓
2. CUSTOMER complète le CHALLENGE → gagne des POINTS
        ↓
3. SYSTÈME évalue règles de BADGES automatiquement
        ↓
4. BADGES assignés si conditions remplies (points, défis, streaks, etc.)
        ↓
5. CUSTOMER utilise ses POINTS pour réclamer des RÉCOMPENSES
        ↓
6. CUSTOMER active ses RÉCOMPENSES (codes, sessions, etc.)
```

**Exemple Concret (End-to-End)** :

| Étape | Action | Résultat |
|-------|--------|---------|
| 1 | CUSTOMER rejoint un défi "5km Run" | Défi en cours |
| 2 | CUSTOMER complète le défi | +50 points gagnés |
| 3 | Système évalue badges : "Total Points >= 500" ✓ | Badge "500 Points Master" assigné automatiquement |
| 4 | CUSTOMER dépense 75 points | Récompense "1 session coaching" réclamée |
| 5 | CUSTOMER utilise code promotion | PATCH `/reward/use/:userRewardId` → statut = utilisée |

**Types de Badges Possibles** :
- `challenges_completed` : "10-Challenge Expert" (10+ défis complétés)
- `total_points` : "500 Points Master" (500+ points)
- `streak_days` : "7-Day Warrior" (7 jours d'entraînement consécutifs)
- `difficulty_master` : "Master Difficile" (10+ défis difficiles)
- `specific_challenge` : "Cardio Champion" (défi spécifique complété)
- `weight_milestone` : "5kg Down!" (perte de 5kg)
- `gym_attendance` : "20-Session Club" (20 sessions en salle)
- `custom` : Règles personnalisées (ex: après Noël, gift badge)

**Types de Récompenses** :
- `discount` : Code réduction (ex: -20% abonnement)
- `free_session` : Séance gratuite (coaching, massage)
- `equipment` : Équipement fitness (protéines, tapis, etc.)
- `nutritional_plan` : Plan alimentaire personnalisé
- `coaching_session` : Session de coaching (1h, 5h, etc.)
- `gym_membership` : Extension abonnement gym
- `custom` : Récompenses personnalisées

---

---

## 🏗️ Architecture Technique

### **Stack Technologique**
```
Backend:        Node.js + Express.js (TypeScript)
Base de données: MongoDB (Mongoose ORM)
Authentification: JWT (JSON Web Tokens)
Hachage:        bcrypt
```

### **Choix Technologiques**

| Composant | Choix | Justification |
|-----------|-------|--------------|
| **Framework** | Express.js | Léger, flexible, parfait pour APIs REST |
| **BDD** | MongoDB | Document-based = structure flexible pour badges/récompenses avec règles dynamiques |
| **ORM** | Mongoose | Schémas TypeScript, validation native, relations faciles |
| **Auth** | JWT | Stateless, scalable, idéal pour API REST |
| **Hachage** | bcrypt | Standard industrie, salt automatique, résistant |
| **Langage** | TypeScript | Type-safety, meilleure DX, moins de bugs |

### **Raison du Choix MongoDB pour Badges :**
- **Schémas flexibles** : Les règles de badges sont stockées comme objets imbriqués (single/multiple/evaluator)
- **Scalabilité** : Ajout facile de nouveaux types de règles sans migration
- **Queryage facile** : Recherche par type de règle, statut actif, etc.
- **Imbrication naturelle** : Details, rules, earnedFrom sont des sous-documents

### **Raison du Choix TypeScript :**
- Détection d'erreurs au compile-time
- Interfaces strictes pour Badge, Reward, UserRole
- Meilleure maintenabilité du code
- Autocomplétion IDE

---

## 🚀 Démarrage du Projet

### **Prérequis**
- Node.js >= 16
- MongoDB running (local ou Docker)
- npm ou yarn

### **Option 1 : Installation locale**

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials MongoDB

# 3. Démarrer MongoDB (si local)
mongod

# 4. Lancer le serveur en développement
npm run dev

# OU en production
npm run build
npm start
```

### **Option 2 : Avec Docker (Recommandé)**

```bash
# Lancer la base MongoDB + serveur
docker-compose up -d

# Vérifier le statut
docker ps

# Logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### **Variables d'Environnement (.env)**
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_USER=root
MONGODB_PASSWORD=dfbhjn1l4567
MONGODB_DATABASE=fitness_db
ROOT_USER_PASSWORD=admin_password123
JWT_SECRET=B33pBO0pb66P_S3cr3tKey
JWT_EXPIRES_IN=24h
PORT=3000
```

### **Scripts npm**
```bash
npm run dev        # Développement (ts-node-dev avec reload)
npm run build      # Compiler TypeScript
npm start          # Production (node dist/index.js)
npm run data       # Peupler la base avec données de test
```

### **Peupler la Base de Données**

Pour faciliter les tests, exécutez le script de population qui crée des données pré-configurées:

```bash
# Option 1 : Exécution directe
npm run data

# Option 2 : Après compilation
npm run build && npm run data:build
```

**Données créées** :
- ✅ 5 utilisateurs (ADMIN, OWNER, 3 CUSTOMER)
- ✅ 8 exercices (cardio, musculation, etc.)
- ✅ 3 salles de sport
- ✅ 5 badges avec règles dynamiques
- ✅ 6 récompenses (coaching, réductions, etc.)
- ✅ 6 défis approuvés + 1 en attente

**Comptes de Test** :
```
ADMIN:    admin@fitness.com / admin123
OWNER:    owner@fitnessgym.com / owner123
CUSTOMER: jean.dupont@email.com / customer123
CUSTOMER: marie.martin@email.com / customer123
CUSTOMER: pierre.bernard@email.com / customer123
```

---

## 📡 API Endpoints Résumé

### **Base URL**
```
http://localhost:3000
```

### **Exemple de Requête**

**Créer un Badge :**
```bash
POST /badge
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN
  user-id: ADMIN_ID

Body:
{
  "name": "Master Challenge",
  "description": "Complétez 5 défis",
  "rules": {
    "single": {
      "type": "challenges_completed",
      "operator": "supérieur_ou_égal",
      "value": 5
    }
  }
}
```

**Réclamer une Récompense :**
```bash
POST /reward/claim/REWARD_ID
Headers:
  Authorization: Bearer USER_JWT_TOKEN
  user-id: USER_ID

Body:
{
  "challengeId": null
}
```

---

## 📨 Collections Postman

Les collections Postman sont disponibles **en ligne** sur le workspace Postman partagé.

### **Accès à la Collection en Ligne**

#### **Option 1 : Via Lien Partagé (Recommandé)**
```
1. Cliquer sur le lien partagé de la collection Postman
2. Cliquer sur "Use this template" ou "Fork"
3. Postman ouvre automatiquement la collection
4. Configurer l'environnement (voir ci-dessous)
5. Tester les requêtes directement
```

#### **Option 2 : Via le Workspace Postman**
```
1. Aller sur https://www.postman.com
2. Se connecter à votre compte
3. Accéder au workspace partagé
4. Importer/accéder à la collection "Fitness API"
5. Configurer l'environnement
```

### **Configuration de l'Environnement**

#### **Étape 1 : Définir les Variables**

En haut à droite dans Postman, sélectionner ou créer un environnement avec :

```json
{
  "base_url": "http://localhost:3000",
  "token": "",
  "user-id": ""
}
```

#### **Étape 2 : Se Connecter (IMPORTANT)**

Avant de tester, il FAUT obtenir un token JWT :

```bash
Requête POST /login
Body:
{
  "login": "admin@fitness.com",
  "password": "admin123"
}

Réponse:
{
  "token": "eyJhbGc...",
  "userId": "507f1f77bcf86cd799439011",
  ...
}
```

**Copier le token et le user-id dans les variables d'environnement** :
- `token` → le JWT reçu
- `user-id` → l'userId reçu

### **Workflow Typique**

```
1. npm run data              → Peupler la BDD
2. npm run dev              → Lancer le serveur (http://localhost:3000)
3. Ouvrir Postman en ligne
4. Accéder à la collection partagée
5. Configurer base_url = http://localhost:3000
6. Faire POST /login → copier token et user-id
7. Tester les routes disponibles
```

### **Structure des Collections**

Chaque dossier regroupe les endpoints par fonctionnalité :

```
📁 Auth
   ├── Register
   └── Login

📁 Exercises
   ├── GET all
   ├── POST create (ADMIN)
   ├── PUT update (ADMIN)
   └── DELETE (ADMIN)

📁 Gyms
   ├── GET all (PUBLIC)
   ├── POST create
   ├── PATCH approve (ADMIN)
   └── DELETE (ADMIN)

📁 Badges
   ├── GET all (PUBLIC)
   ├── POST create (ADMIN)
   ├── PUT update (ADMIN)
   ├── POST assign/:userId (ADMIN)
   └── GET user/:userId

📁 Rewards
   ├── GET all (PUBLIC)
   ├── POST create (ADMIN)
   ├── POST claim/:rewardId (CUSTOMER)
   ├── PATCH use/:userRewardId (CUSTOMER)
   └── GET user/:userId

📁 Challenges
   ├── GET approved
   ├── POST create
   ├── POST :id/join
   ├── POST :id/complete
   ├── PATCH approve/:id (ADMIN)
   └── DELETE :id

📁 Users
   ├── GET all (ADMIN)
   ├── GET :id
   └── PUT :id
```

### **Comptes de Test Disponibles**

```
ADMIN:    admin@fitness.com / admin123
OWNER:    owner@fitnessgym.com / owner123
CUSTOMER: jean.dupont@email.com / customer123
          marie.martin@email.com / customer123
          pierre.bernard@email.com / customer123
```

---

## 🏗️ Structure du Projet

```
fitness/
├── controllers/                          # HTTP handlers
│   ├── auth.controller.ts               # Login, Register
│   ├── badge.controller.ts              # CRUD badges + assign/remove
│   ├── challenge.controller.ts          # CRUD challenges + join/complete
│   ├── exercise.controller.ts           # CRUD exercises
│   ├── gym.controller.ts                # CRUD gyms + approve
│   ├── health-check.controller.ts       # Health endpoint
│   ├── reward.controller.ts             # CRUD rewards + claim/use
│   ├── user.controller.ts               # CRUD users + profile
│   └── index.ts                         # Export all controllers
│
├── models/                              # TypeScript Interfaces
│   ├── badge/
│   │   ├── badge.interface.ts
│   │   └── rule-type.enum.ts
│   ├── challenge/
│   │   └── challenge.interface.ts
│   ├── reward/
│   │   ├── reward.interface.ts
│   │   └── reward-type.enum.ts
│   ├── exercise.interface.ts
│   ├── gym.interface.ts
│   ├── user.interface.ts
│   └── index.ts
│
├── services/                            # Business logic layer
│   ├── index.ts
│   └── mongoose/
│       ├── services/
│       │   ├── Auth/
│       │   │   ├── auth.service.ts     # Login, Register, JWT
│       │   │   ├── token.service.ts    # Token generation/validation
│       │   │   └── index.ts
│       │   ├── Challenge/
│       │   │   ├── challenge.service.ts
│       │   │   ├── user-challenge.service.ts
│       │   │   ├── shared-challenge.service.ts
│       │   │   └── index.ts
│       │   ├── badge.service.ts        # Badge CRUD + rules evaluation
│       │   ├── exercise.service.ts
│       │   ├── gym.service.ts
│       │   ├── reward.service.ts       # Reward CRUD + claiming/usage
│       │   ├── user.service.ts
│       │   └── index.ts
│       │
│       ├── schema/                     # MongoDB Mongoose schemas
│       │   ├── ChallengeSchema/
│       │   │   ├── challenge.schema.ts
│       │   │   ├── user-challenge.schema.ts
│       │   │   └── index.ts
│       │   ├── badge.schema.ts         # Badge model with rules
│       │   ├── exercise.schema.ts
│       │   ├── gym.schema.ts
│       │   ├── reward.schema.ts        # Reward model with details
│       │   ├── user.schema.ts
│       │   └── index.ts
│       │
│       ├── utils/
│       │   ├── mongoose-connect.utils.ts  # MongoDB connection
│       │   └── index.ts
│       └── index.ts
│
├── utils/                               # Middlewares & utilities
│   ├── middlewares/
│   │   ├── auth.middleware.ts          # JWT verification
│   │   ├── role.middleware.ts          # Role-based access control
│   │   └── index.ts
│   ├── security.utils.ts               # Password hashing, encryption
│   └── index.ts
│
├── postman/                             # Postman collections
│   ├── collections/
│   ├── environments/
│   └── globals/
│       └── workspace.postman_globals.json
│
├── dist/                                # Compiled JavaScript (build output)
├── node_modules/                        # Dependencies
│
├── .env                                 # Environment variables
├── .env.example                         # Example env template
├── .gitignore                           # Git ignore rules
├── docker-compose.yml                   # MongoDB + Docker setup
├── package.json                         # NPM dependencies & scripts
├── package-lock.json                    # Dependency lock file
├── tsconfig.json                        # TypeScript config
├── README.md                            # This file
└── index.ts                             # Server entry point
```

---

## 🔐 Sécurité & Authentification

### **Middlewares Appliqués**

| Route | Middleware | Rôle |
|-------|-----------|------|
| Admin actions | `authMiddleware` + `requireRole(ADMIN)` | Super admin uniquement |
| User actions | `authMiddleware` | Utilisateur authentifié |
| Public routes | Aucun | Accès libre |

### **Exemple : Créer un Badge**
```typescript
router.post("/", authMiddleware, requireRole(UserRole.ADMIN), this.create.bind(this));
```

---

## 📦 Dépendances

### **Dependencies (Production)**
```json
{
  "bcrypt": "^6.0.0",              // Hachage sécurisé mots de passe
  "dotenv": "^17.2.3",             // Gestion variables d'environnement
  "express": "^5.2.1",             // Framework HTTP/REST
  "jsonwebtoken": "^9.0.3",        // JWT tokens pour authentification
  "mongoose": "^8.20.4"            // ORM MongoDB - schémas, validation
}
```

### **Dev Dependencies**
```json
{
  "@types/bcrypt": "^6.0.0",       // Types TypeScript pour bcrypt
  "@types/express": "^5.0.6",      // Types TypeScript pour Express
  "@types/jsonwebtoken": "^9.0.10",// Types TypeScript pour JWT
  "@types/node": "^24.10.4",       // Types TypeScript pour Node.js
  "nodemon": "^3.1.11",            // Auto-restart serveur (watch)
  "ts-node": "^10.9.2",            // Exécute TypeScript directement
  "ts-node-dev": "^2.0.0",         // Dev server avec reload auto
  "typescript": "^5.9.3"           // Compilateur TypeScript
}
```

---

## 🎯 Cas d'Usage

### **Cas 1 : Admin crée un Badge avec Règle Dynamique**

**Contexte** : L'admin veut récompenser les utilisateurs très actifs.

```bash
# 1. Admin crée badge "500 Points Master"
POST /badge
Headers: Authorization: Bearer ADMIN_TOKEN
Body:
{
  "name": "500 Points Master",
  "description": "Accumulez 500 points",
  "rules": {
    "single": {
      "type": "total_points",
      "operator": "supérieur_ou_égal",
      "value": 500
    }
  },
  "maxEarnings": 1
}

# 2. User1 complète 10 défis → accumule 500 points
POST /challenge/:challengeId/complete
Résultat: +50 points par défi

# 3. Système détecte: total_points >= 500 ✓
Badge assigné automatiquement à User1
```

---

### **Cas 2 : Customer gagne et utilise une Récompense**

**Contexte** : User a 200 points, veut 1h de coaching.

```bash
# 1. Admin crée récompense
POST /reward
Body:
{
  "name": "1h Coaching Session",
  "pointsCost": 150,
  "type": "coaching_session",
  "details": {
    "duration": { "value": 1, "unit": "hours" },
    "code": "COACH-2026-001"
  }
}

# 2. User réclame (dépense 150 points)
POST /reward/claim/rewardId
Résultat: -150 points, UserReward créée

# 3. User utilise sa récompense
PATCH /reward/use/userRewardId
Résultat: status = "used"
```

---

### **Cas 3 : Workflow Complet (Challenge → Badge → Récompense)**

```
User complète Challenge "5km Run"
    ↓
+50 points gagnés
    ↓
Système évalue: total_points >= 500 ?
    ↓
✓ Oui → Badge "500 Points Master" assigné automatiquement
    ↓
User a maintenant 350 points accumulés
    ↓
User réclame récompense "Free Month Gym" (200 points)
    ↓
User utilise code promo → récompense activée
    ↓
Statut final: Badge ✓ + Récompense utilisée ✓
```

---

## 🐛 Troubleshooting

### **Port 3000 déjà utilisé**
```bash
lsof -i :3000
kill -9 <PID>
```

### **MongoDB connexion échouée**
```bash
# Vérifier que MongoDB tourne
docker ps  # Si Docker
# Vérifier .env MONGODB_URI
```

### **Token JWT invalide**
```bash
# Refaire un login
POST /auth/login
# Copier le token dans Authorization header
```

---

## 📄 Licence & Contact

Projet ESGI - Plateforme Fitness  
Année : 2026
