# Album photo — Mélaine & Benjamin

Application mobile-first accessible via QR codes (un par table / lieu) permettant aux invités
d'ajouter et de consulter des photos sans compte ni login, plus un livre d'or.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage) pour les données et les photos
- Déploiement gratuit sur Vercel

## Développement local

1. Copier `.env.local.example` en `.env.local` et renseigner les clés Supabase (voir plus bas).
2. `npm install`
3. `npm run dev` puis ouvrir http://localhost:3000

## Base de données Supabase (à faire une seule fois)

1. Créer un projet gratuit sur https://supabase.com
2. Dans **SQL Editor**, coller et exécuter le contenu de `supabase/schema.sql`
   (crée les tables, les policies de sécurité, le bucket de stockage `photos`,
   active le temps réel, et ajoute les 10 tables + Bar/Piste de danse/Photobooth de départ)
3. Récupérer dans **Project Settings → API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (secrète) → `SUPABASE_SERVICE_ROLE_KEY`

## Variables d'environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (lecture/écriture invités) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète Supabase (admin uniquement, jamais exposée au client) |
| `ADMIN_PASSWORD` | Mot de passe de l'espace `/admin` |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (utilisée pour générer les QR codes) |

## Déploiement sur Vercel

1. Pousser ce repo sur GitHub (déjà fait : `ValentinScarnato/Mariage_WebApp`)
2. Sur https://vercel.com, **Add New → Project**, importer le repo GitHub
3. Dans **Environment Variables**, ajouter les 5 variables ci-dessus
   (pour `NEXT_PUBLIC_SITE_URL`, mettre l'URL Vercel finale, ex: `https://mariage-webapp.vercel.app`)
4. Déployer. Vercel redéploie automatiquement à chaque push sur `main`.

## Gestion du mariage (espace admin)

Aller sur `/admin` (mot de passe défini par `ADMIN_PASSWORD`) :

- **Photos** : voir toutes les photos, leurs commentaires, tout supprimer si besoin
- **Lieux** : ajouter / renommer / supprimer des tables et lieux (la liste de départ est
  volontairement provisoire — à ajuster une fois le plan de salle final connu)
- **Livre d'or** : modérer les messages
- **QR codes** (`/admin/qrcodes`) : génère et télécharge un QR code par table/lieu, à imprimer
  et poser sur place. Chaque QR pointe vers `/lieu/<slug-du-lieu>`.

## Pages principales

- `/` — accueil, accès à toutes les tables/lieux sans QR code
- `/lieu/[slug]` — galerie d'un lieu précis (page ciblée par les QR codes)
- `/galerie` — galerie complète avec filtres
- `/ajouter` — ajouter une photo
- `/livre-or` — livre d'or
- `/admin` — administration
