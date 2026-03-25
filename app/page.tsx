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
        <section className="py-24">
          <h2 className="text-3xl font-bold mb-12 px-8 max-w-3xl mx-auto">Current Projects</h2>
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto px-8 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div className="flex-none w-72 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex flex-col">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Finance</div>
                <h3 className="font-bold text-lg mb-2">Helm</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  A unified dashboard for every asset you own. Stocks, crypto, DeFi,
                  derivatives, and equity comp in one place — with the decision tools
                  to actually do something about it.
                </p>
                <div className="mt-auto pt-4 text-xs text-gray-400">In Progress</div>
              </div>

              <div className="flex-none w-72 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex flex-col">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Lifestyle</div>
                <h3 className="font-bold text-lg mb-2">Cadence</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  A habits and lifestyle journal built around rhythm rather than
                  streaks. Reflect on how you actually spend your time, not just
                  whether you hit a target.
                </p>
                <div className="mt-auto pt-4 text-xs text-gray-400">In Progress</div>
              </div>

              <div className="flex-none w-72 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex flex-col">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Productivity</div>
                <h3 className="font-bold text-lg mb-2">Signal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  An AI-powered synthesis layer for calls, emails, and notes. Pulls
                  out what matters, surfaces next steps, and keeps you on top of
                  every conversation without the overhead.
                </p>
                <div className="mt-auto pt-4 text-xs text-gray-400">In Progress</div>
              </div>

              <div className="flex-none w-72 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex flex-col">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Game</div>
                <h3 className="font-bold text-lg mb-2">Biome</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  A living world of digital creatures. Grow, evolve, and tend your
                  slime menagerie in this atmospheric creature collection game.
                </p>
                <div className="mt-auto pt-4 text-xs text-gray-400">In Progress</div>
              </div>

              {/* Right edge padding card */}
              <div className="flex-none w-8" />
            </div>
            <div className="pointer-events-none absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent" />
          </div>
        </section>

        {/* Lorem Ipsum */}
        <section className="max-w-3xl mx-auto px-8 py-24">
          <h2 className="text-3xl font-bold mb-6">Currently Building</h2>
          <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
        </section>
      </div>
    </main>
  )
}
