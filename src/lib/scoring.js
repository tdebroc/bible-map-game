export const MAX_POINTS = 5000
export const ROUND_TIME = 10 // secondes
export const ROUNDS = 10

export function haversine(a, b) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Décroissance exponentielle : 5 km => 97 %, 25 km => 85 %, 100 km => 51 %, 400 km => 7 %
export function distanceFactor(km) {
  return Math.exp(-km / 150)
}

export function timeFactor(secondsLeft) {
  return 0.5 + 0.5 * Math.max(0, Math.min(1, secondsLeft / ROUND_TIME))
}

export function computeScore({ km, secondsLeft, streak = 0 }) {
  const base = MAX_POINTS * distanceFactor(km) * timeFactor(secondsLeft)
  const withCombo = base * (1 + 0.05 * streak)
  return Math.max(0, Math.min(MAX_POINTS, Math.round(withCombo)))
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString('fr-FR')} km`
}

export function verdict(km) {
  if (km < 5) return { label: 'PARFAIT !', emoji: '🎯', tier: 'perfect' }
  if (km < 25) return { label: 'INCROYABLE !', emoji: '🔥', tier: 'great' }
  if (km < 75) return { label: 'TRÈS BIEN !', emoji: '⭐', tier: 'good' }
  if (km < 250) return { label: 'PAS MAL', emoji: '👍', tier: 'ok' }
  if (km < 1000) return { label: 'LOIN...', emoji: '😬', tier: 'meh' }
  return { label: 'PERDU DANS LE DÉSERT', emoji: '🏜️', tier: 'bad' }
}

export function rankTitle(total) {
  const max = MAX_POINTS * ROUNDS
  const p = total / max
  if (p >= 0.85) return { title: 'Docteur de la Loi', emoji: '📜' }
  if (p >= 0.7) return { title: 'Apôtre', emoji: '🕊️' }
  if (p >= 0.55) return { title: 'Disciple', emoji: '✨' }
  if (p >= 0.4) return { title: 'Pèlerin', emoji: '🧭' }
  if (p >= 0.2) return { title: 'Catéchumène', emoji: '🌱' }
  return { title: 'Voyageur égaré', emoji: '🐫' }
}
