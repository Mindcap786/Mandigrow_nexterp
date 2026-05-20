'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  { src: '/hero-slide-3-dashboard.png', alt: 'MandiGrow Dashboard Overview' },
  { src: '/hero-slide-2-financial.png', alt: 'Financials & Ledgers' },
  { src: '/hero-slide-1-stock.png', alt: 'Stock & Inventory Management' },
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000); // Crossfade every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-video md:aspect-[16/11] lg:aspect-[16/10] rounded-2xl md:rounded-[40px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(4,120,87,0.15)] bg-white border border-[#c8d6b0]/50 group">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ))}

      {/* Navigation Dots (optional, but good for UX) */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-emerald-600 w-6' : 'bg-emerald-200/50 hover:bg-emerald-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
