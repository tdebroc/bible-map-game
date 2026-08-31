import { useMemo, useState } from 'react'
import Home from './components/Home.jsx'
import Game from './components/Game.jsx'
import GameOver from './components/GameOver.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import { bestScore, getPlayerName, saveScore, setPlayerName } from './lib/storage.js'
import { DEFAULT_LEVEL } from './lib/levels.js'
import { setMuted, sfx } from './lib/sfx.js'
import events from './data/events.json'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [name, setName] = useState(() => getPlayerName())
  const [level, setLevel] = useState(DEFAULT_LEVEL)
  const [scoresVersion, setScoresVersion] = useState(0)
  const [result, setResult] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [isBest, setIsBest] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [mute, setMute] = useState(false)

  // Le record est propre à chaque niveau : comparer un score « facile » à un
  // score « difficile » n'aurait pas de sens.
  const best = useMemo(() => bestScore(level), [level, scoresVersion])

  const changeName = (v) => {
    setName(v)
    setPlayerName(v)
  }

  const start = () => {
    setGameKey((k) => k + 1)
    setScreen('game')
  }

  const finish = (r) => {
    const previousBest = bestScore(r.level)
    const record = saveScore({
      name: name.trim() || 'Pèlerin anonyme',
      score: r.score,
      level: r.level,
      rounds: r.rounds,
    })
    setResult(r)
    setSavedId(record.id)
    setIsBest(r.score > previousBest)
    setScoresVersion((v) => v + 1)
    setScreen('gameover')
  }

  const toggleMute = () => {
    const v = !mute
    setMute(v)
    setMuted(v)
    if (!v) sfx.click()
  }

  return (
    <div className="app">
      <button className="mute-btn" onClick={toggleMute} title={mute ? 'Activer le son' : 'Couper le son'}>
        {mute ? '🔇' : '🔊'}
      </button>

      {screen === 'home' && (
        <Home
          onStart={start}
          onLeaderboard={() => setScreen('leaderboard')}
          best={best}
          playerName={name}
          onNameChange={changeName}
          eventCount={events.length}
          level={level}
          onLevelChange={setLevel}
        />
      )}

      {screen === 'game' && (
        <Game key={gameKey} level={level} onFinish={finish} onQuit={() => setScreen('home')} />
      )}

      {screen === 'gameover' && result && (
        <GameOver
          result={result}
          isBest={isBest}
          onReplay={start}
          onLeaderboard={() => setScreen('leaderboard')}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard highlightId={savedId} onBack={() => setScreen(result ? 'gameover' : 'home')} />
      )}
    </div>
  )
}
