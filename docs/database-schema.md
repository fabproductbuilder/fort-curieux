# Schéma initial Corps

Cette première migration prépare les fondations du module Corps sans ajouter de logique applicative automatique en base.

## Tables

`profiles` prolonge `auth.users` avec les informations minimales propres à l'application : un nom d'affichage facultatif, l'état d'onboarding et les dates de suivi. Elle ne duplique pas l'email, ne stocke aucun mot de passe, aucune donnée de santé et aucun objectif sportif.

`sport_templates` représente la semaine type personnelle de l'utilisateur. Chaque ligne décrit une activité librement nommée, son jour ISO de la semaine et son objectif attendu.

`sport_occurrences` représente une activité prévue à une date précise. Elle peut venir d'une ligne de semaine type, mais conserve son propre instantané du nom, du type de mesure et des objectifs.

## Semaine type et occurrences

La semaine type sert de modèle réutilisable. Une occurrence est l'activité concrète prévue pour une date donnée.

Les occurrences stockent un instantané pour préserver l'historique : si l'utilisateur modifie plus tard sa semaine type, les activités déjà générées gardent le contexte qui était prévu au moment de leur création.

Les occurrences seront générées par l'application lorsqu'une semaine est ouverte. Aucune génération automatique en base n'est ajoutée dans cette migration.

## Types de mesure

Les types disponibles sont :

- `repetitions`
- `duration_minutes`
- `distance_km`
- `sets_reps`
- `completion`

Les contraintes SQL imposent les champs d'objectif attendus pour chaque type.

## Statuts

Les occurrences peuvent avoir les statuts suivants :

- `planned`
- `completed`
- `skipped`
- `cancelled`

Une occurrence au statut `completed` doit avoir une date `completed_at`.

Pour une occurrence terminée, les résultats réalisés doivent être cohérents avec le type de mesure : valeur positive pour les répétitions, durées et distances, séries et répétitions positives pour `sets_reps`, aucun résultat numérique pour `completion`. Une occurrence non terminée ne peut pas porter de résultat réalisé, d'effort perçu ou de date de fin.

## Row Level Security

La RLS est activée sur `profiles`, `sport_templates` et `sport_occurrences`.

Le rôle `anon` n'a aucun privilège métier sur ces tables. Le rôle `authenticated` ne peut lire, créer, modifier ou supprimer que les lignes dont il est propriétaire, selon les opérations autorisées par table.

Les profils sont créés automatiquement après insertion dans `auth.users` par un trigger dédié. Leur propriétaire peut seulement modifier `display_name` et `onboarding_completed`; les colonnes techniques restent gérées par la base.
