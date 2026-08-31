import { useMemo, useState } from 'react'
import { clearScores, loadScores } from '../lib/storage.js'
import { MAX_POINTS, ROUNDS, rankTitle } from '../lib/scoring.js'
import { LEVELS, getLevel } from '../lib/levels.js'

const MEDALS = ['🥇', '🥈', '🥉']
const FILTERS = [{ id: 'tous', label: 'Tous', emoji: '🌍' }, ...LEVELS]

export default function Leaderboard({ onBack, highlightId }) {
  const [scores, setScores] = useState(() => loadScores())
  const [filter, setFilter] = useState('tous')

  const visible = useMemo(
    () => (filter === 'tous' ? scores : scores.filter((s) => s.level === filter)),
    [scores, filter]
  )

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

        {scores.length > 0 && (
          <div className="board-filters">
            {FILTERS.map((l) => (
              <button
                key={l.id}
                className={`chip ${filter === l.id ? 'active' : ''}`}
                onClick={() => setFilter(l.id)}
              >
                {l.emoji} {l.label}
                <small>
                  {l.id === 'tous' ? scores.length : scores.filter((s) => s.level === l.id).length}
                </small>
              </button>
            ))}
          </div>
        )}

        {!visible.length ? (
          <p className="empty">
            {scores.length
              ? 'Aucune partie enregistrée pour ce niveau.'
              : "Aucune partie enregistrée pour l'instant. Lancez une partie\u00a0!"}
          </p>
        ) : (
          <>
            <div className="board-summary">
              <div>
                <span className="k">Parties</span>
                <span className="v">{visible.length}</span>
              </div>
              <div>
                <span className="k">Meilleur</span>
                <span className="v">{visible[0].score.toLocaleString('fr-FR')}</span>
              </div>
              <div>
                <span className="k">Moyenne</span>
                <span className="v">
                  {Math.round(
                    visible.reduce((s, x) => s + x.score, 0) / visible.length
                  ).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            <ol className="board-list">
              {visible.map((s, i) => {
                const rank = rankTitle(s.score)
                const lvl = getLevel(s.level)
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
                        <span className={`badge ${lvl.className}`}>
                          {lvl.emoji} {lvl.label}
                        </span>
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
