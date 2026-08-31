import { useEffect, useRef } from 'react'
import L from 'leaflet'

const DEFAULT_CENTER = [31.9, 35.4] // Terre sainte / Moyen-Orient
const DEFAULT_ZOOM = 7

// Fonds Esri : pas de clé d'API requise. L'imagerie satellite ne comporte
// aucun nom de lieu, ce qui évite de donner la réponse avant la validation.
const NO_LABELS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const LABELS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
const ATTR = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'

function guessIcon() {
  return L.divIcon({
    className: 'pin-wrap',
    html: '<div class="pin pin-guess"><span>📍</span><i class="pin-pulse"></i></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 36],
  })
}

function truthIcon() {
  return L.divIcon({
    className: 'pin-wrap',
    html: '<div class="pin pin-truth"><span>✝️</span><i class="pin-halo"></i></div>',
    iconSize: [46, 46],
    iconAnchor: [23, 40],
  })
}

export default function MapCanvas({ guess, truth, locked, onGuess, resetSignal }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const labelsRef = useRef(null)
  const guessMarkerRef = useRef(null)
  const truthMarkerRef = useRef(null)
  const lineRef = useRef(null)
  const circleRef = useRef(null)
  const lockedRef = useRef(locked)
  const onGuessRef = useRef(onGuess)

  lockedRef.current = locked
  onGuessRef.current = onGuess

  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 13,
      zoomControl: false,
      doubleClickZoom: false,
      attributionControl: true,
      worldCopyJump: true,
      maxBounds: [
        [-85, -240],
        [85, 240],
      ],
      maxBoundsViscosity: 0.8,
    })
    // Deux calques séparés : le fond est assombri par CSS, pas les noms de lieux
    map.createPane('basemap').style.zIndex = 200
    map.createPane('labels').style.zIndex = 300
    map.getPane('labels').style.pointerEvents = 'none'

    L.tileLayer(NO_LABELS, { attribution: ATTR, maxNativeZoom: 16, pane: 'basemap' }).addTo(map)
    labelsRef.current = L.tileLayer(LABELS, { opacity: 0, maxNativeZoom: 16, pane: 'labels' })
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    map.on('click', (e) => {
      if (lockedRef.current) return
      spawnRipple(map, e.latlng)
      onGuessRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 60)
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Marqueur du joueur
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!guess) {
      if (guessMarkerRef.current) {
        map.removeLayer(guessMarkerRef.current)
        guessMarkerRef.current = null
      }
      return
    }
    if (guessMarkerRef.current) {
      guessMarkerRef.current.setLatLng(guess)
    } else {
      guessMarkerRef.current = L.marker(guess, { icon: guessIcon(), keyboard: false }).addTo(map)
    }
  }, [guess])

  // Révélation
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!truth) return

    truthMarkerRef.current = L.marker(truth, { icon: truthIcon(), zIndexOffset: 500 }).addTo(map)
    circleRef.current = L.circleMarker(truth, {
      radius: 8,
      color: '#ffd76a',
      weight: 2,
      fillOpacity: 0.2,
      className: 'truth-ring',
    }).addTo(map)

    if (guess) {
      lineRef.current = L.polyline([guess, truth], {
        color: '#ffd76a',
        weight: 3,
        opacity: 0.9,
        dashArray: '2 10',
        lineCap: 'round',
        className: 'reveal-line',
      }).addTo(map)
      // On réserve la place occupée par le panneau de résultat en bas de l'écran
      const bottomInset = Math.min(300, map.getSize().y * 0.42)
      map.flyToBounds(L.latLngBounds([guess, truth]), {
        duration: 1.1,
        maxZoom: 10,
        paddingTopLeft: [40, 90],
        paddingBottomRight: [40, bottomInset],
      })
    } else {
      map.flyTo(truth, 8, { duration: 1.1 })
    }

    // Fait apparaître les noms de lieux au moment de la correction
    const labels = labelsRef.current
    labels.addTo(map)
    let o = 0
    const fade = setInterval(() => {
      o = Math.min(1, o + 0.08)
      labels.setOpacity(o)
      if (o >= 1) clearInterval(fade)
    }, 30)
    return () => clearInterval(fade)
  }, [truth])

  // Réinitialisation entre deux manches
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    ;[guessMarkerRef, truthMarkerRef, lineRef, circleRef].forEach((ref) => {
      if (ref.current) {
        map.removeLayer(ref.current)
        ref.current = null
      }
    })
    if (labelsRef.current && map.hasLayer(labelsRef.current)) map.removeLayer(labelsRef.current)
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.9 })
  }, [resetSignal])

  return <div ref={containerRef} className={`map-canvas ${locked ? 'is-locked' : ''}`} />
}

function spawnRipple(map, latlng) {
  const p = map.latLngToContainerPoint(latlng)
  const el = document.createElement('span')
  el.className = 'map-ripple'
  el.style.left = `${p.x}px`
  el.style.top = `${p.y}px`
  map.getContainer().appendChild(el)
  setTimeout(() => el.remove(), 700)
}
