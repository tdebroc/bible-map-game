import { ROUNDS, ROUND_TIME, MAX_POINTS } from '../lib/scoring.js'
import { LEVELS } from '../lib/levels.js'
import { sfx } from '../lib/sfx.js'
import events from '../data/events.json'

export default function Home({
  onStart,
  onLeaderboard,
  best,
  playerName,
  onNameChange,
  eventCount,
  level,
  onLevelChange,
}) {
  return (
    <div className="screen home">
      <div className="aurora" />
      <div className="stars" />

      <div className="home-inner">
        <div className="logo-badge">✝️</div>
        <h1 className="title">
          <span className="title-gradient">BiblioMap</span>
        </h1>
        <p className="subtitle">Sur les pas de Jésus — saurez-vous situer sa vie sur la carte&nbsp;?</p>

        <div className="pill-row">
          <span className="pill">🗺️ {ROUNDS} questions</span>
          <span className="pill">⏱️ {ROUND_TIME}s par question</span>
          <span className="pill">💎 {MAX_POINTS.toLocaleString('fr-FR')} pts max</span>
          <span className="pill">📚 {eventCount} événements</span>
        </div>

        <div className="level-picker">
          <span className="field-label">Niveau de difficulté</span>
          <div className="level-options" role="radiogroup" aria-label="Niveau de difficulté">
            {LEVELS.map((l) => {
              const count = events.filter((e) => e.difficulty === l.id).length
              return (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={level === l.id}
                  className={`level-card ${l.className} ${level === l.id ? 'active' : ''}`}
                  onClick={() => {
                    sfx.unlock()
                    sfx.click()
                    onLevelChange(l.id)
                  }}
                >
                  <span className="level-emoji">{l.emoji}</span>
                  <span className="level-name">{l.label}</span>
                  <span className="level-tagline">{l.tagline}</span>
                  <span className="level-count">{count} événements</span>
                </button>
              )
            })}
          </div>
          <p className="level-hint">{LEVELS.find((l) => l.id === level)?.hint}</p>
        </div>

        <div className="name-field">
          <label htmlFor="player">Votre nom</label>
          <input
            id="player"
            maxLength={18}
            placeholder="Pèlerin anonyme"
            value={playerName}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div className="home-actions">
          <button
            className="btn primary huge glow"
            onClick={() => {
              sfx.unlock()
              sfx.click()
              onStart()
            }}
          >
            ▶ Commencer la partie
          </button>
          <button className="btn ghost" onClick={onLeaderboard}>
            🏆 Classement
          </button>
        </div>

        {best > 0 && (
          <p className="best-line">
            Meilleur score : <strong>{best.toLocaleString('fr-FR')}</strong> pts
          </p>
        )}

        <div className="rules glass">
          <h3>Comment jouer</h3>
          <ul>
            <li>Un événement de la vie de Jésus s'affiche.</li>
            <li>Cliquez sur la carte à l'endroit où il s'est produit : la réponse est validée immédiatement.</li>
            <li>Les noms de villes sont affichés sur la carte pour vous repérer.</li>
            <li>Plus vous êtes <strong>proche</strong> et <strong>rapide</strong>, plus vous marquez de points.</li>
            <li>Enchaînez les bonnes réponses (&lt; 100 km) pour déclencher le <strong>combo 🔥</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
