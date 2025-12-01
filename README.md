# Coloc Bali App - MVP

Application pour trouver ta coloc idéale à Bali. Version MVP complète avec 5 écrans.

## Technologies

- React 18
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure de l'application

### Pages disponibles

1. **`/`** - Page d'accueil (redirige vers `/onboarding`)
2. **`/onboarding`** - Collecte des préférences utilisateur (date, budget, zones, durée)
3. **`/villas`** - Liste des villas avec filtres (zone, vibe, budget)
4. **`/villa/[id]`** - Détails d'une villa spécifique
5. **`/booking/[id]`** - Page de réservation avec frais de booking
6. **`/group/[id]`** - Groupe de coloc avec chat (protégé par paiement)

### Données

- **`data/villas.json`** - 5 villas mockées avec toutes les informations nécessaires
- **`lib/store.ts`** - Store Zustand global pour la gestion d'état

### Fonctionnalités

- ✅ Onboarding avec sauvegarde dans Zustand + localStorage
- ✅ Filtrage des villas par zone, vibe et budget
- ✅ Affichage du score de compatibilité (80-98%)
- ✅ Système de réservation avec frais de booking (25€)
- ✅ Protection de la page groupe (redirection si non payé)
- ✅ Chat entre colocs (placeholder local)
- ✅ Interface entièrement en français

## Notes

- Les données sont stockées localement (localStorage + Zustand persist)
- Aucune base de données réelle pour le MVP
- Les images utilisent Unsplash (placeholder)
- Le chat est un placeholder local sans backend

