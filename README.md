# FSWD AI Suite V2

Site statique + Netlify Function sécurisée. Déployer le contenu de ce dossier à la racine du dépôt GitHub, puis connecter à Netlify. Le mode démonstration fonctionne sans clé.

## Activer une vraie IA
Dans Netlify > Project configuration > Environment variables, ajouter :
- `AI_API_KEY` : clé privée du fournisseur, jamais dans index.html ni GitHub
- `AI_MODEL` : identifiant du modèle du fournisseur
- `AI_BASE_URL` : URL HTTPS de base d’une API compatible OpenAI Chat Completions, **sans** `/chat/completions` final (ex. `https://api.openai.com/v1`)

Redéployer après configuration. Les requêtes peuvent être facturées par le fournisseur. Ne pas saisir de données confidentielles dans cette démo publique. Ne pas activer une clé payante sur un site public sans authentification, quotas, contrôle d’accès et limitation de débit : sinon n’importe quel visiteur peut consommer tes crédits. Pour un portfolio public, garder le mode démo ou protéger l’accès.

## État réel
Chat, rédaction et résumé .txt utilisent l’IA uniquement si les variables sont configurées. Tableau de bord et historique restent locaux au navigateur. Automatisations simulées. Pas d’authentification, base de données, PDF ni facturation.
