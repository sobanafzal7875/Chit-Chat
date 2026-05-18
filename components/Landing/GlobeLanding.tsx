// 'use client';

// import { useEffect, useRef, useState } from 'react';

// /**
//  * GlobeLanding — Drop-in Next.js landing component
//  *
//  * Usage:
//  *   import GlobeLanding from '@/components/GlobeLanding';
//  *   export default function Page() { return <GlobeLanding />; }
//  *
//  * Dependencies (add to package.json):
//  *   three  (npm install three)
//  */

// export default function GlobeLanding() {
//   const canvasRef = useRef(null);
//   const [textVisible, setTextVisible] = useState(false);

//   useEffect(() => {
//     let animId: number;
//     let THREE: any;

//     async function init() {
//       THREE = (await import('three')).default ?? (await import('three'));

//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       /* ── Renderer ── */
//       const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       renderer.setSize(window.innerWidth, window.innerHeight);

//       /* ── Scene & Camera ── */
//       const scene = new THREE.Scene();
//       const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
//       camera.position.set(0, 0, 3.5);

//       /* ── Lights ── */
//       scene.add(new THREE.AmbientLight(0xffffff, 0.12));
//       const keyLight = new THREE.PointLight(0xFF6B35, 3.5, 12);
//       keyLight.position.set(3, 2, 3);
//       scene.add(keyLight);
//       const fillLight = new THREE.PointLight(0xFF9A6C, 1.5, 12);
//       fillLight.position.set(-3, -1, -2);
//       scene.add(fillLight);

//       /* ── Dot Texture (continents) ── */
//       function makeDotTexture() {
//         const size = 2048;
//         const c = document.createElement('canvas');
//         c.width = c.height = size;
//         const ctx = c.getContext('2d');
//         ctx.fillStyle = '#080604';
//         ctx.fillRect(0, 0, size, size);

//         const regions = [
//           { cx: 0.22, cy: 0.30, rx: 0.12, ry: 0.14, d: 0.72 }, // North America
//           { cx: 0.28, cy: 0.58, rx: 0.07, ry: 0.13, d: 0.68 }, // South America
//           { cx: 0.52, cy: 0.27, rx: 0.06, ry: 0.07, d: 0.82 }, // Europe
//           { cx: 0.53, cy: 0.50, rx: 0.08, ry: 0.14, d: 0.72 }, // Africa
//           { cx: 0.68, cy: 0.30, rx: 0.16, ry: 0.12, d: 0.74 }, // Asia
//           { cx: 0.78, cy: 0.62, rx: 0.07, ry: 0.05, d: 0.62 }, // Oceania
//           { cx: 0.28, cy: 0.17, rx: 0.05, ry: 0.06, d: 0.55 }, // Greenland
//         ];

//         /* Smaller dots, more of them */
//         const dotR = 1.6;
//         const step = 7;

//         for (let px = 0; px < size; px += step) {
//           for (let py = 0; py < size; py += step) {
//             const u = px / size, v = py / size;
//             let density = 0.06;
//             for (const r of regions) {
//               const dx = (u - r.cx) / r.rx, dy = (v - r.cy) / r.ry;
//               const d2 = dx * dx + dy * dy;
//               if (d2 < 1) density = Math.max(density, r.d * (1 - d2 * 0.4));
//             }
//             if (Math.random() < density) {
//               const alpha = 0.35 + density * 0.6;
//               ctx.fillStyle = `rgba(210,110,50,${alpha})`;
//               ctx.beginPath();
//               ctx.arc(px, py, dotR, 0, Math.PI * 2);
//               ctx.fill();
//             }
//           }
//         }
//         return new THREE.CanvasTexture(c);
//       }

//       const dotTex = makeDotTexture();

