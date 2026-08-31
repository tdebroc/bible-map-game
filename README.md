# ✝️ BiblioMap — Sur les pas de Jésus

Jeu web (type GeoGuessr) : un événement de la vie de Jésus s'affiche, il faut cliquer
sur la carte à l'endroit où il s'est produit. Plus la réponse est **proche** et
**rapide**, plus elle rapporte de points (jusqu'à **5 000 pts** par question,
**10 questions** par partie, **10 secondes** par question).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build
```

## Fonctionnement

- **Carte** : Leaflet + imagerie satellite Esri (aucune clé d'API requise), centrée
  par défaut sur le Moyen-Orient / la Terre sainte (zoom 7). Le fond ne comporte
  **aucun nom de lieu** pendant la question ; les noms apparaissent en fondu au
  moment de la correction.
- **Score** : `5000 × e^(−distance_km/150) × (0,5 + 0,5 × temps_restant/10) × (1 + 0,05 × combo)`,
  plafonné à 5 000 points. Le combo s'incrémente à chaque réponse à moins de 100 km.
- **Timer** : barre dégradée qui décroît en temps réel, passe en rouge et pulse
  sous les 3 secondes. À 0 s la manche est perdue (0 pt si aucun pin posé).
- **Effets** : confettis canvas, ondes au clic sur la carte, pins animés, ligne
  pointillée animée entre la réponse et le vrai lieu, compteurs de score animés,
  shake d'écran en cas d'échec, sons générés en Web Audio (coupables via 🔊).
- **Sauvegarde** : scores en `localStorage` (`bible-map-game.scores.v1`), page
  classement triée avec podium, moyenne et remise à zéro.

## Données — `src/data/events.json`

62 événements de la vie de Jésus, chacun avec :

| champ | description |
|---|---|
| `id` | identifiant unique |
| `title` | titre de l'événement |
| `place` | nom du lieu |
| `lat` / `lng` | coordonnées GPS |
| `difficulty` | `facile`, `moyen` ou `difficile` |
| `description` | résumé de la scène (sans citer le nom du lieu) |
| `verse` | verset associé |
| `bibleLink` | lien vers le passage (BibleGateway, Louis Segond) |

Chaque partie tire 10 événements selon une progression
`facile → moyen → difficile`.

## Raccourcis

- `Espace` / `Entrée` : valider la réponse, puis passer à la question suivante.

## Structure

```
src/
  data/events.json      # les 62 événements
  lib/scoring.js        # haversine, calcul du score, rangs
  lib/storage.js        # localStorage (scores + nom du joueur)
  lib/sfx.js            # sons Web Audio
  components/
    Home.jsx  Game.jsx  MapCanvas.jsx
    GameOver.jsx  Leaderboard.jsx
    Confetti.jsx  CountUp.jsx
```
