import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
// 1. Import your quotes array cleanly
import { selfCareQuotes } from '../data/quotes' 

// 2. Renamed to avoid name collision with the imported array
function getQuoteOfTheDay() {
  if (!selfCareQuotes || selfCareQuotes.length === 0) {
    return 'Welcome to the Borderland' // Fallback text
  }
  
  const today = new Date()
  // Generates a unique number per day to use as an array index
  const daySeed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate()
  const quoteIndex = daySeed % selfCareQuotes.length
  
  return selfCareQuotes[quoteIndex]
}

// 3. Call the newly renamed function safely
const TEXT = getQuoteOfTheDay()

const PARTICLE_STEP = 2
const BRUSH_RADIUS = 60
const REPEL_STRENGTH = 9
const RETURN_SPRING = 0.09
const RETURN_FRICTION = 0.8
const CANVAS_PADDING = 40
const FONT_FAMILY = '"Arial Black", Arial, sans-serif'
const FONT_WEIGHT = 900
const ALPHA_THRESHOLD = 90
const HOME_SNAP_DISTANCE = 1

function getFontSize(logicalWidth) {
  return Math.min(Math.max(logicalWidth * 0.05, 24), 52)
}

function buildFont(logicalWidth) {
  return `${FONT_WEIGHT} ${getFontSize(logicalWidth)}px ${FONT_FAMILY}`
}

function mixColor(channelA, channelB, amount) {
  return Math.round(channelA + (channelB - channelA) * amount)
}

function particleColor(normalizedX) {
  const red = [255, 210, 210]
  const purple = [210, 160, 255]
  return {
    r: mixColor(red[0], purple[0], normalizedX),
    g: mixColor(red[1], purple[1], normalizedX),
    b: mixColor(red[2], purple[2], normalizedX),
  }
}

// Completely re-written layout splitter to handle every character cleanly
function getWrappedLines(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const testLine = currentLine ? currentLine + ' ' + word : word
    const width = ctx.measureText(testLine).width
    
    if (width < maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

function createParticle(homeX, homeY, size, color) {
  const particle = {
    homeX,
    homeY,
    x: homeX,
    y: homeY,
    vx: 0,
    vy: 0,
    size,
    ...color,
    snapToHome() {
      this.x = this.homeX
      this.y = this.homeY
      this.vx = 0
      this.vy = 0
    },
    isAtHome(dpr) {
      return (
        Math.hypot(this.homeX - this.x, this.homeY - this.y) <
        HOME_SNAP_DISTANCE * dpr
      )
    },
  }

  particle.snapToHome()
  return particle
}

function createParticlesFromText(logicalWidth, logicalHeight, text, dpr) {
  const canvasWidth = Math.floor(logicalWidth * dpr)
  const canvasHeight = Math.floor(logicalHeight * dpr)
  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = canvasWidth
  sampleCanvas.height = canvasHeight
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })

  if (!sampleCtx) {
    return []
  }

  sampleCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  sampleCtx.clearRect(0, 0, logicalWidth, logicalHeight)
  sampleCtx.fillStyle = '#ffffff'
  
  const fontSize = getFontSize(logicalWidth)
  const fontSpec = buildFont(logicalWidth)
  sampleCtx.font = fontSpec
  sampleCtx.textBaseline = 'middle'

  // Reserve explicit layout space margins inside the bounding area
  const maxTextWidth = Math.max(logicalWidth - 160, 200)
  
  sampleCtx.textAlign = 'left'
  const lines = getWrappedLines(sampleCtx, text, maxTextWidth)
  
  let maxLineWidth = 0
  lines.forEach(line => {
    const w = sampleCtx.measureText(line).width
    if (w > maxLineWidth) maxLineWidth = w
  })

  const lineHeight = fontSize * 1.3
  const totalTextHeight = lines.length * lineHeight
  const startY = (logicalHeight - totalTextHeight) / 2 + lineHeight / 2
  
  const globalStartX = (logicalWidth - maxLineWidth) / 2

  lines.forEach((line, index) => {
    const currentLineWidth = sampleCtx.measureText(line).width
    const lineOffsetX = (maxLineWidth - currentLineWidth) / 2
    sampleCtx.fillText(line, globalStartX + lineOffsetX, startY + index * lineHeight)
  })

  const imageData = sampleCtx.getImageData(0, 0, canvasWidth, canvasHeight).data
  const particles = []

  for (let y = 0; y < canvasHeight; y += PARTICLE_STEP) {
    for (let x = 0; x < canvasWidth; x += PARTICLE_STEP) {
      const alpha = imageData[(y * canvasWidth + x) * 4 + 3]
      if (alpha < ALPHA_THRESHOLD) {
        continue
      }

      particles.push(
        createParticle(
          x,
          y,
          0.55 + Math.random() * 0.25,
          particleColor(x / canvasWidth),
        ),
      )
    }
  }

  return particles
}

function measureCanvasSize(containerWidth, text) {
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')

  if (!measureCtx) {
    return { width: 860, height: 170 }
  }

  const maxWidth = Math.min(containerWidth - 32, 980)
  const fontSize = getFontSize(maxWidth)
  measureCtx.font = buildFont(maxWidth)
  measureCtx.textAlign = 'left'

  const maxTextWidth = Math.max(maxWidth - 160, 200)
  const lines = getWrappedLines(measureCtx, text, maxTextWidth)
  
  let longestLineWidth = 0
  lines.forEach(line => {
    const lineWidth = measureCtx.measureText(line).width
    if (lineWidth > longestLineWidth) {
      longestLineWidth = lineWidth
    }
  })

  const lineHeight = fontSize * 1.3
  const calculatedHeight = Math.ceil(lines.length * lineHeight + CANVAS_PADDING * 2)

  return {
    width: Math.ceil(longestLineWidth + 160),
    height: calculatedHeight < 140 ? 170 : calculatedHeight,
  }
}