//       /* ── Globe Mesh ── */
//       const geo = new THREE.SphereGeometry(1, 64, 64);
//       const mat = new THREE.MeshPhongMaterial({
//         map: dotTex,
//         emissiveMap: dotTex,
//         emissive: new THREE.Color(0xFF6B35),
//         emissiveIntensity: 0.28,
//         shininess: 6,
//         transparent: true,
//         opacity: 0.93,
//       });
//       const globe = new THREE.Mesh(geo, mat);

//       /* ── Atmosphere ── */
//       const atmGeo = new THREE.SphereGeometry(1.065, 64, 64);
//       const atmMat = new THREE.ShaderMaterial({
//         uniforms: {},
//         vertexShader: `varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
//         fragmentShader: `varying vec3 vN;void main(){float f=pow(0.68-dot(vN,vec3(0,0,1.)),3.);gl_FragColor=vec4(1.,.38,.15,f*.65);}`,
//         side: THREE.FrontSide, transparent: true,
//         blending: THREE.AdditiveBlending, depthWrite: false,
//       });
//       const atm = new THREE.Mesh(atmGeo, atmMat);

//       const innerGeo = new THREE.SphereGeometry(1.02, 64, 64);
//       const innerMat = new THREE.ShaderMaterial({
//         uniforms: {},
//         vertexShader: `varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
//         fragmentShader: `varying vec3 vN;void main(){float f=pow(1.-dot(vN,vec3(0,0,1.)),2.5);gl_FragColor=vec4(1.,.28,.04,f*.2);}`,
//         side: THREE.BackSide, transparent: true,
//         blending: THREE.AdditiveBlending, depthWrite: false,
//       });
//       const inner = new THREE.Mesh(innerGeo, innerMat);

//       /* ── User Pins ── */
//       const userPositions = [
//         { lat: 51.5,  lon: -0.1  }, // London
//         { lat: 40.7,  lon: -74.0 }, // New York
//         { lat: 35.7,  lon: 139.7 }, // Tokyo
//         { lat: -33.9, lon: 18.4  }, // Cape Town
//         { lat: 48.8,  lon: 2.3   }, // Paris
//         { lat: 28.6,  lon: 77.2  }, // Delhi
//         { lat: -23.5, lon: -46.6 }, // São Paulo
//         { lat: 55.7,  lon: 37.6  }, // Moscow
//         { lat: 1.3,   lon: 103.8 }, // Singapore
//         { lat: 19.4,  lon: -99.1 }, // Mexico City
//         { lat: -37.8, lon: 144.9 }, // Melbourne
//         { lat: 30.0,  lon: 31.2  }, // Cairo
//         { lat: 37.5,  lon: 127.0 }, // Seoul
//         { lat: 25.2,  lon: 55.3  }, // Dubai
//         { lat: 41.0,  lon: 29.0  }, // Istanbul
//       ];

//       function latLonToVec3(lat, lon, r) {
//         const phi = (90 - lat) * Math.PI / 180;
//         const theta = (lon + 180) * Math.PI / 180;
//         return new THREE.Vector3(
//           -r * Math.sin(phi) * Math.cos(theta),
//           r * Math.cos(phi),
//           r * Math.sin(phi) * Math.sin(theta)
//         );
//       }

//       const pinGroup = new THREE.Group();
//       const pinCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
//       const pinCoreGeo = new THREE.SphereGeometry(0.012, 8, 8);

//       const pins = userPositions.map(p => {
//         const pos = latLonToVec3(p.lat, p.lon, 1.022);
//         const core = new THREE.Mesh(pinCoreGeo, pinCoreMat.clone());
//         core.position.copy(pos);

//         const glowMat = new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0 });
//         const glowGeo = new THREE.SphereGeometry(0.024, 8, 8);
//         const glow = new THREE.Mesh(glowGeo, glowMat);
//         glow.position.copy(pos);

//         const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xFF8C55, transparent: true, opacity: 0, side: THREE.DoubleSide });
//         const ring1Geo = new THREE.RingGeometry(0.026, 0.030, 16);
//         const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
//         ring1.position.copy(pos);
//         ring1.lookAt(pos.clone().multiplyScalar(2));

