# 💰 Budget Manager

Application web **100% locale** de gestion de budget personnel. Aucune connexion internet, aucun serveur, aucune dépendance externe. Toutes les données sont stockées dans le `localStorage` de votre navigateur.

## 🚀 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble du solde, progression par catégorie, dernières dépenses
- **Dépenses** : Saisie, modification et suppression des dépenses mensuelles avec filtrage
- **Budget idéal** : Configuration des plafonds par catégorie avec jauges de progression
- **Paramètres** : Gestion des revenus et charges fixes récurrents
- **Archives** : Clôture mensuelle, historique et export JSON des mois passés

## 📁 Structure du projet

```
budget-manager/
│
├── index.html              ← Application complète (HTML + CSS + JS)
├── budget-app-core.js      ← Module utilitaire (initialisation, localStorage, calculs)
├── README.md               ← Ce fichier
│
└── exports/                ← (Optionnel) Archives JSON exportées manuellement
    └── archive_YYYY-MM.json
```

## 🔧 Installation & Utilisation

### Option 1 : Fichier unique (Recommandé)
Copiez simplement le fichier `index.html` sur votre ordinateur et ouvrez-le avec n'importe quel navigateur moderne (Chrome, Firefox, Edge, Safari).

```bash
# Ouvrir directement
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### Option 2 : Avec serveur local (Optionnel)
Pour un développement plus confortable (rechargement automatique, débogage) :

```bash
# Avec Python
python3 -m http.server 8000

# Avec Node.js (npx)
npx serve .

# Puis ouvrir http://localhost:8000
```

## 💾 Structure des données (localStorage)

L'application utilise 3 clés principales dans le `localStorage` :

### `bm_settings`
Configuration globale (revenus, charges, budget idéal).
```json
{
  "revenus": [
    { "id": "1718200000000abc", "label": "Salaire net", "amount": 2500, "recurrent": true }
  ],
  "charges_fixes": [
    { "id": "1718200000001def", "label": "Loyer", "amount": 850, "category": "Logement" }
  ],
  "budget_ideal": [
    { "name": "Alimentation", "limit": 400 },
    { "name": "Transport", "limit": 150 }
  ]
}
```

### `bm_mois_YYYY-MM`
Données d'un mois spécifique (ex: `bm_mois_2025-06`).
```json
{
  "periode": "2025-06",
  "status": "actif",
  "expenses": [
    {
      "id": "1718200000002ghi",
      "date": "2025-06-12",
      "label": "Courses Leclerc",
      "amount": 87.50,
      "category": "Alimentation",
      "note": ""
    }
  ]
}
```

### `bm_archives`
Liste des périodes archivées.
```json
["2025-04", "2025-05"]
```

## 🛠️ Architecture technique

- **Stack** : HTML5 / CSS3 / JavaScript Vanilla (ES6+)
- **Stockage** : `localStorage` (persistance locale uniquement)
- **Architecture** : SPA (Single Page Application) sans rechargement
- **Design** : Responsive (Desktop + Mobile), tons neutres modernes
- **Dépendances** : Aucune (0 librairie externe)

## 📱 Navigation

| Vue | Description |
|-----|-------------|
| 📊 Tableau de bord | Solde du mois, jauges, alertes, dernières dépenses |
| 💸 Dépenses | Formulaire d'ajout, liste filtrable, totaux |
| 🎯 Budget idéal | Configuration des catégories et plafonds |
| ⚙️ Paramètres | Revenus et charges fixes |
| 🗄️ Archives | Clôture mensuelle, historique, export JSON |

## 🔐 Confidentialité & Sécurité

- ✅ **Aucune donnée ne quitte votre appareil**
- ✅ **Aucun cookie ni tracker**
- ✅ **Aucun compte requis**
- ✅ **Fonctionne hors ligne** après premier chargement
- ⚠️ **Attention** : Si vous videz le cache de votre navigateur, les données seront perdues. Pensez à exporter vos archives régulièrement !

## 📤 Exporter ses données

Depuis la vue **Archives** :
1. Cliquez sur "Exporter en JSON" pour le mois souhaité
2. Le fichier `archive_YYYY-MM.json` est téléchargé
3. Conservez-le précieusement pour sauvegarde ou import futur

## 🐛 Dépannage

### Les données ont disparu ?
- Vérifiez que vous utilisez le même navigateur
- Assurez-vous de ne pas avoir activé la navigation privée
- Essayez de recharger la page (F5)

### L'application ne se lance pas ?
- Ouvrez la console développeur (F12) et vérifiez les erreurs JavaScript
- Assurez-vous d'utiliser un navigateur récent (Chrome 90+, Firefox 88+, Safari 14+)
- Désactivez les extensions bloquant le JavaScript

### Réinitialiser l'application
```javascript
// Dans la console du navigateur (F12)
localStorage.clear();
location.reload();
```
⚠️ Cette action efface **toutes** vos données définitivement.

## 📝 Licence

Ce projet est fourni "tel quel" à des fins éducatives et personnelles. Vous êtes libre de le modifier et de l'adapter selon vos besoins.

---

**Développé avec ❤️ en JavaScript Vanilla** 
