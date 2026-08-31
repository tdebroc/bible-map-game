import { useEffect, useRef } from 'react'

const COLORS = ['#ffd76a', '#7cf7c4', '#7db8ff', '#ff8fd0', '#c59bff', '#ffffff']

export default function Confetti({ burst, intensity = 1 }) {
  const canvasRef = useRef(null)
  const piecesRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const pieces = piecesRef.current
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i]
        p.vy += 0.22
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= 1
        if (p.life <= 0 || p.y > h + 40) {
          pieces.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40))
        ctx.fillStyle = p.color
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (!burst) return
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const count = Math.round(70 * intensity)
    const origins = [
      { x: w * 0.5, y: h * 0.42 },
      { x: 0, y: h * 0.75 },
      { x: w, y: h * 0.75 },
    ]
    origins.forEach((o, idx) => {
      for (let i = 0; i < count / origins.length; i++) {
        const angle = idx === 0 ? Math.random() * Math.PI * 2 : (idx === 1 ? -Math.PI / 3.2 : -Math.PI + Math.PI / 3.2)
        const spread = idx === 0 ? 0 : (Math.random() - 0.5) * 0.7
        const speed = 6 + Math.random() * 11
        piecesRef.current.push({
          x: o.x,
          y: o.y,
          vx: Math.cos(angle + spread) * speed,
          vy: Math.sin(angle + spread) * speed - (idx === 0 ? 3 : 6),
          s: 6 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          life: 90 + Math.random() * 60,
        })
      }
    })
  }, [burst, intensity])

  return <canvas ref={canvasRef} className="confetti-canvas" />
}