//         pinGroup.add(core, glow, ring1);
//         return { core, glow, ring1, pos, active: false };
//       });

//       /* ── Connection Arcs ── */
//       const lineGroup = new THREE.Group();
//       const connPairs = [
//         [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],
//         [6,7],[7,8],[0,8],[1,5],[2,9],[3,10],
//         [4,11],[8,12],[9,13],[10,14],[0,13],[2,14],
//       ];

//       function makeArc(from, to) {
//         const mid = from.clone().add(to).normalize().multiplyScalar(1.38);
//         const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
//         const pts = curve.getPoints(80);
//         const bGeo = new THREE.BufferGeometry().setFromPoints(pts);
//         const bMat = new THREE.LineBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0 });
//         const line = new THREE.Line(bGeo, bMat);
//         lineGroup.add(line);
//         return { line, opacity: 0, target: 0 };
//       }

//       const connections = connPairs.map(([a, b]) =>
//         makeArc(
//           latLonToVec3(userPositions[a].lat, userPositions[a].lon, 1.022),
//           latLonToVec3(userPositions[b].lat, userPositions[b].lon, 1.022)
//         )
//       );

//       /* ── Globe Group ── */
//       const globeGroup = new THREE.Group();
//       globeGroup.add(globe, atm, inner, pinGroup, lineGroup);
//       scene.add(globeGroup);

//       /* ── State ── */
//       let phase = 'spin'; // spin → users → connect → interact
//       let phaseTimer = 0;
//       let usersRevealed = false;
//       let connectionsRevealed = false;
//       let scrollY = 0;

//       let globeScale = 1.9;
//       let globeX = 0;
//       let globeTargetScale = 1.9;
//       let globeTargetX = 0;

//       let baseRotY = 0;
//       let mouseX = 0;
//       let mouseY = 0;
//       let targetRotX = 0;
//       let targetRotY = 0;

//       /* Scroll → animate earth to right, show text when settled */
//       const handleScroll = () => {
//         scrollY = window.scrollY;
//         const maxS = window.innerHeight;
//         const t = Math.min(scrollY / maxS, 1);
//         globeTargetScale = 1.9 - t * 0.92; // 1.9 → ~0.98
//         globeTargetX = t * 4.2;             // shifts right
//         if (t > 0.65) setTextVisible(true);
//         else setTextVisible(false);
//       };

//       const handleMouseMove = (e) => {
//         mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
//         mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
//       };

//       window.addEventListener('scroll', handleScroll);
//       window.addEventListener('mousemove', handleMouseMove);

//       let lastTime = performance.now();
//       let elapsed = 0;

//       function animate() {
//         animId = requestAnimationFrame(animate);
//         const now = performance.now();
//         const dt = (now - lastTime) / 1000;
//         lastTime = now;
//         elapsed += dt;
//         phaseTimer += dt;

//         /* Phase transitions */
//         if (phase === 'spin' && phaseTimer > 2.0) {
//           phase = 'users'; phaseTimer = 0;
//         }
//         if (phase === 'users' && phaseTimer > 0.8 && !usersRevealed) {
//           usersRevealed = true;
//           pins.forEach((p, i) => setTimeout(() => { p.active = true; }, i * 150));
//           setTimeout(() => { phase = 'connect'; phaseTimer = 0; }, pins.length * 150 + 500);
//         }
//         if (phase === 'connect' && !connectionsRevealed) {
//           connectionsRevealed = true;
//           connections.forEach((c, i) => setTimeout(() => { c.target = 0.65; }, i * 160));
//           setTimeout(() => { phase = 'interact'; }, connections.length * 160 + 600);
//         }

//         /* Smooth lerp globe position & scale */
//         globeScale += (globeTargetScale - globeScale) * 0.055;
//         globeX += (globeTargetX - globeX) * 0.055;
//         globeGroup.scale.setScalar(globeScale);
//         // Offset so centered initially; shifts right on scroll
//         globeGroup.position.x = globeX - 0.8;

