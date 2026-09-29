'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'

type OrbitMember = { initials: string; ring: 'outer' | 'middle'; angle: number; label?: string; message?: string }

const members: OrbitMember[] = [
  { initials: 'AS', ring: 'outer', angle: -94 },
  { initials: 'KM', ring: 'outer', angle: -47, label: 'Kritika', message: 'Helpful advice!' },
  { initials: 'RB', ring: 'outer', angle: 8, label: 'Rohan', message: 'I am applying too' },
  { initials: 'SP', ring: 'outer', angle: 62 },
  { initials: 'NM', ring: 'outer', angle: 132, label: 'Nima', message: 'Thanks for sharing' },
  { initials: 'AA', ring: 'outer', angle: 178 },
  { initials: 'PS', ring: 'middle', angle: -144, label: 'Priya', message: 'This is useful' },
  { initials: 'SK', ring: 'middle', angle: -38 },
  { initials: 'TG', ring: 'middle', angle: 31, label: 'Tenzin', message: 'Count me in' },
  { initials: 'MJ', ring: 'middle', angle: 96 },
  { initials: 'RS', ring: 'middle', angle: 154 },
]

const ringSize = { outer: 'min(92vw, 43rem)', middle: 'min(68vw, 31rem)' }

export default function CommunityOrbit() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f8f7f3] px-4 py-12 text-sn-ink sm:px-6 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(215,242,230,0.72),transparent_38%)]" />
      <div className="relative mx-auto flex min-h-[36rem] max-w-6xl items-center justify-center overflow-hidden rounded-[2rem] border border-sn-border bg-white shadow-[0_22px_64px_rgba(20,44,53,0.10)] sm:min-h-[48rem]">
        <div className="absolute left-1/2 top-1/2 h-[min(92vw,43rem)] w-[min(92vw,43rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sn-primary/25" />
        <div className="absolute left-1/2 top-1/2 h-[min(68vw,31rem)] w-[min(68vw,31rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sn-primary/20" />
        <div className="absolute left-1/2 top-1/2 h-[min(43vw,20rem)] w-[min(43vw,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sn-primary/15 bg-sn-primary-bg/30" />

        {members.map((member) => {
          const size = ringSize[member.ring]
          // Match the reference motion: a calm outer path and a slightly
          // quicker counter-rotating inner path, with labels held upright.
          const duration = member.ring === 'outer' ? '92s' : '74s'
          const orbitStyle = { width: size, height: size, '--start-angle': `${member.angle}deg`, '--counter-angle': `${-member.angle}deg`, '--orbit-duration': duration } as CSSProperties
          return (
            <div
              key={`${member.ring}-${member.angle}`}
              aria-hidden="true"
              className={`community-orbit-runner absolute left-1/2 top-1/2 motion-reduce:animate-none ${member.ring === 'middle' ? 'community-orbit-reverse' : ''}`}
              style={orbitStyle}
            >
              <div className={`community-orbit-upright absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none ${member.ring === 'middle' ? 'community-orbit-reverse' : ''}`}>
                {member.message ? (
                  <div className="hidden min-w-36 items-center gap-2 rounded-full border border-white/20 bg-white/95 p-1.5 pr-3 text-left shadow-lg sm:flex">
                    <Initials initials={member.initials} />
                    <span className="grid leading-tight"><strong className="text-[11px] text-[#142c35]">{member.label}</strong><span className="text-[10px] text-slate-500">{member.message}</span></span>
                  </div>
                ) : <Initials initials={member.initials} />}
              </div>
            </div>
          )
        })}

        <div className="relative z-10 mx-auto max-w-[17rem] px-3 text-center">
          <h1 className="font-baloo text-3xl font-extrabold leading-[1.05] sm:text-4xl">Student community</h1>
          <p className="mt-3 font-nunito text-xs leading-5 text-sn-ink-soft">Ask, share and make your next education decision with more confidence.</p>
          <Link href="#community-discussions" className="motion-control focus-ring mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-sn-primary px-4 text-xs font-extrabold text-white shadow-sn-button transition hover:-translate-y-0.5 hover:bg-sn-primary-hover">
            Explore discussions
          </Link>
        </div>
      </div>
      <style jsx>{`
        .community-orbit-runner {
          transform: translate(-50%, -50%) rotate(var(--start-angle));
          animation: community-orbit var(--orbit-duration) linear infinite;
        }
        .community-orbit-upright {
          transform: translate(-50%, -50%) rotate(var(--counter-angle));
          animation: community-counter-orbit var(--orbit-duration) linear infinite;
        }
        @keyframes community-orbit {
          to { transform: translate(-50%, -50%) rotate(calc(var(--start-angle) + 360deg)); }
        }
        @keyframes community-counter-orbit {
          to { transform: translate(-50%, -50%) rotate(calc(var(--counter-angle) - 360deg)); }
        }
        .community-orbit-reverse { animation-direction: reverse; }
        @media (prefers-reduced-motion: reduce) {
          .community-orbit-runner, .community-orbit-upright { animation: none; }
        }
      `}</style>
    </section>
  )
}

function Initials({ initials }: { initials: string }) {
  return <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-br from-[#6a9dad] to-[#245968] text-[11px] font-extrabold text-white shadow-[0_5px_16px_rgba(20,44,53,0.16)]">{initials}</span>
}
