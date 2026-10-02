'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Lock,
  Menu,
  GraduationCap,
  Building2,
  CheckCircle2,
  Smartphone,
  Zap,
} from 'lucide-react'

export default function StudentCompanionShowcase() {
  // 3D Tilt State reacting to cursor movement
  const showcaseRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 8, y: -6 })
  const [, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showcaseRef.current) return
    const rect = showcaseRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    // Smooth 3D tilt angles (clamped to ±14deg)
    const rotX = -((y - centerY) / centerY) * 12
    const rotY = ((x - centerX) / centerX) * 14
    setRotate({
      x: Math.max(-14, Math.min(14, rotX)),
      y: Math.max(-14, Math.min(14, rotY)),
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 8, y: -6 }) // Reset to natural resting 3D angle
  }

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-16 sm:py-24">
      {/* ── Soft Atmospheric Radial Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[850px] h-[580px] rounded-full blur-[140px] opacity-40 dark:opacity-20 transition-all duration-700"
          style={{
            background:
              'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(245, 165, 36, 0.16) 45%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* ── 1. Header & Eyebrow: Mobile Purpose ── */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-14">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shadow-xs text-xs font-nunito font-bold text-slate-700 dark:text-slate-300 mb-5 backdrop-blur-md">
            <Smartphone className="w-3.5 h-3.5 text-primary dark:text-[#F5A524]" />
            <span>Built for Mobile • Fast &amp; Accessible Across Nepal</span>
          </div>

          {/* Main Headline */}
          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.1] text-balance mb-4">
            <span className="text-primary dark:text-[#F5A524]">Works Smoothly on Every Phone.</span>{' '}
            <br className="hidden sm:inline" />
            Higher Education in Your Pocket.
          </h2>

          {/* Subline */}
          <p className="font-nunito text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto text-balance leading-relaxed mb-7">
            Most students and parents in Nepal research colleges on their smartphones. Shikshya Nepal is lightweight, touch-optimized, and built to work effortlessly on mobile browsers with zero clutter.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B2B33] hover:bg-[#16414D] text-white dark:bg-[#F5A524] dark:text-[#061519] dark:hover:bg-[#ffb43a] text-sm font-bold font-nunito shadow-[0_8px_20px_-4px_rgba(11,43,51,0.3)] dark:shadow-[0_8px_20px_-4px_rgba(245,165,36,0.3)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Explore Colleges on Mobile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/tools/gpa-calculator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-white border border-black/[0.08] dark:border-white/[0.12] text-sm font-bold font-nunito shadow-xs backdrop-blur-md transition-all duration-200"
            >
              <span>Open GPA Calculator</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── 2. Interactive 3D Phone Showcase: Actual Website in Mockup ── */}
        <div
          ref={showcaseRef}
          onMouseMove={(e) => {
            setIsHovered(true)
            handleMouseMove(e)
          }}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: '1200px' }}
          className="relative mx-auto max-w-4xl flex items-center justify-center pt-4 pb-6 select-none"
        >
          {/* ── LEFT 3D FLOATING CAPSULE CARD (Desktop) ── */}
          <div
            className="hidden lg:block absolute -left-4 xl:-left-12 top-24 z-30 pointer-events-auto transition-transform duration-300 ease-out"
            style={{
              transform: `translateZ(50px) rotateX(${rotate.x * 0.4}deg) rotateY(${rotate.y * 0.4}deg)`,
            }}
          >
            <div className="w-[285px] rounded-3xl bg-white/85 dark:bg-[#0C2229]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-4 shadow-[0_20px_45px_rgba(11,43,51,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-105">
              <div className="grid grid-cols-2 divide-x divide-black/[0.06] dark:divide-white/[0.08] text-left">
                {/* Cell 1: Mobile Speed */}
                <div className="pr-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-400">
                      Mobile Speed
                    </span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="font-baloo text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                    &lt; 1s Load
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    Lightweight on 4G
                  </p>
                </div>

                {/* Cell 2: No App Download */}
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-400">
                      Browser
                    </span>
                    <Smartphone className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="font-baloo text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                    Instant Web
                  </p>
                  <p className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-1">
                    No App Needed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT 3D FLOATING CAPSULE CARD (Desktop) ── */}
          <div
            className="hidden lg:block absolute -right-4 xl:-right-12 top-24 z-30 pointer-events-auto transition-transform duration-300 ease-out"
            style={{
              transform: `translateZ(55px) rotateX(${rotate.x * 0.4}deg) rotateY(${rotate.y * 0.4}deg)`,
            }}
          >
            <Link
              href="/colleges"
              className="group block w-[295px] rounded-3xl bg-white/85 dark:bg-[#0C2229]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-4 shadow-[0_20px_45px_rgba(11,43,51,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Touch-Optimized
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      1,200+ colleges &amp; 450+ programs
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 flex-shrink-0 group-hover:bg-[#0B2B33] group-hover:text-white dark:group-hover:bg-[#F5A524] dark:group-hover:text-black transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>ZERO AD POPUPS</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● CLEAN REGISTRY</span>
              </div>
            </Link>
          </div>

          {/* ── CENTER: 3D SMARTPHONE DISPLAYING ACTUAL SHIKSHYA NEPAL WEBSITE ── */}
          <div
            className="relative w-full max-w-[325px] sm:max-w-[345px] transition-transform duration-300 ease-out"
            style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) rotateZ(1deg)`,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {/* 3D Ground Shadow Projection */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-full blur-xl opacity-60 dark:opacity-80 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(11, 43, 51, 0.45) 0%, transparent 75%)',
                transform: 'translateZ(-60px) rotateX(90deg)',
              }}
            />

            {/* Hardware Side Buttons */}
            <div className="absolute -left-[5px] top-20 w-[4px] h-7 rounded-l-md bg-slate-600 border-l border-slate-400/50 shadow-sm" />
            <div className="absolute -left-[5px] top-32 w-[4px] h-12 rounded-l-md bg-slate-600 border-l border-slate-400/50 shadow-sm" />
            <div className="absolute -left-[5px] top-48 w-[4px] h-12 rounded-l-md bg-slate-600 border-l border-slate-400/50 shadow-sm" />
            <div className="absolute -right-[5px] top-36 w-[4px] h-16 rounded-r-md bg-slate-600 border-r border-slate-400/50 shadow-sm" />

            {/* Titanium Chassis Outer Rim */}
            <div
              className="relative rounded-[50px] p-[10px] bg-slate-900 border border-slate-700/80 transition-shadow duration-300"
              style={{
                boxShadow:
                  '0 35px 75px -15px rgba(11, 43, 51, 0.4), 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255, 255, 255, 0.35), inset 0 -2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Inner Bezel Ring */}
              <div className="rounded-[40px] p-[2px] bg-black border border-slate-800">
                
                {/* ── PHONE SCREEN: SHIKSHYA NEPAL MOBILE WEBSITE LAYOUT ── */}
                <div className="relative rounded-[38px] bg-[#FAF9F5] dark:bg-[#07191E] overflow-hidden text-left aspect-[9/18.8] flex flex-col justify-between text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.08]">
                  
                  {/* Subtle Diagonal Screen Glare */}
                  <div
                    className="pointer-events-none absolute inset-0 z-30 opacity-25 select-none"
                    style={{
                      background:
                        'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)',
                    }}
                  />

                  {/* 1. Mobile Status Bar & Dynamic Island */}
                  <div className="relative z-20 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-300 pt-2 px-4 select-none">
                    <span>9:41</span>
                    {/* Dynamic Island */}
                    <div className="w-22 h-4 rounded-full bg-black border border-white/[0.12] mx-auto flex items-center justify-center gap-1.5 px-1.5 shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span>5G</span>
                      <span className="text-xs">▮</span>
                    </div>
                  </div>

                  {/* 2. Mobile Browser URL Bar */}
                  <div className="relative z-10 px-3 pt-1.5 pb-2 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="h-6 rounded-full bg-white dark:bg-slate-900/90 border border-black/[0.08] dark:border-white/[0.1] px-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono shadow-2xs">
                      <span className="flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">shikshyanepal.org</span>
                      </span>
                      <span className="text-[9px] text-slate-400">AA</span>
                    </div>
                  </div>

                  {/* 3. Shikshya Nepal Mobile Website Body */}
                  <div className="relative z-10 flex-1 overflow-hidden p-3 space-y-2.5">
                    {/* Mobile Brand Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-[#0B2B33] text-white flex items-center justify-center text-xs font-bold">
                          SN
                        </span>
                        <div>
                          <p className="font-baloo text-xs font-extrabold text-slate-900 dark:text-white leading-none">
                            Shikshya Nepal
                          </p>
                          <p className="text-[8px] text-slate-400 font-mono">शिक्षा, स्पष्ट रूपमा।</p>
                        </div>
                      </div>
                      <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>

                    {/* Mini Hero Header in Mobile */}
                    <div className="text-center pt-0.5">
                      <h4 className="font-baloo text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        Decide what to study.{' '}
                        <span className="text-[#F5A524]">Find where.</span>
                      </h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-nunito mt-0.5">
                        Verified higher-education registry for Nepal.
                      </p>
                    </div>

                    {/* Mobile Search Box */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-nunito truncate">
                        Search BSc CSIT, Pulchowk, MBBS...
                      </span>
                    </div>

                    {/* University Quick Chips on Mobile */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                      {['TU (Tribhuvan)', 'KU (Kathmandu)', 'PokU', 'Purbanchal'].map((u) => (
                        <span
                          key={u}
                          className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[9px] font-mono font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0"
                        >
                          {u}
                        </span>
                      ))}
                    </div>

                    {/* Sample Verified College Card (As rendered on mobile) */}
                    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-black/[0.07] dark:border-white/[0.1] p-2.5 shadow-2xs text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          Constituent Campus
                        </span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          Verified
                        </span>
                      </div>
                      <p className="font-baloo text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        Pulchowk Campus (IOE)
                      </p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-nunito mb-1.5">
                        Lalitpur • Tribhuvan University
                      </p>

                      <div className="pt-1.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[9px] font-nunito">
                        <span className="text-slate-500">BE Programs: 12</span>
                        <span className="font-bold text-[#F5A524]">NPR 4.5L Regular</span>
                      </div>
                    </div>

                    {/* Sample Tool Shortcut Card */}
                    <div className="rounded-xl bg-sky-500/10 dark:bg-sky-400/10 border border-sky-500/20 p-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-sky-500 text-white flex items-center justify-center text-[10px]">
                          🧮
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-900 dark:text-white leading-none">
                            NEB Grade 12 GPA Tool
                          </p>
                          <p className="text-[8px] text-slate-500 dark:text-slate-400">Calculate instantly on phone</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    </div>
                  </div>

                  {/* 4. Mobile Bottom Nav Bar */}
                  <div className="relative z-10 px-3 py-1.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-around text-[9px] font-nunito text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-[#F5A524] flex items-center gap-0.5">
                      <Building2 className="w-3 h-3" />
                      Colleges
                    </span>
                    <span className="flex items-center gap-0.5">
                      <GraduationCap className="w-3 h-3" />
                      Programs
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Search className="w-3 h-3" />
                      Search
                    </span>
                  </div>

                  {/* iOS Home Indicator */}
                  <div className="relative z-10 pb-1 pt-0.5 flex justify-center">
                    <div className="w-24 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FALLBACK: Flanking Cards shown below on small screens ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 lg:hidden max-w-md mx-auto text-left">
          {/* Mobile Card 1 */}
          <div className="rounded-2xl bg-white/80 dark:bg-[#0C2229]/80 border border-black/[0.08] dark:border-white/[0.1] p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Mobile First
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <p className="font-baloo text-lg font-bold text-slate-900 dark:text-white">
              Under 1s Page Load
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              ● Fast on 3G / 4G Connections
            </p>
          </div>

          {/* Mobile Card 2 */}
          <Link
            href="/colleges"
            className="rounded-2xl bg-white/80 dark:bg-[#0C2229]/80 border border-black/[0.08] dark:border-white/[0.1] p-3.5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Mobile Web
              </p>
              <p className="font-baloo text-lg font-bold text-slate-900 dark:text-white">
                No App Download
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                ● Works on any mobile browser
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </div>
    </section>
  )
}