//         /* Rotation — mouse side influence in interact phase */
//         baseRotY += 0.0012;
//         if (phase === 'interact' || phase === 'connect') {
//           // Detect which side mouse is on
//           const side = mouseX > 0 ? 1 : -1;
//           const speedBoost = Math.abs(mouseX) * 1.8;
//           targetRotY = baseRotY + side * speedBoost * dt * 3;
//           baseRotY = targetRotY;
//           targetRotX = mouseY * 0.18;
//         } else {
//           targetRotY = baseRotY;
//           targetRotX *= 0.95;
//         }

//         globe.rotation.y += (targetRotY - globe.rotation.y) * 0.05;
//         globe.rotation.x += (targetRotX - globe.rotation.x) * 0.05;
//         atm.rotation.y = globe.rotation.y;
//         atm.rotation.x = globe.rotation.x;
//         inner.rotation.y = globe.rotation.y;
//         inner.rotation.x = globe.rotation.x;
//         pinGroup.rotation.y = globe.rotation.y;
//         pinGroup.rotation.x = globe.rotation.x;
//         lineGroup.rotation.y = globe.rotation.y;
//         lineGroup.rotation.x = globe.rotation.x;

//         /* Animate pins */
//         pins.forEach((p, i) => {
//           const targetO = p.active ? 1 : 0;
//           p.core.material.opacity += (targetO - p.core.material.opacity) * 0.08;
//           p.glow.material.opacity += (targetO * (0.18 + 0.12 * Math.sin(elapsed * 2.2 + i)) - p.glow.material.opacity) * 0.08;
//           p.ring1.material.opacity += (targetO * (0.4 + 0.3 * Math.sin(elapsed * 1.8 + i * 0.7)) - p.ring1.material.opacity) * 0.08;
//           if (p.active) {
//             const s = 1 + 0.25 * Math.sin(elapsed * 2.5 + i);
//             p.glow.scale.setScalar(s);
//             p.ring1.scale.setScalar(1 + 0.4 * Math.sin(elapsed * 1.5 + i));
//           }
//         });

//         /* Animate connections */
//         connections.forEach(c => {
//           c.opacity += (c.target - c.opacity) * 0.04;
//           c.line.material.opacity = c.opacity;
//         });

//         renderer.render(scene, camera);
//       }

//       animate();

//       const handleResize = () => {
//         camera.aspect = window.innerWidth / window.innerHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(window.innerWidth, window.innerHeight);
//       };
//       window.addEventListener('resize', handleResize);

//       return () => {
//         window.removeEventListener('scroll', handleScroll);
//         window.removeEventListener('mousemove', handleMouseMove);
//         window.removeEventListener('resize', handleResize);
//         cancelAnimationFrame(animId);
//         renderer.dispose();
//       };
//     }

//     const cleanup = init();
//     return () => { cleanup.then(fn => fn && fn()); };
//   }, []);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

//         :root {
//           --orange: #FF6B35;
//           --orange-light: #FF9A6C;
//           --orange-dim: rgba(255,107,53,0.25);
//           --white: #F5F0E8;
//           --bg: #090704;
//           --glass: rgba(255,255,255,0.04);
//           --glass-border: rgba(255,255,255,0.08);
//         }

//         .gl-root {
//           background: radial-gradient(ellipse at 60% 40%, #1a0c04 0%, #090704 60%);
//           min-height: 200vh;
//           color: var(--white);
//           font-family: 'DM Sans', sans-serif;
//           overflow-x: hidden;
//           position: relative;
//         }

