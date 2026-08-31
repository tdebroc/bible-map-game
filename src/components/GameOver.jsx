import { useEffect, useState } from 'react'
import Confetti from './Confetti.jsx'
import CountUp from './CountUp.jsx'
import { MAX_POINTS, ROUNDS, formatDistance, rankTitle } from '../lib/scoring.js'
import { getLevel } from '../lib/levels.js'

export default function GameOver({ result, isBest, onReplay, onLeaderboard, onHome }) {
  const [burst, setBurst] = useState(0)
  const rank = rankTitle(result.score)
  const lvl = getLevel(result.level)
  const max = MAX_POINTS * ROUNDS

  useEffect(() => {
    const t = setTimeout(() => setBurst(1), 350)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="screen gameover">
      <div className="aurora" />
      <Confetti burst={burst} intensity={1.6} />
      <div className="gameover-inner glass">
        <p className="eyebrow">Partie terminée</p>
        <span className={`badge ${lvl.className}`}>
          {lvl.emoji} Niveau {lvl.label}
        </span>
        <div className="rank-emoji">{rank.emoji}</div>
        <h2 className="rank-title">{rank.title}</h2>

        <div className="final-score">
          <CountUp value={result.score} duration={1600} />
          <small> / {max.toLocaleString('fr-FR')}</small>
        </div>
        {isBest && <div className="new-best">🏅 Nouveau record en niveau {lvl.label} !</div>}

        <div className="score-bar">
          <div className="score-bar-fill" style={{ width: `${(result.score / max) * 100}%` }} />
        </div>

        <ul className="recap">
          {result.rounds.map((r, i) => (
            <li key={i} style={{ animationDelay: `${i * 60}ms` }}>
              <span className="recap-num">{i + 1}</span>
              <span className="recap-title">
                {r.title}
                <em>{r.place}</em>
              </span>
              <span className="recap-dist">{r.km === null ? '—' : formatDistance(r.km)}</span>
              <span className="recap-pts">{r.points.toLocaleString('fr-FR')}</span>
            </li>
          ))}
        </ul>

        <div className="gameover-actions">
          <button className="btn primary big glow" onClick={onReplay}>
            🔁 Rejouer
          </button>
          <button className="btn ghost" onClick={onLeaderboard}>
            🏆 Classement
          </button>
          <button className="btn ghost" onClick={onHome}>
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  )
}
