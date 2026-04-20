# AgroSerre — Instructions

## Lancement local

```bash
npm install
npm run dev
```
Ouvre http://localhost:5173

## Build production

```bash
npm run build
npm run preview   # tester le build localement
```

## Déploiement Vercel

1. Pousser sur GitHub :
```bash
git init
git add .
git commit -m "init agroserre"
git remote add origin https://github.com/TON_USER/agroserre.git
git push -u origin main
```

2. Sur vercel.com → "New Project" → importer le repo GitHub
3. Framework : **Vite** (détecté automatiquement)
4. Build command : `npm run build`
5. Output dir : `dist`
6. Deploy → l'URL est prête en 30 secondes

## Installer comme app mobile (PWA)

- **Android** : ouvrir dans Chrome → menu ⋮ → "Ajouter à l'écran d'accueil"
- **iPhone** : ouvrir dans Safari → partager → "Sur l'écran d'accueil"
- **Desktop** : icône d'installation dans la barre d'adresse Chrome

## Données de démo

Au premier lancement, l'app crée automatiquement :
- 2 serres (Serre Principale + Serre Nord)
- 6 dépenses réparties
- 4 interventions
- 3 intrants
- 1 vente complète
- 3 prix marché

Pour repartir de zéro : F12 → Application → IndexedDB → supprimer AgroSerreDB
