'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const SATURATIONS = [100, 75, 50, 25, 10];

export default function CardStack() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Initial setup
    cardsRef.current.forEach((card, i) => {
      gsap.set(card, {
        y: -i * 25, // stack them upwards significantly so they peek out
        scale: 1 - i * 0.05, // smaller as they go back
        zIndex: 5 - i,
        '--mix-pct': `${SATURATIONS[i]}%`,
      });
    });
  }, []);

  const handleClick = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const topCard = cardsRef.current[0];
    const restCards = cardsRef.current.slice(1);

    const tl = gsap.timeline({
      onComplete: () => {
        // Shift our logical array
        cardsRef.current = [...restCards, topCard];
        // Reset z-indexes safely
        cardsRef.current.forEach((card, i) => {
          gsap.set(card, { zIndex: 5 - i });
        });
        isAnimating.current = false;
      }
    });

    // 1. Top card slides right and tilts
    tl.to(topCard, {
      x: 150, // move right
      y: -60, // slight arc up
      scale: 1.05,
      rotation: 15, // tilt right
      duration: 0.3,
      ease: 'power2.out',
    }, 0);

    // 2. Midpoint: send it to the back visually
    tl.add(() => {
      gsap.set(topCard, { zIndex: 0 });
    }, 0.3);

    // 3. Top card goes to the back position
    tl.to(topCard, {
      x: 0,
      y: -4 * 25, // last position in the stack (highest up)
      scale: 1 - 4 * 0.05,
      rotation: 0,
      '--mix-pct': `${SATURATIONS[4]}%`,
      duration: 0.3,
      ease: 'power2.inOut',
    }, 0.3);

    // 4. The other cards slide forward
    restCards.forEach((card, i) => {
      tl.to(card, {
        x: 0,
        y: -i * 25,
        scale: 1 - i * 0.05,
        '--mix-pct': `${SATURATIONS[i]}%`,
        duration: 0.6,
        ease: 'power2.inOut',
      }, 0);
    });
  };

  return (
    <div 
      ref={containerRef} 
      onClick={handleClick}
      className="card-stack-container"
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        cursor: 'pointer',
        perspective: '1000px' // Add perspective for slightly better scaling illusion
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          ref={el => cardsRef.current[i] = el}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Mix card color with a lighter background (using --bg) to simulate saturation loss and make it lighter
            background: `color-mix(in srgb, var(--card-bg) var(--mix-pct, 100%), var(--bg))`,
            // Add subtle shadow to distinguish layers
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
          }}
        >
          <span className="card-num">4</span>
        </div>
      ))}
    </div>
  );
}
