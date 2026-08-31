import { useEffect, useMemo, useRef, useState } from 'react'
import MapCanvas from './MapCanvas.jsx'
import Confetti from './Confetti.jsx'
import CountUp from './CountUp.jsx'
import { sfx } from '../lib/sfx.js'
import {
  ROUNDS,
  ROUND_TIME,
  computeScore,
  formatDistance,
  haversine,
  verdict,
} from '../lib/scoring.js'
import allEvents from '../data/events.json'

function pickRounds() {
  const byDiff = { facile: [], moyen: [], difficile: [] }
  allEvents.forEach((e) => byDiff[e.difficulty]?.push(e))
  const shuffle = (a) => [...a].sort(() => Math.random() - 0.5)
  // Progression : on commence facile, on finit difficile
  const plan = ['facile', 'facile', 'moyen', 'moyen', 'difficile']
  const pools = {
    facile: shuffle(byDiff.facile),
    moyen: shuffle(byDiff.moyen),
    difficile: shuffle(byDiff.difficile),
  }
  const fallback = shuffle(allEvents)
  const chosen = []
  const used = new Set()
  plan.forEach((d) => {
    let e = pools[d].find((x) => !used.has(x.id))
    if (!e) e = fallback.find((x) => !used.has(x.id))
    if (e) {
      used.add(e.id)
      chosen.push(e)
    }
  })
  return chosen.slice(0, ROUNDS)
}

const DIFF_META = {
  facile: { label: 'Facile', className: 'diff-easy' },
  moyen: { label: 'Moyen', className: 'diff-medium' },
  difficile: { label: 'Difficile', className: 'diff-hard' },
}

