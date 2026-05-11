# DevRequests Dashboard

Dashboard pour organiser tes demandes de création de sites web et d'applications.

**Stack :** React 18 · Vite · Supabase · GitHub Pages

---

## Fonctionnalités

- **Dashboard** — statistiques globales, répartition par statut/type, budget total
- **Kanban** — vue drag & drop avec 5 colonnes (Nouveau → Terminé)
- **Liste** — tableau avec filtres (statut, priorité, type, recherche)
- **Modal détail** — formulaire complet : titre, description, client, budget, deadline, technologies, notes
- **Commentaires** — notes internes par demande
- **Auth** — connexion, inscription, mot de passe oublié via Supabase
- **Deploy automatique** via GitHub Actions → GitHub Pages
- **Keep-alive** — workflow qui ping Supabase toutes les 72h (évite la mise en pause)

---

## Configuration (étape par étape)

### 1. Supabase

1. Va sur [supabase.com](https://supabase.com) → **New Project**
2. Note ton **Project URL** et ta **anon public key** (Settings → API)
3. Va dans **SQL Editor** → **New Query**, colle tout le contenu de `supabase_schema.sql` → **Run**
4. Active l'authentification : Authentication → Providers → Email → Active

### 2. Variables d'environnement locales

Copie `.env.example` en `.env` et remplis :

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. GitHub — créer le dépôt

```bash
git init
git add .
git commit -m "init: DevRequests dashboard"
gh repo create dev-requests-dashboard --public --push --source=.
```

Ou via [github.com/new](https://github.com/new), puis :
```bash
git remote add origin https://github.com/TON_USER/dev-requests-dashboard.git
git push -u origin main
```

### 4. GitHub Secrets (pour le déploiement)

Settings → Secrets and variables → Actions → New repository secret :

| Nom | Valeur |
|-----|--------|
| `VITE_SUPABASE_URL` | URL de ton projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anon Supabase |

### 5. Activer GitHub Pages

Settings → Pages → Source : **GitHub Actions** → Save

Le workflow `deploy.yml` se déclenche automatiquement à chaque push sur `main`.

---

## Développement local

```bash
npm install
cp .env.example .env   # puis remplis les valeurs
npm run dev
```

---

## Structure du projet

```
src/
├── components/      # RequestCard, RequestModal, StatusBadge, PriorityBadge, Navbar
├── context/         # AuthContext, ToastContext
├── pages/           # Dashboard, Kanban, Requests, Login
├── services/        # supabaseClient.js, requestService.js
├── styles/          # main.css
└── utils/           # constants.js (statuts, priorités, types)
.github/workflows/
├── deploy.yml       # Build + deploy sur GitHub Pages
└── keep-alive.yml   # Ping Supabase toutes les 72h
supabase_schema.sql  # À exécuter dans Supabase SQL Editor
```
