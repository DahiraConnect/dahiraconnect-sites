# Rubrique « Apprendre »

La rubrique remplace la liste du quiz. Chaque thème peut avoir **une leçon à écouter**, **un quiz**, ou les deux. Le contenu se trouve dans le JSON du quiz (`src/assets/mock/quiz.json`, puis la colonne `sites.quiz` dans Supabase). Aucune migration n'est nécessaire.

## Adresses

| Adresse | Page |
| --- | --- |
| `/apprendre` | Liste des thèmes |
| `/apprendre/<thème>` | Leçon : une carte à la fois, puis « Faire le quiz » |
| `/quiz/<thème>` | Quiz (inchangé, les liens déjà partagés marchent) |
| `/quiz` | Redirige vers `/apprendre` |

Dans la liste, un thème avec une leçon ouvre la leçon (bouton « Écouter ») ; sans leçon, il ouvre directement le quiz (bouton « Jouer »).

## Ajouter une leçon

Ajouter `lesson` au thème. `questions` peut rester vide le temps d'écrire le quiz : le thème n'aura alors qu'une leçon.

```json
{
  "id": "wazifa",
  "title": "La Wazifa",
  "description": "Ce que c'est, quand et comment.",
  "icon": "ph-book-open-text",
  "source": "Référence validée par le moukadam",
  "ar": { "title": "الوظيفة", "description": "…" },
  "questions": [],
  "lesson": {
    "cards": [
      {
        "title": "Qu'est-ce que la Wazifa ?",
        "text": "Une ou deux phrases courtes.",
        "audio": "/assets/lecons/wazifa/1-fr.m4a",
        "image": "/assets/lecons/wazifa/1.svg",
        "imageAlt": "Description de l'image",
        "ar": { "title": "…", "text": "…", "audio": "/assets/lecons/wazifa/1-ar.m4a" },
        "wo": { "audio": "/assets/lecons/wazifa/1-wo.m4a" }
      }
    ]
  }
}
```

L'icône doit exister dans la police d'icônes : en cas de nouvelle icône, relancer `npm run icons`.

## Langues

- **Français** : toujours proposé (`title` obligatoire).
- **Arabe** : proposé si **chaque** carte a `ar.title`.
- **Wolof** : proposé si **chaque** carte a `wo.audio`. Le texte wolof est facultatif : sans lui, la carte montre le texte français et fait entendre l'audio wolof. Les boutons restent en français.

Le son n'est jamais pris dans une autre langue. Sans enregistrement, le téléphone lit le texte à voix haute en français ou en arabe ; en wolof, il n'y a pas de voix de téléphone, l'enregistrement est donc indispensable.

## Enregistrements

- Une vraie voix (moukadam, serigne, membre du bureau), surtout pour les formules en arabe : la voix du téléphone les prononce mal.
- Un fichier par carte et par langue, **1 à 2 minutes au plus**, en `.m4a` (AAC, mono, 48–64 kb/s : environ 0,5 Mo par minute, supportable en 3G).
- Fichiers dans `src/assets/lecons/<thème>/`, nommés `<numéro>-<langue>.m4a`. Ils restent disponibles hors ligne une fois écoutés.

## Avant de publier

Le contenu religieux (Wazifa, Lazim, conditions de la Tariqa) doit être **validé par le référent religieux du dahira**, avec sa source dans `source`. Pour le Lazim et la Wazifa, qui demandent une autorisation (idhn), la leçon explique ce que c'est, quand et comment ; la publication du texte complet des formules est à décider avec le moukadam.
