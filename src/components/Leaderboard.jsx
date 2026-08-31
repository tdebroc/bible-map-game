import { useState } from 'react'
import { clearScores, loadScores } from '../lib/storage.js'
import { MAX_POINTS, ROUNDS, rankTitle } from '../lib/scoring.js'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ onBack, highlightId }) {
  const [scores, setScores] = useState(() => loadScores())

  const reset = () => {
    if (!window.confirm('Effacer tous les scores enregistrés ?')) return
    clearScores()
    setScores([])
  }

  return (
    <div className="screen leaderboard">
      <div className="aurora" />
      <div className="board-inner glass">
        <div className="board-head">
          <button className="btn ghost small" onClick={onBack}>
            ← Retour
          </button>
          <h2>🏆 Classement</h2>
          <button className="btn ghost small danger" onClick={reset} disabled={!scores.length}>
            Effacer
          </button>
        </div>

        {!scores.length ? (
          <p className="empty">Aucune partie enregistrée pour l'instant. Lancez une partie&nbsp;!</p>
        ) : (
          <>
            <div className="board-summary">
              <div>
                <span className="k">Parties</span>
                <span className="v">{scores.length}</span>
              </div>
              <div>
                <span className="k">Meilleur</span>
                <span className="v">{scores[0].score.toLocaleString('fr-FR')}</span>
              </div>
              <div>
                <span className="k">Moyenne</span>
                <span className="v">
                  {Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            <ol className="board-list">
              {scores.map((s, i) => {
                const rank = rankTitle(s.score)
                return (
                  <li
                    key={s.id}
                    className={`${s.id === highlightId ? 'highlight' : ''} ${i < 3 ? 'podium' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                  >
                    <span className="pos">{MEDALS[i] || i + 1}</span>
                    <span className="who">
                      {s.name || 'Pèlerin anonyme'}
                      <em>
                        {rank.emoji} {rank.title} · {new Date(s.date).toLocaleDateString('fr-FR')}
                      </em>
                    </span>
                    <span className="pts">
                      {s.score.toLocaleString('fr-FR')}
                      <small>/{(MAX_POINTS * ROUNDS).toLocaleString('fr-FR')}</small>
                    </span>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
