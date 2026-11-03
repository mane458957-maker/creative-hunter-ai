# Sources de données et état des connexions

**Mise à jour : 3 novembre 2026.** Sept flux publics sont récupérés par GitHub Actions; les sources d’emploi sont rafraîchies quatre fois par jour et les projets Freelancer.com toutes les 15 minutes. Le profil candidat sert uniquement au filtrage dans le runner; il n’est pas copié dans le site publié.

## Moteur emploi

| Source | État | Couverture et règles |
| --- | --- | --- |
| Remotive | Connectée | Offres à distance; décalage de 24 h et maximum conseillé de quatre requêtes par jour. Attribution et lien d’origine conservés. |
| Arbeitnow Europe | Connectée | Offres centrées sur l’Europe; lien vers Arbeitnow conservé. |
| Jobicy | Connectée | Offres à distance récentes; aucun compte ni clé requis. Attribution et lien original Jobicy conservés. |
| Remote OK | Connectée | Flux public JSON sans identifiants; attribution et lien vers l’annonce originale conservés. |
| Himalayas | Connectée | API publique d’emplois à distance sans identifiants; attribution et lien de candidature original conservés. Le flux est mis à jour quotidiennement. |
| Indeed | Non connecté | Les API publiques documentées concernent surtout les employeurs et partenaires. Une adresse e-mail ne donne pas accès à un flux de recherche; accès partenaire à demander. |
| France Travail | Non connecté | Confirmer l’accès API et les conditions de réutilisation. |

## Moteur freelance

| Source | État | À faire |
| --- | --- | --- |
| Remotive / Arbeitnow / Jobicy / Remote OK / Himalayas | Connectées, limitées | Seules les annonces indiquant explicitement freelance ou travail par projet apparaissent dans cette vue. |
| Upwork | Non connecté | Accès développeur officiel et identifiants requis. |
| Malt / Contra | Non connectées | Vérifier la disponibilité d’un flux officiel ou d’une autorisation écrite. |
| Freelancer.com | Connecté | API publique de projets actifs publiée par des clients; aucun compte requis pour la lecture. Seuls les projets dont le pays du client est vérifiable et différent de l’Inde sont conservés. Les projets avec budget connu sont convertis en EUR et ceux sous 200 € sont masqués. Les projets sans budget restent visibles après les projets chiffrés. Un compte Freelancer est requis pour envoyer une proposition. |

Aucun scraping de pages protégées n’est activé; les offres freelance viennent de l’API publique Freelancer.com. Aucun identifiant de plateforme ni de candidat n’est configuré.


## Ressources à connecter, par facilité

### 1. Faciles ou déjà accessibles

- **We Work Remotely** : connecté via son flux RSS public, avec attribution et liens d’origine conservés.
- **Remote First Jobs** : API publique sans clé, mais ses conditions interdisent la republication des offres sur des sites tiers. Le tableau GitHub Pages étant public, la source n’est pas intégrée sans autorisation écrite.
- **Trabajos Online** : API de recherche publique repérée, mais les conditions de contact et de paiement imposent de garder les échanges sur leur plateforme. À examiner avant de l’afficher dans un tableau public.

### 2. API ou manipulation à préparer

- **France Travail** : l’API de recherche d’offres est actuellement retirée du portail pendant la révision de ses conditions de diffusion. Elle n’est donc pas connectée. Il faudra reprendre ce point quand l’API sera disponible; aucun compte ni identifiant n’est à créer maintenant.
- **Upwork** : API développeur et accès accordé par Upwork. Il faudra créer un compte développeur et demander les identifiants; les offres resteront consultées et proposées manuellement.
- **Taux de change Frankfurter** : connecté sans clé pour convertir les budgets affichés en euros. Les taux sont quotidiens; l’équivalent affiché reste une estimation.

### 3. Accès plus difficiles ou conditions à vérifier

- **Indeed** : une adresse e-mail ou un compte candidat ne suffit pas. Les API documentées sont destinées à des partenaires et à des intégrations précises; il faut obtenir l’accès et l’autorisation adéquate avant tout raccordement.
- **LinkedIn** : pas de collecte automatisée ni de contournement de protections. Une connexion nécessiterait une API ou un accès partenaire approuvé.
- **Malt / Contra** : aucun flux public adapté n’est configuré. Il faut vérifier les API officielles et les conditions d’utilisation avant de connecter des données.
- **Free-Work** : pages d’offres visibles sans compte, mais les CGU interdisent l’extraction d’une part substantielle de la base. Pas de collecte automatique sans accord écrit; les offres freelance de cette source sont surtout orientées IT.
- **HelloWork** : pas de flux public de recherche configuré; les conditions interdisent l’extraction automatisée pour une réutilisation hors service. Demander une autorisation ou utiliser le site manuellement.
- **Jobijoba** : les CGU interdisent explicitement le scraping, sauf licence écrite. Non connecté.
- **Welcome to the Jungle** : les CGU interdisent les scripts et robots d’extraction automatisée. Non connecté.
- **Jooble** : l’onglet ouvert est arrêté sur une vérification anti-robot. Aucun contournement ni scraping de cette page; il faudrait une API officielle si Jooble en accorde l’accès.
- **Compte Freelancer** : l’API publique ne sert qu’à lire les annonces. Pour envoyer une proposition, Mohammed devra créer son compte lui-même et accepter les règles de la plateforme. Nous le ferons ensemble plus tard; aucun compte n’est créé ici.

Aucune candidature, proposition ou prise de contact n’est envoyée automatiquement. Les identifiants éventuels devront être ajoutés comme secrets privés GitHub, jamais dans les fichiers publics.

## Traduction

L’interface est en français. Les annonces peuvent rester dans leur langue d’origine; le lien **« Traduire l’annonce en français »** ouvre la traduction de la page source. Une traduction intégrée des annonces nécessiterait un service de traduction avec une clé API et des règles de confidentialité à vérifier. Les annonces exigeant un niveau avancé dans une langue qui n’est pas indiquée sur le CV sont filtrées quand le texte le précise. Pour les emplois, le présentiel est limité à la France et aux Émirats arabes unis; le télétravail peut être situé ailleurs. Les missions freelance peuvent être internationales.

## Actualisation et confidentialité

- Emploi : actualisation planifiée à 01 h, 07 h, 13 h et 19 h UTC. Projets Freelancer.com : actualisation planifiée toutes les 15 minutes. Les changements pertinents du dépôt relancent également le flux.
- La correspondance est calculée dans GitHub Actions. Le profil candidat n’est ni publié sur Pages ni transmis aux sites d’offres.
- L’instantané public contient les détails des annonces, leur source, leur URL et un score indicatif, sans coordonnées du candidat.
- Les annonces enregistrées restent dans le navigateur; aucune base de données ni synchronisation de compte n’est configurée. Freelancer.com actualise les projets publiés par des clients et conserve le lien vers chaque demande d’origine.

## Candidatures

Les annonces d’emploi et les missions freelance restent séparées. Le score est un indice de pertinence, pas une prédiction d’embauche. Le système n’envoie jamais de candidature, proposition, enchère ni message automatiquement.
