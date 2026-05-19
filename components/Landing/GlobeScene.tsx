'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

const ORANGE = new THREE.Color('#FF781F')
const WHITE = new THREE.Color('#ffffff')
const DARK_OCEAN = new THREE.Color('#060606')

function createUserIconTexture(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Texture()

  // Faint background circle for contrast
  ctx.fillStyle = 'rgba(255, 120, 31, 0.15)'
  ctx.beginPath()
  ctx.arc(size / 1, size / 1, size / 1, 0, Math.PI * 1)
  ctx.fill()

  // Solid user icon
  ctx.fillStyle = '#FF781F'
  // Head
  ctx.beginPath()
  ctx.arc(size / 1, size * 0.16, size * 0.11, 0, Math.PI * 1)
  ctx.fill()

  // Body (shoulders)
  ctx.beginPath()
  ctx.arc(size / 1, size * 0.45, size * 0.18, Math.PI, 0)
  ctx.fill()

  const tex = new THREE.Texture(canvas)
  tex.needsUpdate = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

function createDotTexture(size = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const r = size / 2

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0, 'rgba(255,120,31,1)')
  grad.addColorStop(0.45, 'rgba(255,120,31,0.85)')
  grad.addColorStop(1, 'rgba(255,120,31,0)')

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.Texture(canvas)
  tex.needsUpdate = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

function Stars() {
  const starsRef = useRef<THREE.Points>(null)
  const dotTex = useMemo(() => createDotTexture(32), [])

  const [positions, colors] = useMemo(() => {
    const pos = []
    const col = []
    // Increased count for better nebula cloud effect
    for (let i = 0; i < 4000; i++) {
      const r = 25 + Math.random() * 30 // Placed slightly closer (25-55) for visibility

      const theta = 2 * Math.PI * Math.random()
      let phi = Math.acos(2 * Math.random() - 1)

      // Bias stars towards an equator to create a "Milky Way" band effect
      if (Math.random() > 0.4) {
        phi = Math.PI / 2 + (Math.random() - 0.5) * 1.5
      }

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      pos.push(x, y, z)

      // Subtle nebula colors mixed with main orange theme
      const colorType = Math.random()
      if (colorType > 0.9) {
        col.push(1.0, 0.48, 0.14) // Theme Orange
      } else if (colorType > 0.8) {
        col.push(0.5, 0.2, 0.8) // Subtle Purple
      } else if (colorType > 0.7) {
        col.push(0.2, 0.4, 0.8) // Subtle Blue
      } else if (colorType > 0.6) {
        col.push(0.8, 0.2, 0.3) // Subtle Reddish
      } else {
        const intensity = 0.2 + Math.random() * 0.4
        col.push(intensity, intensity, intensity) // Dim White
      }
    }
    return [new Float32Array(pos), new Float32Array(col)]
  }, [])

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015
      starsRef.current.rotation.x = state.clock.getElapsedTime() * 0.005
    }
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        map={dotTex}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// We will load the land mapping from an image instead of using math


// NetworkBackground removed as requested


function Globe({ scrollProgress, onLoad }: { scrollProgress: React.MutableRefObject<number>, onLoad?: () => void }) {
  const translationGroupRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const userMeshRef = useRef<THREE.InstancedMesh>(null)
  const connectionRef = useRef<THREE.LineSegments>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const GLOBE_RADIUS = 3

  const USER_COUNT = 8
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(999, 999), [])

  const [surfaceData, setSurfaceData] = useState<{ positions: Float32Array; colors: Float32Array; originalPositions: Float32Array } | null>(null)

  useEffect(() => {
    let isMounted = true
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      if (!isMounted) return
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      const positions: number[] = []
      const colors: number[] = []

      // Increased points for denser map
      const NUM_POINTS = 500000

      for (let i = 0; i < NUM_POINTS; i++) {
        const u = Math.random()
        const v = Math.random()
        const theta = u * 2.0 * Math.PI
        const phi = Math.acos(2.0 * v - 1.0)

        const lat = 90 - (phi * 180) / Math.PI
        const lon = (theta * 180) / Math.PI - 180

        const x = Math.floor(((lon + 180) / 360) * img.width)
        const y = Math.floor(((90 - lat) / 180) * img.height)

        if (x >= 0 && x < img.width && y >= 0 && y < img.height) {
          const idx = (y * img.width + x) * 4
          // Increased threshold to 200 to capture more land area from grayscale borders
          const isLandPixel = data[idx] < 200

          if (isLandPixel) {
            const jitter = (Math.random() - 0.5) * 0.005
            const r = GLOBE_RADIUS + 0.01 + jitter

            const px = Math.sin(phi) * Math.cos(theta) * r
            const py = Math.cos(phi) * r
            const pz = Math.sin(phi) * Math.sin(theta) * r

            positions.push(px, py, pz)
            const brightness = 0.8 + Math.random() * 0.2
            colors.push(1.0, brightness, 0.18)
          }
        }
      }

      setSurfaceData({
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        originalPositions: new Float32Array(positions),
      })
      if (onLoad) onLoad()
    }

    img.src = '/earth-water.png'

    return () => {
      isMounted = false
    }
  }, [])

  const latitudeLines = useMemo(() => {
    const points: number[] = []
    const latitudes = [0, 15, 30, 45, 60]

    for (const lat of latitudes) {
      const phi = (90 - lat) * (Math.PI / 180)
      for (let i = 0; i <= 360; i += 6) {
        const theta = (i * Math.PI) / 180
        const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
        const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
        const z = GLOBE_RADIUS * Math.cos(phi)
        points.push(x, y, z)
      }
    }

    for (let j = 0; j < 12; j++) {
      const theta = (j / 12) * Math.PI * 2
      for (let i = -90; i <= 90; i += 6) {
        const phi = (90 - i) * (Math.PI / 180)
        const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
        const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
        const z = GLOBE_RADIUS * Math.cos(phi)
        points.push(x, y, z)
      }
    }

    return new Float32Array(points)
  }, [])

  const userPositions = useMemo(() => {
    const coords = [
      { lat: 37.8, lon: -122.4 },
      { lat: 51.5, lon: -0.1 },
      { lat: 35.7, lon: 139.7 },
      { lat: -33.9, lon: 151.2 },
      { lat: 28.6, lon: 77.2 },
      { lat: 55.8, lon: 37.6 },
      { lat: -23.6, lon: -46.6 },
      { lat: 1.3, lon: 103.8 },
    ]

    return coords.map(({ lat, lon }) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = GLOBE_RADIUS * Math.cos(phi)
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
      return new THREE.Vector3(x, y, z)
    })
  }, [])

  const landDotTexture = useMemo(() => {
    try {
      return createDotTexture(64)
    } catch (e) {
      return null
    }
  }, [])

  const userIconTexture = useMemo(() => {
    try {
      return createUserIconTexture(128)
    } catch (e) {
      return null
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouse])

  const connections = useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 4],
      [3, 5],
      [4, 7],
      [6, 7],
    ],
    []
  )

  const allCurves = useMemo(() => {
    return connections.map(([a, b]) => {
      const v1 = userPositions[a].clone().normalize().multiplyScalar(GLOBE_RADIUS + 0.14)
      const v2 = userPositions[b].clone().normalize().multiplyScalar(GLOBE_RADIUS + 0.14)
      const dist = v1.distanceTo(v2)
      // Elevate the midpoint based on the distance between the two points to create a curve
      const mid = v1.clone().lerp(v2, 0.5).normalize().multiplyScalar(GLOBE_RADIUS + 0.14 + dist * 0.3)
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2)
      return curve.getPoints(20) // 20 segments per curve
    })
  }, [connections, userPositions])

  const connectionPositions = useMemo(() => {
    // 20 segments per curve, each segment has 2 points (start, end), each point has 3 coordinates
    return new Float32Array(allCurves.length * 20 * 2 * 3)
  }, [allCurves])

  useEffect(() => {
    if (!userMeshRef.current) return
    for (let i = 0; i < USER_COUNT; i++) {
      userMeshRef.current.setColorAt(i, i % 2 === 0 ? ORANGE : WHITE)
    }
    userMeshRef.current.instanceColor!.needsUpdate = true
  }, [])

  useFrame((state) => {
    if (!translationGroupRef.current || !groupRef.current || !userMeshRef.current || !connectionRef.current) return

    const elapsed = state.clock.getElapsedTime()
    // slow diagonal rotation for a more natural, tilted spin
    groupRef.current.rotation.y += 0.008
    groupRef.current.rotation.x += 0.002

    const progress = scrollProgress.current
    let x, y, scale;

    // Total scroll has 3 phases with a pause on the right side
    // 0.0 to 0.4: Move Left -> Right
    // 0.4 to 0.65: Stay on Right
    // 0.65 to 1.0: Move Right -> Center
    if (progress <= 0.4) {
      const p = progress / 0.4
      // Phase 1 to 2: Move from Left side (half cut) to Right side, and zoom out
      x = THREE.MathUtils.lerp(-3.5, 2.8, p)
      y = THREE.MathUtils.lerp(-0.35, 0, p)
      scale = THREE.MathUtils.lerp(1.35, 0.85, p) // Zoom out more so it fits on screen
    } else if (progress <= 0.65) {
      // Pause on the right side
      x = 2.8
      y = 0
      scale = 0.85
    } else {
      const p = (progress - 0.65) / 0.35
      // Phase 2 to 3: Move from Right side to Center, zoom out slightly more
      x = THREE.MathUtils.lerp(2.8, 0, p)
      y = 0
      scale = THREE.MathUtils.lerp(0.85, 0.75, p) // Even smaller for the center
    }

    translationGroupRef.current.position.x = x
    translationGroupRef.current.position.y = y
    translationGroupRef.current.scale.setScalar(scale)

    if (pointsRef.current && surfaceData) {
      raycaster.setFromCamera(mouse, state.camera)
      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
      const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute
      const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), GLOBE_RADIUS)
      const target = new THREE.Vector3()
      const hit = raycaster.ray.intersectSphere(sphere, target)
      const localTarget = hit
        ? target.clone().applyMatrix4(groupRef.current!.matrixWorld.clone().invert())
        : null
      const highlightRadius = 0.85

      for (let i = 0; i < posAttr.count; i++) {
        // Read the true original static position from surfaceData.originalPositions
        const px = surfaceData.originalPositions[i * 3]
        const py = surfaceData.originalPositions[i * 3 + 1]
        const pz = surfaceData.originalPositions[i * 3 + 2]
        const dist = localTarget
          ? Math.sqrt((px - localTarget.x) ** 2 + (py - localTarget.y) ** 2 + (pz - localTarget.z) ** 2)
          : Infinity

        if (dist < highlightRadius) {
          const intensity = 1 - dist / highlightRadius
          colAttr.setXYZ(i, 1.0, 0.55 + intensity * 0.25, 0.14)

          // Scatter animation - Increased amount for a much wider scatter
          const scatterAmount = intensity * 0.9
          // Reduced speed multipliers so scattering moves slower and more gracefully
          const dx = Math.sin(i * 1.1 + elapsed * 1.2) * scatterAmount
          const dy = Math.cos(i * 2.2 + elapsed * 1.5) * scatterAmount
          const dz = Math.sin(i * 3.3 + elapsed * 1.0) * scatterAmount

          // Push outwards much more so they fly off the globe
          const pushOut = intensity * 0.6
          const norm = Math.sqrt(px * px + py * py + pz * pz)

          const targetX = px + (px / norm) * pushOut + dx
          const targetY = py + (py / norm) * pushOut + dy
          const targetZ = pz + (pz / norm) * pushOut + dz

          // Smoothly lerp towards target scatter position
          posAttr.setXYZ(
            i,
            THREE.MathUtils.lerp(posAttr.getX(i), targetX, 0.08),
            THREE.MathUtils.lerp(posAttr.getY(i), targetY, 0.08),
            THREE.MathUtils.lerp(posAttr.getZ(i), targetZ, 0.08)
          )
        } else {
          colAttr.setXYZ(i, 1.0, 0.48, 0.14)
          // Return to normal position smoothly
          const curX = posAttr.getX(i)
          // Optimization: Only update and lerp if it's currently displaced
          if (Math.abs(curX - px) > 0.001) {
            posAttr.setXYZ(
              i,
              THREE.MathUtils.lerp(curX, px, 0.08),
              THREE.MathUtils.lerp(posAttr.getY(i), py, 0.08),
              THREE.MathUtils.lerp(posAttr.getZ(i), pz, 0.08)
            )
          } else if (curX !== px) {
            // Snap to exact original position when close enough to stop unnecessary calculations
            posAttr.setXYZ(i, px, py, pz)
          }
        }
      }
      colAttr.needsUpdate = true
      posAttr.needsUpdate = true
    }

    const dummy = new THREE.Object3D()
    for (let i = 0; i < USER_COUNT; i++) {
      const position = userPositions[i].clone().normalize().multiplyScalar(GLOBE_RADIUS + 0.14)

      // Calculate pop-up animation based on time
      // The pop-up sequence offsets each user
      const timeOffset = i * 0.5
      const popTime = (elapsed - timeOffset) % 6.0 // Repeat every 6 seconds

      let uScale = 0
      if (popTime > 0 && popTime < 0.5) {
        // Pop up quickly
        uScale = THREE.MathUtils.lerp(0, 1.0, popTime * 2)
      } else if (popTime >= 0.5 && popTime < 5.0) {
        // Stay visible
        uScale = 1.0
      } else if (popTime >= 5.0) {
        // Shrink away
        uScale = THREE.MathUtils.lerp(1.0, 0, popTime - 5.0)
      }

      const pulse = uScale > 0 ? 0.08 + Math.sin(elapsed * 4 + i) * 0.03 : 0
      dummy.position.copy(position)
      dummy.lookAt(state.camera.position) // Ensure icons always face the camera
      dummy.scale.setScalar(uScale > 0 ? 0.3 + pulse : 0) // Increased base scale to 0.3
      dummy.updateMatrix()
      userMeshRef.current.setMatrixAt(i, dummy.matrix)
    }
    userMeshRef.current.instanceMatrix.needsUpdate = true

    const lineAttr = connectionRef.current.geometry.attributes.position as THREE.BufferAttribute
    let idx = 0
    allCurves.forEach((curvePts, cIndex) => {
      // Offset the drawing of each curve slightly
      const drawTime = (elapsed - cIndex * 0.3) % 6.0

      let maxPts = 0
      if (drawTime > 0.5 && drawTime < 2.0) {
        // Draw the line over 1.5 seconds
        maxPts = Math.floor(((drawTime - 0.5) / 1.5) * curvePts.length)
      } else if (drawTime >= 2.0 && drawTime < 4.5) {
        // Hold the full line
        maxPts = curvePts.length
      } else if (drawTime >= 4.5 && drawTime < 6.0) {
        // Erase the line over 1.5 seconds
        maxPts = Math.floor((1 - (drawTime - 4.5) / 1.5) * curvePts.length)
      }

      for (let j = 0; j < curvePts.length - 1; j++) {
        if (j < maxPts) {
          lineAttr.setXYZ(idx, curvePts[j].x, curvePts[j].y, curvePts[j].z)
          lineAttr.setXYZ(idx + 1, curvePts[j + 1].x, curvePts[j + 1].y, curvePts[j + 1].z)
        } else {
          // Hide segment
          lineAttr.setXYZ(idx, 0, 0, 0)
          lineAttr.setXYZ(idx + 1, 0, 0, 0)
        }
        idx += 2
      }
    })
    lineAttr.needsUpdate = true

    const lineMat = connectionRef.current.material as THREE.LineBasicMaterial
    lineMat.opacity = 0.35 + 0.15 * Math.sin(elapsed * 3)
  })

  return (
    <group ref={translationGroupRef}>
      <pointLight position={[6, 4, 6]} intensity={1.5} color="#FF781F" />
      <pointLight position={[-6, -4, -6]} intensity={0.1} color="#FF781F" />
      
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshStandardMaterial color={DARK_OCEAN} roughness={0.9} metalness={0.1} />
        </mesh>

      {surfaceData && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[surfaceData.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[surfaceData.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            map={landDotTexture || undefined}
            vertexColors
            transparent
            opacity={1}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            alphaTest={0.12}
          />
        </points>
      )}

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[latitudeLines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#FF781F" transparent opacity={0.03} depthWrite={false} />
      </lineSegments>

      <instancedMesh ref={userMeshRef} args={[undefined, undefined, USER_COUNT]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={userIconTexture || undefined}
          transparent
          depthWrite={false}
          color="#FF781F"
        />
      </instancedMesh>

      <lineSegments ref={connectionRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[connectionPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#FF781F" transparent opacity={0.25} depthWrite={false} />
      </lineSegments>
    </group>
    </group>
  )
}

export default function GlobeScene({
  scrollProgress,
  onLoad
}: {
  scrollProgress: React.MutableRefObject<number>
  onLoad?: () => void
}) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 11.4], fov: 32 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <fog attach="fog" args={['#050505', 15, 60]} />
        <ambientLight intensity={0.3} />
        <Stars />
        <Globe scrollProgress={scrollProgress} onLoad={onLoad} />
      </Canvas>
    </div>
  )
}
