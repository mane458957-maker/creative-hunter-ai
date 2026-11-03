# Sources de données et état des connexions

**Mise à jour : 3 novembre 2026.** Trois flux publics sont récupérés par GitHub Actions quatre fois par jour. Le profil candidat sert uniquement au filtrage dans le runner; il n’est pas copié dans le site publié.

## Moteur emploi

| Source | État | Couverture et règles |
| --- | --- | --- |
| Remotive | Connectée | Offres à distance; décalage de 24 h et maximum conseillé de quatre requêtes par jour. Attribution et lien d’origine conservés. |
| Arbeitnow Europe | Connectée | Offres centrées sur l’Europe; lien vers Arbeitnow conservé. |
| Jobicy | Connectée | Offres à distance récentes; aucun compte ni clé requis. Attribution et lien original Jobicy conservés. |
| Indeed | Non connecté | Les API publiques documentées concernent surtout les employeurs et partenaires. Une adresse e-mail ne donne pas accès à un flux de recherche; accès partenaire à demander. |
| France Travail | Non connecté | Confirmer l’accès API et les conditions de réutilisation. |

## Moteur freelance

| Source | État | À faire |
| --- | --- | --- |
| Remotive / Arbeitnow / Jobicy | Connectées, limitées | Seules les annonces indiquant explicitement freelance ou travail par projet apparaissent dans cette vue. |
| Upwork | Non connecté | Accès développeur officiel et identifiants requis. |
| Malt / Contra | Non connectées | Vérifier la disponibilité d’un flux officiel ou d’une autorisation écrite. |
| Freelancer.com | Non connecté | Autorisation écrite à obtenir avant tout accès automatisé. |

Aucun scraping n’est activé. Aucun identifiant de plateforme n’est configuré.

## Traduction

L’interface est en français. Les annonces peuvent rester dans leur langue d’origine; le lien **« Traduire l’annonce en français »** ouvre la traduction de la page source. Une traduction intégrée des annonces nécessiterait un service de traduction avec une clé API et des règles de confidentialité à vérifier.

## Actualisation et confidentialité

- Actualisation planifiée à 01 h, 07 h, 13 h et 19 h UTC; les changements pertinents du dépôt relancent également le flux.
- La correspondance est calculée dans GitHub Actions. Le profil candidat n’est ni publié sur Pages ni transmis aux sites d’offres.
- L’instantané public contient les détails des annonces, leur source, leur URL et un score indicatif, sans coordonnées du candidat.
- Les annonces enregistrées restent dans le navigateur; aucune base de données ni synchronisation de compte n’est configurée.

## Candidatures

Les annonces d’emploi et les missions freelance restent séparées. Le score est un indice de pertinence, pas une prédiction d’embauche. Le système n’envoie jamais de candidature, proposition, enchère ni message automatiquement.
