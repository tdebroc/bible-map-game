import { useState } from 'react'
import Home from './components/Home.jsx'
import Game from './components/Game.jsx'
import GameOver from './components/GameOver.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import { bestScore, getPlayerName, saveScore, setPlayerName } from './lib/storage.js'
import { setMuted, sfx } from './lib/sfx.js'
import events from './data/events.json'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [name, setName] = useState(() => getPlayerName())
  const [best, setBest] = useState(() => bestScore())
  const [result, setResult] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [isBest, setIsBest] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [mute, setMute] = useState(false)

  const changeName = (v) => {
    setName(v)
    setPlayerName(v)
  }

  const start = () => {
    setGameKey((k) => k + 1)
    setScreen('game')
  }

  const finish = (r) => {
    const previousBest = bestScore()
    const record = saveScore({ name: name.trim() || 'Pèlerin anonyme', score: r.score, rounds: r.rounds })
    setResult(r)
    setSavedId(record.id)
    setIsBest(r.score > previousBest)
    setBest(Math.max(previousBest, r.score))
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
        />
      )}

      {screen === 'game' && <Game key={gameKey} onFinish={finish} onQuit={() => setScreen('home')} />}

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