//         /* NAV */
//         .gl-nav {
//           position: fixed; top: 0; left: 0; right: 0; z-index: 100;
//           padding: 20px 48px;
//           display: flex; align-items: center; justify-content: space-between;
//           background: linear-gradient(to bottom, rgba(9,7,4,0.88), transparent);
//           backdrop-filter: blur(2px);
//         }
//         .gl-logo {
//           font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
//           letter-spacing: -0.5px;
//           background: linear-gradient(135deg, var(--white), var(--orange));
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .gl-nav-links { display: flex; gap: 32px; align-items: center; }
//         .gl-nav-links a {
//           color: rgba(245,240,232,0.55); font-size: 14px; text-decoration: none;
//           letter-spacing: 0.3px; transition: color 0.2s;
//         }
//         .gl-nav-links a:hover { color: var(--white); }
//         .gl-nav-cta {
//           padding: 10px 24px;
//           background: transparent; border: 1px solid rgba(255,107,53,0.35);
//           color: var(--orange-light); border-radius: 100px; font-size: 14px;
//           cursor: pointer; font-family: 'DM Sans', sans-serif;
//           transition: all 0.2s;
//         }
//         .gl-nav-cta:hover { background: rgba(255,107,53,0.08); border-color: var(--orange); }

//         /* HERO SECTION */
//         .gl-hero {
//           position: sticky; top: 0; height: 100vh;
//           display: flex; align-items: center;
//           overflow: hidden;
//         }

//         .gl-canvas {
//           position: absolute; inset: 0; width: 100%; height: 100%;
//         }

//         /* LEFT TEXT — fades in after earth settles */
//         .gl-hero-text {
//           position: relative; z-index: 10;
//           max-width: 460px;
//           margin-left: 7vw;
//           opacity: 0;
//           transform: translateX(-32px);
//           transition: opacity 0.9s ease, transform 0.9s ease;
//           pointer-events: none;
//         }
//         .gl-hero-text.visible {
//           opacity: 1; transform: translateX(0); pointer-events: all;
//         }

//         .gl-badge {
//           display: inline-flex; align-items: center; gap: 8px;
//           padding: 6px 16px;
//           background: var(--glass);
//           border: 1px solid var(--glass-border);
//           border-radius: 100px; font-size: 12px;
//           color: rgba(245,240,232,0.65);
//           margin-bottom: 28px;
//           backdrop-filter: blur(12px);
//         }
//         .gl-badge-dot {
//           width: 6px; height: 6px; background: var(--orange);
//           border-radius: 50%; animation: glPulse 2s infinite;
//         }
//         @keyframes glPulse {
//           0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}
//         }

//         .gl-h1 {
//           font-family: 'Syne', sans-serif;
//           font-size: clamp(38px, 4.5vw, 64px);
//           font-weight: 800; line-height: 1.05;
//           letter-spacing: -2px; margin-bottom: 22px;
//         }
//         .gl-h1-accent {
//           background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .gl-sub {
//           font-size: 15px; line-height: 1.75;
//           color: rgba(245,240,232,0.5);
//           max-width: 360px; margin-bottom: 38px;
//         }
//         .gl-btns { display: flex; gap: 14px; align-items: center; }
//         .gl-btn-primary {
//           padding: 13px 30px;
//           background: linear-gradient(135deg, var(--orange), var(--orange-light));
//           color: #1a0800; font-weight: 600; font-size: 14px;
//           border: none; border-radius: 100px; cursor: pointer;
//           font-family: 'DM Sans', sans-serif;
//           transition: transform 0.2s, box-shadow 0.2s;
//           box-shadow: 0 0 36px rgba(255,107,53,0.28);
//         }
//         .gl-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 56px rgba(255,107,53,0.45); }
//         .gl-btn-ghost {
//           padding: 13px 22px; color: rgba(245,240,232,0.65);
//           font-size: 14px; background: var(--glass);
//           border: 1px solid var(--glass-border);
//           border-radius: 100px; cursor: pointer;
//           font-family: 'DM Sans', sans-serif;
//           backdrop-filter: blur(10px);
//           transition: color 0.2s, border-color 0.2s;
//         }
//         .gl-btn-ghost:hover { color: var(--white); border-color: rgba(255,107,53,0.3); }