function drawParticle(ctx, particle, dpr) {
  const displaced = !particle.isAtHome(dpr)

  ctx.save()

  if (displaced) {
    ctx.shadowBlur = 3 * dpr
    ctx.shadowColor = `rgba(${particle.r}, ${particle.g}, ${particle.b}, 0.55)`
  } else {
    ctx.shadowBlur = 0
  }

  ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, 1)`
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size * dpr, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function updateParticle(particle, mouse, dpr) {
  const snapDistance = HOME_SNAP_DISTANCE * dpr
  const brushRadius = BRUSH_RADIUS * dpr
  const homeDx = particle.homeX - particle.x
  const homeDy = particle.homeY - particle.y
  const homeDistance = Math.hypot(homeDx, homeDy)

  const brushDx = particle.homeX - mouse.x
  const brushDy = particle.homeY - mouse.y
  const brushDistance = Math.hypot(brushDx, brushDy)
  const inBrush = mouse.active && brushDistance < brushRadius

  if (inBrush) {
    const pushX = particle.x - mouse.x
    const pushY = particle.y - mouse.y
    const pushDistance = Math.max(Math.hypot(pushX, pushY), 0.001)
    const influence = 1 - brushDistance / brushRadius
    const repel = REPEL_STRENGTH * dpr * influence * influence

    particle.vx += (pushX / pushDistance) * repel
    particle.vy += (pushY / pushDistance) * repel

    particle.vx += homeDx * RETURN_SPRING * 0.12
    particle.vy += homeDy * RETURN_SPRING * 0.12
    particle.vx *= RETURN_FRICTION
    particle.vy *= RETURN_FRICTION
    particle.x += particle.vx
    particle.y += particle.vy
    return
  }

  if (homeDistance > snapDistance) {
    particle.vx += homeDx * RETURN_SPRING
    particle.vy += homeDy * RETURN_SPRING
    particle.vx *= RETURN_FRICTION
    particle.vy *= RETURN_FRICTION
    particle.x += particle.vx
    particle.y += particle.vy
    return
  }

  particle.snapToHome()
}

function LoadingScreen({ onInitialize }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const animationRef = useRef(0)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })

  const updateMouseFromEvent = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    mouseRef.current = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
      active: true,
    }
  }, [])

  const setupCanvas = useCallback(async () => {
    const container = containerRef.current
    const canvas = canvasRef.current

    if (!container || !canvas) {
      return
    }

    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 350))
      ])
    } catch (e) {}

    const layoutWidth = container.clientWidth || window.innerWidth || 860
    const { width, height } = measureCanvasSize(layoutWidth, TEXT)
    const dpr = window.devicePixelRatio || 1

    sizeRef.current = { width, height, dpr }

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const particles = createParticlesFromText(width, height, TEXT, dpr)
    particles.forEach((particle) => particle.snapToHome())
    particlesRef.current = particles

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i += 1) {
        drawParticle(ctx, particles[i], dpr)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const animate = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const { dpr } = sizeRef.current

      if (!canvas || !ctx || particles.length === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i]
        updateParticle(particle, mouse, dpr)
        drawParticle(ctx, particle, dpr)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const boot = async () => {
      await setupCanvas()
      if (mounted) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    boot()

    const container = containerRef.current
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && container
        ? new ResizeObserver(() => {
            setupCanvas()
          })
        : null

    resizeObserver?.observe(container)

    return () => {
      mounted = false
      cancelAnimationFrame(animationRef.current)
      resizeObserver?.disconnect()
    }
  }, [setupCanvas])

  const handlePointerDown = useCallback(
    (event) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      updateMouseFromEvent(event)
    },
    [updateMouseFromEvent],
  )

  const handlePointerUp = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const handlePointerMove = useCallback(
    (event) => {
      updateMouseFromEvent(event)
    },
    [updateMouseFromEvent],
  )

  const handlePointerEnter = useCallback(
    (event) => {
      updateMouseFromEvent(event)
    },
    [updateMouseFromEvent],
  )

  const handlePointerLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0, active: false }
  }, [])

  return (
    <section className="relative isolate flex min-h-[calc(100dvh-4.5rem)] w-full items-center justify-center overflow-hidden bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-red-950/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-purple-950/35 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-red-900/10 blur-[80px]"
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 px-4 sm:px-6">
        <div
          ref={containerRef}
          className="relative flex w-full items-center justify-center"
        >
          <p className="sr-only">{TEXT}</p>
          <canvas
            ref={canvasRef}
            className="max-w-full cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            aria-hidden
          />
        </div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onInitialize}
          className="group relative overflow-hidden rounded-sm border border-red-900/60 bg-black/40 px-8 py-3 text-sm font-medium uppercase tracking-[0.35em] text-red-100/90 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/70 hover:text-white hover:shadow-[0_0_30px_rgba(147,51,234,0.45),0_0_60px_rgba(127,29,29,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500/80"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-red-950/0 via-purple-900/30 to-red-950/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="relative">Initialize System</span>
        </motion.button>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent"
      />
    </section>
  )
}

export default LoadingScreen