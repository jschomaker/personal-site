import type { CSSProperties } from "react"

import HeroBackground, { PALETTE } from "@/components/HeroBackground"
import TypewriterHero from "@/components/TypewriterHero"

export default function Home() {
  return (
    <main className="relative">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[calc(100svh-var(--header-height))] w-full items-center justify-center overflow-hidden [transform:translateZ(0)]"
        style={{ "--hero-fade-dark": PALETTE.deep } as CSSProperties}
      >
        <HeroBackground />
        <div className="hero-top-fade absolute top-0 left-0 right-0 h-40 z-10 pointer-events-none" />
        <TypewriterHero />
        {/* Gradient transition from sim to page background */}
        <div
          className="hero-fade absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        />
      </section>

      {/* What I Build */}
      <div className="relative z-10">
        {/* What I Build */}
        <section className="max-w-3xl mx-auto px-8 py-24">
          <h2 className="text-3xl font-bold mb-6">What I Build</h2>
          <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            I build internal tools, workflows, and AI-assisted systems that help
            operations and customer success teams move faster. My work lives at the
            intersection of process design and software — turning repetitive, manual
            work into something that just runs. Currently at Toro TMS, where I work
            in customer success and build tools on the side that I wish existed.
          </p>
        </section>

        {/* Featured Projects */}
        <section className="max-w-5xl mx-auto px-8 py-24">
          <h2 className="text-3xl font-bold mb-12">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Analytics</div>
              <h3 className="font-bold text-lg mb-2">Foot Traffic Analysis</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Spatial analysis tooling for understanding how people move through
                physical spaces. Built to turn raw location data into actionable
                operational insight.
              </p>
              <div className="mt-4 text-xs text-gray-400">In Progress</div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Lifestyle</div>
              <h3 className="font-bold text-lg mb-2">Cadence</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                A habits and lifestyle journal built around rhythm rather than
                streaks. Cadence helps you reflect on how you actually spend your
                time, not just whether you hit a target.
              </p>
              <div className="mt-4 text-xs text-gray-400">In Progress</div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Productivity</div>
              <h3 className="font-bold text-lg mb-2">Signal</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                An AI-powered synthesis layer for calls, emails, and notes. Signal
                pulls out what matters, surfaces next steps, and helps you stay on
                top of every conversation without the overhead.
              </p>
              <div className="mt-4 text-xs text-gray-400">In Progress</div>
            </div>
          </div>
        </section>

        {/* Currently Building */}
        <section className="max-w-3xl mx-auto px-8 py-24">
          <h2 className="text-3xl font-bold mb-6">Currently Building</h2>
          <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            Right now most of my focus is on Signal — specifically the synthesis
            engine that connects calls, emails, and notes into a single coherent
            thread per relationship. The hard part isn&apos;t the AI, it&apos;s making the
            output feel natural and actionable rather than just a summary dump.
            Alongside that I&apos;m building out this platform as a home for everything
            I ship.
          </p>
        </section>
      </div>
    </main>
  )
}