//         /* Stats */
//         .gl-stats {
//           position: absolute; bottom: 44px; left: 7vw; z-index: 10;
//           display: flex; gap: 44px;
//           opacity: 0; transform: translateY(16px);
//           transition: opacity 0.9s ease 0.25s, transform 0.9s ease 0.25s;
//         }
//         .gl-stats.visible { opacity: 1; transform: translateY(0); }
//         .gl-stat-n {
//           font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 700;
//         }
//         .gl-stat-n span { color: var(--orange); }
//         .gl-stat-l { font-size: 11px; color: rgba(245,240,232,0.38); letter-spacing: 0.6px; margin-top: 2px; }

//         /* Scroll indicator */
//         .gl-scroll-hint {
//           position: absolute; bottom: 28px; right: 7vw; z-index: 10;
//           display: flex; flex-direction: column; align-items: center; gap: 8px;
//           color: rgba(245,240,232,0.28); font-size: 10px; letter-spacing: 1.5px;
//           animation: glFadeIn 1s ease 3.5s both;
//         }
//         @keyframes glFadeIn { from{opacity:0} to{opacity:1} }
//         .gl-scroll-line {
//           width: 1px; height: 44px;
//           background: linear-gradient(to bottom, var(--orange), transparent);
//           animation: glDrop 1.6s ease-in-out infinite;
//         }
//         @keyframes glDrop {
//           0%{transform:translateY(-6px);opacity:0}
//           50%{opacity:1}
//           100%{transform:translateY(6px);opacity:0}
//         }

//         /* SPACER so page is scrollable */
//         .gl-spacer { height: 100vh; }

//         /* Responsive */
//         @media (max-width: 768px) {
//           .gl-nav { padding: 16px 24px; }
//           .gl-nav-links { display: none; }
//           .gl-hero-text { margin-left: 5vw; max-width: 90vw; }
//           .gl-stats { left: 5vw; gap: 28px; bottom: 90px; }
//         }
//       `}</style>

//       <div className="gl-root">
//         {/* NAV */}
//         <nav className="gl-nav">
//           <div className="gl-logo">ConnectSphere</div>
//           <div className="gl-nav-links">
//             <a href="#">Features</a>
//             <a href="#">Explore</a>
//             <a href="#">About</a>
//             <button className="gl-nav-cta">Sign In</button>
//           </div>
//         </nav>

//         {/* HERO */}
//         <section className="gl-hero">
//           <canvas ref={canvasRef} className="gl-canvas" />

//           {/* Left text — appears after earth settles to right */}
//           <div className={`gl-hero-text${textVisible ? ' visible' : ''}`}>
//             <div className="gl-badge">
//               <span className="gl-badge-dot" />
//               Real-time Global Network
//             </div>
//             <h1 className="gl-h1">
//               Connect with<br />
//               <span className="gl-h1-accent">the world,</span><br />
//               instantly.
//             </h1>
//             <p className="gl-sub">
//               Join millions of people having meaningful conversations across continents.
//               One globe, endless connections.
//             </p>
//             <div className="gl-btns">
//               <button className="gl-btn-primary">Start Chatting</button>
//               <button className="gl-btn-ghost">See How It Works</button>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className={`gl-stats${textVisible ? ' visible' : ''}`}>
//             <div>
//               <div className="gl-stat-n">54<span>M+</span></div>
//               <div className="gl-stat-l">Active Users</div>
//             </div>
//             <div>
//               <div className="gl-stat-n">180<span>+</span></div>
//               <div className="gl-stat-l">Countries</div>
//             </div>
//             <div>
//               <div className="gl-stat-n">99<span>%</span></div>
//               <div className="gl-stat-l">Uptime</div>
//             </div>
//           </div>

//           {/* Scroll hint */}
//           <div className="gl-scroll-hint">
//             <div className="gl-scroll-line" />
//             SCROLL
//           </div>
//         </section>

//         {/* Spacer — gives scroll room for the animation */}
//         <div className="gl-spacer" />
//       </div>
//     </>
//   );
// }