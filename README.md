# FSWD AI Suite — Projet concept

Prototype SaaS statique de portfolio avec six modules : tableau de bord, chat simulé, génération de modèles de contenu, analyse locale de texte .txt, workflows simulés et historique local.

## Publication

Envoyer `index.html` à la racine d'un dépôt GitHub, puis importer le dépôt dans Netlify. Build command : vide. Publish directory : `.`.

## Important

- **Pas de véritable IA** : le chat répond par scénarios prédéfinis et le générateur produit des modèles de texte.
- **Pas de backend, comptes utilisateurs, abonnements, exécution d'automatisations ou traitement PDF**.
- Données enregistrées dans `localStorage` sur le navigateur de l'utilisateur ; ne pas y entrer de données sensibles.
- Aucun secret/API key ne doit être placé dans le code frontend.
- Pour une version IA réelle : fonctions serveur Netlify ou backend sécurisé, fournisseur de modèle, authentification, base de données et garde-fous de coût.
