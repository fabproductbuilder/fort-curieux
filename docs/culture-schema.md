# Schéma Culture

Le module Culture propose des repères courts, mobiles et réguliers. Il n'est pas conçu comme une encyclopédie ni comme un cours complet : l'objectif est de revoir souvent des cartes simples, utiles et mémorisables.

## Tables

`culture_items` représente l'objet culturel principal : un pays, une capitale, un département, une invention, un album, un repère historique ou géographique. Un item contient le contexte court qui rend la carte lisible : catégorie, type, collection, titre, période, lieu et résumé.

`culture_prompts` contient les questions liées à un item. Plusieurs prompts peuvent dépendre du même item : capitale dans un sens, capitale dans l'autre, inventeur, période, artiste, année, question générale.

`culture_progress` contient la progression d'un utilisateur au niveau du prompt. La progression se fait sur chaque question, pas seulement sur l'item, car connaître `Italie -> Rome` ne signifie pas forcément connaître `Rome -> Italie`.

## Catégories

Les catégories autorisées sont :

- `history`
- `geography`
- `inventions`
- `music`
- `cinema`

Elles correspondent aux univers retenus pour Fort Curieux Culture : histoire, géographie, inventions et découvertes, musique et cinéma.

## Types D'items

`cultural_marker` désigne un repère narratif court : chute de Rome, Nil, jazz, premiers Jeux olympiques modernes. Il sert à ancrer une information culturelle générale.

`knowledge_card` désigne une carte de mémorisation plus directe : capitale, numéro de département, artiste d'un album, période d'une invention. Elle peut porter plusieurs prompts courts et bidirectionnels.

## Collections

`collection` regroupe des items comparables sans créer de table supplémentaire à ce stade. Exemples :

- `country_capitals`
- `us_state_capitals`
- `french_department_numbers`
- `history_markers`
- `geography_markers`
- `invention_dates`
- `invention_people`
- `music_album_dates`
- `music_song_dates`
- `music_artist_links`
- `music_markers`
- `cinema_markers`
- `cinema_film_dates`
- `cinema_director_links`
- `cinema_actor_links`

Les collections aideront plus tard à composer des sessions et à générer des choix multiples cohérents entre questions de même famille.

## Prompts

Un item peut avoir plusieurs prompts. Par exemple `Italie` peut porter :

- `Quelle est la capitale de l'Italie ?` -> `Rome`
- `Rome est la capitale de quel pays ?` -> `Italie`

`prompt_type` décrit la nature de la réponse attendue : capitale, pays, numéro de département, date, période, personne, artiste, album, chanson, film, réalisateur, acteur ou question générale.

`prompt_direction` précise le sens de la question :

- `standard` : question directe non bidirectionnelle, adaptée aux repères narratifs.
- `forward` : sens principal, par exemple pays -> capitale.
- `reverse` : sens inverse, par exemple capitale -> pays.

Le cinéma suit la même logique multi-prompts : film -> réalisateur, réalisateur -> film, film -> année, et plus tard acteur -> film connu.

## Modes De Réponse

Le mode par défaut prévu pour la V1 est le choix multiple. Il est plus mobile-first, rapide, moins frustrant et évite les problèmes d'accents ou de variantes typographiques.

La réponse libre pourra être ajoutée plus tard pour un mode plus difficile. Elle sera utile pour les capitales, départements et dates, mais demandera de comparer la réponse utilisateur à `answer` et à `answer_aliases`.

`choices` peut rester vide ou contenir des propositions explicites. Plus tard, l'application pourra aussi générer des choix depuis les autres prompts d'une même collection.

`answer_aliases` prépare les variantes acceptées en réponse libre : sans accent, forme courte, article optionnel ou nom courant.

## Modes De Session

Le mode par défaut recommandé est une session rapide toutes catégories. L'utilisateur doit pouvoir lancer Culture sans choisir une catégorie : la session peut mélanger histoire, géographie, inventions, musique et cinéma.

Cette logique ne demande pas de table supplémentaire. Une session toutes catégories pourra récupérer les prompts actifs en joignant `culture_prompts`, `culture_items` et éventuellement `culture_progress`, sans filtre de catégorie.

Les modes prévus sont :

- `quick_mix` : session courte et variée, toutes catégories, pensée comme l'entrée par défaut.
- `review_due` : révision prioritaire des questions dont `next_review_at` est proche ou dépassé.
- `category_focus` : session centrée sur une catégorie choisie, par exemple cinéma ou géographie.
- `collection_focus` : session centrée sur une collection, par exemple capitales de pays ou numéros de départements.

Les scopes prévus sont :

- `all` : toutes les catégories, option principale.
- `category` : une catégorie spécifique, option secondaire.
- `collection` : une collection précise, option secondaire.

L'objectif produit reste une routine courte, mobile-first, fluide et variée. Le choix d'une catégorie doit rester possible plus tard, mais il ne doit pas être obligatoire.

## Révision Continue

Une question connue ne disparaît jamais définitivement. Fort Curieux Culture doit entretenir la mémoire dans le temps :

- une bonne réponse peut espacer la prochaine révision ;
- une mauvaise réponse peut rapprocher la prochaine révision ;
- une carte maîtrisée revient moins souvent ;
- `mastered` ne signifie pas “terminé définitivement”.

Cette logique s'applique aussi au cinéma : connaître le réalisateur ou l'année d'un film espace la prochaine révision, mais la question peut revenir plus tard.

Le socle ne contient pas encore d'algorithme de répétition espacée complet. Il prépare seulement les données nécessaires : `next_review_at`, `last_result`, `review_count`, `correct_count`, `incorrect_count` et `streak_count`.

## Statuts De Maîtrise

Les statuts autorisés dans `culture_progress.mastery_status` sont :

- `new`
- `discovered`
- `review`
- `known`
- `mastered`

Ils indiquent un état de révision simple. Même `mastered` reste révisable.

## Pourquoi La Progression Est Au Niveau Du Prompt

Un même objet culturel peut contenir plusieurs connaissances. Pour `Thriller`, l'utilisateur peut connaître l'artiste mais oublier l'année. Pour un département, il peut connaître `Moselle -> 57` mais pas `57 -> Moselle`.

La progression au niveau de `culture_prompts` permet donc des sessions plus justes et plus utiles, sans dupliquer les items.

## Seed Initial

Le seed reste volontairement petit :

- 12 repères narratifs courts ;
- 2 capitales de pays ;
- 2 capitales d'États américains ;
- 2 numéros de départements français ;
- 2 inventions avec personne et période ;
- 2 éléments musique avec artiste et année.

On ne seed pas encore tous les pays, tous les États américains ou tous les départements français pour garder le socle relisible, contrôlable et adapté à une première interface mobile-first.

## Sécurité

La RLS est activée sur les trois tables.

Les utilisateurs authentifiés peuvent lire uniquement les items et prompts actifs. Ils ne peuvent pas créer, modifier ou supprimer le contenu culturel depuis le client.

Chaque utilisateur ne peut lire, créer, modifier ou supprimer que ses propres lignes dans `culture_progress`. Aucun droit large n'est donné au rôle `anon`.
