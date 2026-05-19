'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import GlobeScene from './GlobeScene'
import AuthForm from '@/components/auth/AuthForm'
import dynamic from 'next/dynamic'

const GlobeScene = dynamic(() => import('./GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050505]" /> // Placeholder while loading
  ),
})

gsap.registerPlugin(ScrollTrigger)

export default function LandingClient() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !scrollRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-content',
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: scrollRef.current,
            start: 'top top',
            end: '25% top',
            scrub: 1.5,
          },
        }
      )

      gsap.fromTo(
        '.login-buttons',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollRef.current,
            start: '15% top',
            end: '30% top',
            scrub: 1.5,
          },
        }
      )
    }, scrollRef)

    const st = ScrollTrigger.create({
      trigger: scrollRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })

    return () => {
      ctx.revert()
      st.kill()
    }
  }, [mounted])

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF781F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="relative bg-[#050505] min-h-[250vh]">
      <div className="fixed inset-0 z-0">
        <GlobeScene scrollProgress={progressRef} />
      </div>

      <div className="relative z-10 pointer-events-none">
        <section className="h-screen relative">
          <div className="absolute top-8 left-8 pointer-events-auto">
            <span className="text-white/40 text-sm tracking-[0.3em] uppercase font-bold">
              Nexora
            </span>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto">
            <span className="text-white/20 text-xs tracking-widest uppercase">
              Scroll to explore
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-[#FF781F] to-transparent" />
          </div>
        </section>

        <section className="h-screen flex items-center">
          <div className="max-w-xl ml-8 md:ml-16 lg:ml-24 px-4 pointer-events-auto">
            <div className="hero-content">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-4">
                Nexora
              </h1>
              <div className="h-1 w-24 bg-[#FF781F] mb-6" />
              <p className="text-xl md:text-2xl text-gray-300 font-light mb-2">
                The future of connection.
              </p>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-8 max-w-md">
                End-to-end encrypted messaging, crystal-clear voice calls, and
                watch-together experiences — woven into a network that puts your
                privacy first.
              </p>
            </div>

            <div className="login-buttons flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => openAuth('login')}
                className="group relative px-8 py-3.5 bg-[#FF781F] text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,120,31,0.3)]"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button
                onClick={() => openAuth('signup')}
                className="px-8 py-3.5 border border-white/20 text-white font-medium rounded-full backdrop-blur-xl bg-white/5 hover:bg-white/10 hover:border-[#FF781F]/50 transition-all duration-300"
              >
                Sign Up
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {['Encrypted', 'Voice Calls', 'Watch Together', 'Groups'].map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 rounded-full border border-white/10 text-white/50 text-xs bg-white/[0.03] backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="h-screen relative flex items-center justify-center">
          <div className="relative w-full max-w-6xl px-4 pointer-events-auto">
            <div className="absolute top-12 left-10 max-w-sm rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4 block">
                Global network
              </span>
              <h2 className="text-3xl font-semibold text-white mb-3">
                Real-time presence across regions
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Users appear on the globe from different regions, then connect
                through secure channels that light up the network.
              </p>
            </div>

            <div className="absolute top-24 right-10 max-w-xs rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <span className="text-sm uppercase tracking-[0.2em] text-white/40 mb-3 block">
                Secure messaging
              </span>
              <p className="text-sm text-gray-400 leading-relaxed">
                End-to-end encryption keeps every chat private, even when the
                world is watching.
              </p>
            </div>

            <div className="absolute bottom-14 left-20 max-w-xs rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <span className="text-sm uppercase tracking-[0.2em] text-white/40 mb-3 block">
                Watch together
              </span>
              <p className="text-sm text-gray-400 leading-relaxed">
                Share streams, reactions, and live events with your team in one
                connected interface.
              </p>
            </div>

            <div className="absolute bottom-20 right-[calc(50%-16rem)] max-w-sm rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <span className="text-sm uppercase tracking-[0.2em] text-white/40 mb-3 block">
                Voice & calls
              </span>
              <p className="text-sm text-gray-400 leading-relaxed">
                Voice and video sessions connect teammates with crystal clarity
                and minimal latency.
              </p>
            </div>

            <div className="relative h-[72vh] rounded-[3rem] border border-white/5 bg-black/20" />
          </div>
        </section>
      </div>

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAuth(false)}
          />
          <div className="relative z-10 w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
}
