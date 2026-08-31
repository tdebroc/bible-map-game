const KEY = 'bible-map-game.scores.v3'
const NAME_KEY = 'bible-map-game.player'

export function loadScores() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveScore(entry) {
  const list = loadScores()
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    ...entry,
  }
  list.push(record)
  list.sort((a, b) => b.score - a.score)
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)))
  } catch {
    /* quota dépassé */
  }
  return record
}

export function clearScores() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}

export function bestScore(level) {
  const list = loadScores().filter((s) => !level || s.level === level)
  return list.length ? Math.max(...list.map((s) => s.score)) : 0
}

export function getPlayerName() {
  try {
    return localStorage.getItem(NAME_KEY) || ''
  } catch {
    return ''
  }
}

export function setPlayerName(name) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    /* noop */
  }
}