export default function Game({ onFinish, onQuit }) {
  const rounds = useMemo(pickRounds, [])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('guessing')
  const [guess, setGuess] = useState(null)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [results, setResults] = useState([])
  const [last, setLast] = useState(null)
  const [burst, setBurst] = useState(0)
  const [shake, setShake] = useState(false)

  const deadlineRef = useRef(0)
  const rafRef = useRef(null)
  const lastTickRef = useRef(ROUND_TIME)
  const phaseRef = useRef(phase)
  const guessRef = useRef(guess)
  phaseRef.current = phase
  guessRef.current = guess

  const current = rounds[index]
  const total = results.reduce((s, r) => s + r.points, 0)
  const streak = results.length
    ? results.reduce((acc, r) => (r.km < 100 ? acc + 1 : 0), 0)
    : 0

  // Chronomètre de la manche
  useEffect(() => {
    if (phase !== 'guessing') return
    deadlineRef.current = performance.now() + ROUND_TIME * 1000
    lastTickRef.current = ROUND_TIME
    const loop = () => {
      const remain = Math.max(0, (deadlineRef.current - performance.now()) / 1000)
      setTimeLeft(remain)
      const whole = Math.ceil(remain)
      if (whole <= 3 && whole !== lastTickRef.current && whole > 0) {
        lastTickRef.current = whole
        sfx.tick()
      }
      if (remain <= 0) {
        submit(true)
        return
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase])

  function submit(timedOut = false, guessOverride = null) {
    if (phaseRef.current !== 'guessing') return
    cancelAnimationFrame(rafRef.current)
    const secondsLeft = Math.max(0, (deadlineRef.current - performance.now()) / 1000)
    const g = guessOverride ?? guessRef.current
    const truth = { lat: current.lat, lng: current.lng }

    let entry
    if (!g || timedOut) {
      const km = g ? haversine(g, truth) : null
      entry = {
        event: current,
        guess: g,
        km,
        points: g ? computeScore({ km, secondsLeft: 0, streak }) : 0,
        timedOut: true,
        secondsUsed: ROUND_TIME,
      }
    } else {
      const km = haversine(g, truth)
      entry = {
        event: current,
        guess: g,
        km,
        points: computeScore({ km, secondsLeft, streak }),
        timedOut: false,
        secondsUsed: ROUND_TIME - secondsLeft,
      }
    }

    const v = entry.km === null ? verdict(99999) : verdict(entry.km)
    entry.verdict = v
    setLast(entry)
    setResults((r) => [...r, entry])
    setTimeLeft(0)
    setPhase('revealed')

    if (entry.points === 0 || v.tier === 'bad' || v.tier === 'meh') {
      sfx.fail()
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } else {
      sfx.success(v.tier)
      if (v.tier === 'perfect' || v.tier === 'great' || v.tier === 'good') {
        setBurst((b) => b + 1)
      }
    }
  }

  function next() {
    sfx.click()
    if (index + 1 >= rounds.length) {
      sfx.finish()
      onFinish({
        score: total,
        rounds: results.map((r) => ({
          title: r.event.title,
          place: r.event.place,
          km: r.km,
          points: r.points,
          difficulty: r.event.difficulty,
        })),
      })
      return
    }
    setGuess(null)
    setLast(null)
    setPhase('guessing')
    setTimeLeft(ROUND_TIME)
    setIndex((i) => i + 1)
  }

  // Raccourci clavier : passer à la manche suivante après la correction
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (phaseRef.current !== 'revealed') return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, results])

  const pct = Math.max(0, Math.min(100, (timeLeft / ROUND_TIME) * 100))
  const urgent = timeLeft <= 3 && phase === 'guessing'
  const diff = DIFF_META[current.difficulty]

  return (
    <div className={`game ${shake ? 'shake' : ''} ${phase === 'revealed' ? 'is-revealed' : ''}`}>
      <MapCanvas
        guess={guess}
        truth={phase === 'revealed' ? { lat: current.lat, lng: current.lng } : null}
        locked={phase !== 'guessing'}
        onGuess={(g) => {
          setGuess(g)
          sfx.place()
          submit(false, g)
        }}
        resetSignal={index}
      />

      <Confetti burst={burst} intensity={last?.verdict?.tier === 'perfect' ? 1.8 : 1} />

      <div className="hud-top">
        <button className="btn ghost small" onClick={onQuit}>
          ← Quitter
        </button>
        <div className="hud-stats">
          <div className="stat">
            <span className="stat-label">Manche</span>
            <span className="stat-value">
              {index + 1}
              <small>/{rounds.length}</small>
            </span>
          </div>
          <div className="stat stat-score">
            <span className="stat-label">Score</span>
            <span className="stat-value">
              <CountUp value={total} />
            </span>
          </div>
          {streak >= 2 && (
            <div className="stat stat-combo" key={streak}>
              <span className="stat-label">Combo</span>
              <span className="stat-value">🔥 x{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="question-card glass">
        <div className="question-head">
          <span className={`badge ${diff.className}`}>{diff.label}</span>
          <span className="badge badge-round">Question {index + 1}</span>
        </div>
        <h2 className="question-title">{current.title}</h2>
        <p className="question-desc">{current.description}</p>
        <p className="question-hint">Où cet événement s'est-il déroulé&nbsp;?</p>
      </div>

      <div className={`timer-wrap ${urgent ? 'urgent' : ''} ${phase === 'revealed' ? 'done' : ''}`}>
        <div className="timer-bar">
          <div className="timer-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="timer-value">{Math.ceil(timeLeft)}s</div>
      </div>

      {phase === 'guessing' && (
        <div className="click-hint">
          <span className="click-hint-dot" />
          Cliquez sur la carte pour répondre
        </div>
      )}

      {phase === 'revealed' && last && (
        <div className={`result-panel glass tier-${last.verdict.tier}`}>
          <div className="result-verdict">
            <span className="result-emoji">{last.verdict.emoji}</span>
            <span className="result-label">{last.timedOut && !last.guess ? 'TEMPS ÉCOULÉ' : last.verdict.label}</span>
          </div>
          <div className="result-points">
            + <CountUp value={last.points} /> <small>pts</small>
          </div>
          <div className="result-meta">
            <div>
              <span className="k">Lieu</span>
              <span className="v">{last.event.place}</span>
            </div>
            <div>
              <span className="k">Distance</span>
              <span className="v">{last.km === null ? '—' : formatDistance(last.km)}</span>
            </div>
            <div>
              <span className="k">Temps</span>
              <span className="v">{last.secondsUsed.toFixed(1)}s</span>
            </div>
          </div>
          <blockquote className="result-verse">{last.event.verse}</blockquote>
          <div className="result-actions">
            <a className="btn ghost small" href={last.event.bibleLink} target="_blank" rel="noreferrer">
              📖 Lire le passage
            </a>
            <button className="btn primary" onClick={next}>
              {index + 1 >= rounds.length ? '🏆 Voir mon score' : 'Suivant →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
