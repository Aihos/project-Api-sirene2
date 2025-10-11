src/
├── _component/
│   ├── types.ts                 # Types TypeScript et constantes
│   ├── useCompanySearch.ts      # Hook personnalisé (logique métier)
│   ├── DepartmentSelector.tsx   # Sélecteur de département
│   ├── SearchFilters.tsx        # Filtres de recherche (département + dates)
│   ├── SearchActions.tsx        # Boutons d'action (recherche, charger plus, export)
│   ├── CompanyCard.tsx          # Carte affichant une entreprise
│   ├── CompanyList.tsx          # Liste des entreprises avec tri
│   └── index.ts                 # Exports centralisés
├── App.tsx                      # Composant principal (orchestration)
└── main.tsx

## 🧩 Description des composants

### **types.ts**
- Définit l'interface `Company`
- Contient l'API_KEY et les codes NAF valides
- Centralise toutes les constantes de l'application

### **useCompanySearch.ts** (Hook personnalisé)
- Gère toute la logique métier de l'application
- États : entreprises, chargement, erreurs, filtres, tri
- Fonctions :
  - `fetchRecentCompanies()` : Recherche les entreprises via l'API INSEE
  - `exportToCSV()` : Export des données en CSV
  - `handleSort()` : Gestion du tri
- **Avantages** : Sépare la logique de l'UI, réutilisable, testable

### **DepartmentSelector.tsx**
- Sélecteur déroulant pour choisir le département (01-95)
- Composant réutilisable et indépendant

### **SearchFilters.tsx**
- Regroupe tous les filtres : département, date de début, date de fin
- Utilise `DepartmentSelector` en interne
- Interface simple avec props pour les valeurs et setters

### **SearchActions.tsx**
- Boutons d'action : "Nouvelle recherche", "Charger plus", "Exporter en CSV"
- Affiche le compteur d'entreprises chargées
- Gère les états de chargement et les messages

### **CompanyCard.tsx**
- Affiche les informations d'une entreprise
- Liens vers Pappers et Google Maps
- Design réutilisable et cohérent

### **CompanyList.tsx**
- Affiche la liste des entreprises
- Bouton de tri par date (ascendant/descendant)
- Utilise `CompanyCard` pour chaque entreprise
- Gère le tri en interne

### **App.tsx** (Composant principal)
- **Simplifié** : uniquement 40 lignes !
- Utilise le hook `useCompanySearch` pour la logique
- Orchestre les sous-composants
- Structure claire et lisible
