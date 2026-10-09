import { haversine } from './scoring.js'
import allEvents from '../data/events.json'

// Rayon d'agrégation : deux événements à moins de 20 km appartiennent à la même
// « région » géographique (Jérusalem et ses environs, le lac de Galilée, etc.).
// On ne hard-code aucune région : elles sont déduites des lat/lng par un simple
// clustering glouton, déterministe (les événements sont triés par id).
const REGION_RADIUS_KM = 20

function computeRegions(events) {
  const centers = [] // coordonnées du premier événement de chaque région
  const byId = new Map()
  for (const e of [...events].sort((a, b) => a.id - b.id)) {
    let best = -1
    let bestDist = Infinity
    for (let i = 0; i < centers.length; i++) {
      const d = haversine({ lat: e.lat, lng: e.lng }, centers[i])
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    let region
    if (best >= 0 && bestDist <= REGION_RADIUS_KM) {
      region = best
    } else {
      region = centers.length
      centers.push({ lat: e.lat, lng: e.lng })
    }
    byId.set(e.id, region)
  }
  return byId
}

const REGION_BY_ID = computeRegions(allEvents)

export function regionOf(event) {
  return REGION_BY_ID.get(event.id)
}

export const REGION_COUNT = new Set(REGION_BY_ID.values()).size
