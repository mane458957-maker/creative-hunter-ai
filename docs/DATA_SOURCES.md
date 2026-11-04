# Sources de données et état des connexions

**Mise à jour : 4 novembre 2026.** Neuf flux publics ou conditionnels sont récupérés par GitHub Actions; les sources d’emploi sont rafraîchies quatre fois par jour et les projets Freelancer.com toutes les 15 minutes. Le profil candidat sert uniquement au filtrage dans le runner; il n’est pas copié dans le site publié.

## Moteur emploi

| Source | État | Couverture et règles |
| --- | --- | --- |
| Remotive | Connectée | Offres à distance; décalage de 24 h et maximum conseillé de quatre requêtes par jour. Attribution et lien d’origine conservés. |
| Active Vacancies | Connectée | Index d’offres provenant directement des pages carrières d’employeurs; API publique sans clé. Recherche ciblée France, Émirats et remote. Attribution, page source et lien de candidature employeur conservés. Nettoyage selon les offres signalées actives par la source. |
| 101 Careers | Connectée | API publique d’offres remote sans clé. Seules les lignes portant l’attribution « 101 Careers » sont affichées; les annonces appartenant aux sources partenaires sont exclues. |
| Arbeitnow Europe | Connectée | Offres centrées sur l’Europe; lien vers Arbeitnow conservé. |
| Jobicy | Connectée | Offres à distance récentes; aucun compte ni clé requis. Attribution et lien original Jobicy conservés. |
| Remote OK | Connectée | Flux public JSON sans identifiants; attribution et lien vers l’annonce originale conservés. |
| Himalayas | Connectée | API publique d’emplois à distance sans identifiants; attribution et lien de candidature original conservés. Le flux est mis à jour quotidiennement. |
| Indeed | Non connecté | Les API publiques documentées concernent surtout les employeurs et partenaires. Une adresse e-mail ne donne pas accès à un flux de recherche; accès partenaire à demander. |
| Adzuna France | En attente des clés privées | API officielle intégrée pour les recherches créatives en France. Créer gratuitement un compte développeur, puis ajouter `ADZUNA_APP_ID` et `ADZUNA_APP_KEY` dans Settings → Secrets and variables → Actions du dépôt GitHub. Ne jamais les publier ni les envoyer dans le chat. |
| France Travail | Indisponible | La fiche publique France Travail indique que l’API Offres d’emploi n’est actuellement plus exposée pendant l’analyse de ses modalités de distribution et de réutilisation. À reconsidérer lorsqu’elle sera réouverte. |

## Moteur freelance

| Source | État | À faire |
| --- | --- | --- |
| Remotive / Arbeitnow / Jobicy / Remote OK / Himalayas | Connectées, limitées | Seules les annonces indiquant explicitement freelance ou travail par projet apparaissent dans cette vue. |
| Upwork | Non connecté | Accès développeur officiel et identifiants requis. |
| Malt / Contra | Non connectées | Vérifier la disponibilité d’un flux officiel ou d’une autorisation écrite. |
| Freelancer.com | Connecté | API publique de projets actifs publiée par des clients; aucun compte requis pour la lecture. Aucun pays n’est exclu. Les projets avec budget connu sont convertis en EUR et ceux sous 200 € sont masqués. Les projets sans budget restent visibles après les projets chiffrés. Un compte Freelancer est requis pour envoyer une proposition. |

Aucun scraping de pages protégées n’est activé; les offres freelance viennent de l’API publique Freelancer.com. La recherche freelance inclut une vue dédiée aux projets d’animation 2D/3D, dessins animés, séries, animation de personnages et publicités animées. Le portfolio et Instagram publics de GOUAL ART sont liés dans cette vue. Aucun identifiant de plateforme ni de candidat n’est configuré.


## Ressources à connecter, par facilité

### 1. Faciles ou déjà accessibles

- **We Work Remotely** : connecté via son flux RSS public, avec attribution et liens d’origine conservés.
- **Active Vacancies** : API publique sans compte; utilisation explicitement annoncée pour les applications, recherches et tableaux de bord, avec lien source et lien de candidature employeur conservés.
- **101 Careers** : API publique sans clé; les annonces issues de sites partenaires ne sont pas rediffusées, seules celles attribuées à 101 Careers sont utilisées.
- **Remote First Jobs** : API publique sans clé, mais ses conditions interdisent la republication des offres sur des sites tiers. Le tableau GitHub Pages étant public, la source n’est pas intégrée sans autorisation écrite.
- **Trabajos Online** : API de recherche publique repérée, mais les conditions de contact et de paiement imposent de garder les échanges sur leur plateforme. À examiner avant de l’afficher dans un tableau public.

### 2. API ou manipulation à préparer

- **Adzuna France** : les recherches créatives sont intégrées au moteur; créer un compte développeur gratuit et ajouter `ADZUNA_APP_ID` et `ADZUNA_APP_KEY` comme secrets privés dans GitHub pour activer les requêtes. La documentation officielle prévoit l’accès par ces deux identifiants et autorise la recherche personnelle d’emploi.
- **France Travail** : l’API de recherche d’offres n’est actuellement plus exposée pendant la révision des modalités de diffusion et de réutilisation. Aucun compte ni identifiant n’est à créer maintenant; reprendre quand l’API sera réouverte.
- **Upwork** : API développeur et accès accordé par Upwork. Il faudra créer un compte développeur et demander les identifiants; les offres resteront consultées et proposées manuellement.
- **Taux de change Frankfurter** : connecté sans clé pour convertir les budgets affichés en euros. Les taux sont quotidiens; l’équivalent affiché reste une estimation.

### 3. Accès plus difficiles ou conditions à vérifier

- **Indeed** : une adresse e-mail ou un compte candidat ne suffit pas. Les API documentées sont destinées à des partenaires et à des intégrations précises; il faut obtenir l’accès et l’autorisation adéquate avant tout raccordement.
- **LinkedIn** : pas de collecte automatisée ni de contournement de protections. Une connexion nécessiterait une API ou un accès partenaire approuvé.
- **Malt** : le répertoire public permet aux clients de découvrir des profils de freelances; lien manuel ajouté dans la rubrique Animation. Aucun flux public d’offres/API n’est configuré pour importer des missions.
- **Fiverr** : marketplace de prestations; lien manuel vers la catégorie Animation ajouté dans la rubrique Animation. La création d’une offre de service est à faire par Mohammed; aucune annonce n’est importée automatiquement.
- **Upwork** : accès développeur officiel et autorisation requis pour une intégration automatique. La recherche manuelle de projets d’animation est liée dans la rubrique Animation.
- **Contra** : aucun flux public adapté n’est configuré. Vérifier les API officielles et les conditions avant une éventuelle connexion.
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
