# Jeu TEBAA – *Maître d'œuvre*

Jeu web **HTML/CSS/JS** pour travailler **lecture de plan**, **phasage** et **métiers** (bac pro TEBAA).

## Démo locale
- Double-cliquez `index.html` **ou**, recommandé :
```bash
python -m http.server 8000
# puis http://localhost:8000
```
> Si `data.json` est bloqué en local, le jeu bascule automatiquement sur des **données intégrées** (fallback).

## Déploiement sur GitHub Pages
1. Créez un dépôt sur GitHub (public conseillé pour Pages).
2. Uploadez ces fichiers à la racine : `index.html`, `styles.css`, `game.js`, `data.json`, `LICENSE`, `.gitignore`.
3. Paramètres → **Pages** → *Build and deployment* :
   - **Source** = `Deploy from a branch`
   - **Branch** = `main` (ou `master`) ; **Folder** = `/root`
4. Enregistrez. L'URL sera du type : `https://<user>.github.io/<repo>/`

## Structure
```
.
├── index.html        # Point d'entrée
├── styles.css        # Styles UI
├── game.js           # Logique du jeu (drag & drop, scoring, CSV, leaderboard)
├── data.json         # Cartes (phasage, métiers, vocabulaire)
├── LICENSE           # MIT
├── .gitignore        # fichiers à ignorer
└── .github/workflows/json-lint.yml  # (optionnel) vérif JSON
```

## Schéma `data.json`
- Types : `phasage_mop`, `phasage_chantier`, `phasage_second_oeuvre`, `metiers`, `vocab`.

## Licence
MIT — voir `LICENSE`.
