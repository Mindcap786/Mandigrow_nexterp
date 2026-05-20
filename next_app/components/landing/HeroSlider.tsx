'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const SLIDES = [
    {
        src: '/hero-slide-1-stock.png',
        alt: 'MandiGrow Stock Status Dashboard',
        label: 'Stock Management',
        sublabel: 'Real-time inventory across all commodities',
        accent: 'from-emerald-500/20 to-emerald-500/5',
        badge: '📦 Stock Status',
    },
    {
        src: '/hero-slide-2-financial.png',
        alt: 'MandiGrow Financial Overview',
        label: 'Financial Control',
        sublabel: 'Live P&L, payments & receipts at a glance',
        accent: 'from-blue-500/20 to-blue-500/5',
        badge: '💰 Finance',
    },
    {
        src: '/hero-slide-3-dashboard.png',
        alt: 'MandiGrow Command Center Dashboard',
        label: 'Command Center',
        sublabel: 'Your entire mandi business, one screen',
        accent: 'from-indigo-500/20 to-indigo-500/5',
        badge: '🚀 Dashboard',
    },
]

const SLIDE_DURATION = 3000 // 3 seconds per slide

export function HeroSlider() {
    const [current, setCurrent] = useState(0)
    const [progress, setProgress] = useState(0)
    const [transitioning, setTransitioning] = useState(false)

    const goTo = useCallback((index: number) => {
        if (index === current) return
        setTransitioning(true)
        setTimeout(() => {
            setCurrent(index)
            setProgress(0)
            setTransitioning(false)
        }, 400)
    }, [current])

    const next = useCallback(() => {
        const nextIdx = (current + 1) % SLIDES.length
        setTransitioning(true)
        setTimeout(() => {
            setCurrent(nextIdx)
            setProgress(0)
            setTransitioning(false)
        }, 400)
    }, [current])

    // Progress ticker
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    next()
                    return 0
                }
                return prev + (100 / (SLIDE_DURATION / 50))
            })
        }, 50)
        return () => clearInterval(interval)
    }, [next])

    const slide = SLIDES[current]

    return (
        <div className="w-full h-full relative flex flex-col">
            {/* Slide image with crossfade */}
            <div className="relative flex-1 overflow-hidden">
                {SLIDES.map((s, i) => (
                    <Image
                        key={s.src}
                        src={s.src}
                        alt={s.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority={i === 0}
                        className={cn(
                            "object-cover object-top transition-all duration-500",
                            i === current
                                ? transitioning ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
                                : 'opacity-0 scale-[1.02]'
                        )}
                    />
                ))}

                {/* Gradient overlay at bottom for label legibility */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Slide label */}
                <div className={cn(
                    "absolute bottom-3 left-4 transition-all duration-500",
                    transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                )}>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/30">
                            {slide.badge}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress bar + dots */}
            <div className="bg-white px-4 py-3 flex items-center gap-3">
                {/* Progress bar */}
                <div className="flex-1 h-1 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-none"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {/* Dot indicators */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}: ${SLIDES[i].label}`}
                            className={cn(
                                "rounded-full transition-all duration-300",
                                i === current
                                    ? "w-5 h-2 bg-emerald-600"
                                    : "w-2 h-2 bg-emerald-200 hover:bg-emerald-400"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
