'use client';

import { useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import ProspectFinder from './ProspectFinder';

const CARDS = {
  1: { label: 'B-NICE',            className: 'card-1' },
  2: { label: 'B-ID',              className: 'card-2' },
  3: { label: 'WORK IN PROGRESS',  className: 'card-3-inner' },
};

export default function ExpandableCards() {
  const [expandedId, setExpandedId] = useState(null);
  const [animating, setAnimating] = useState(false);
  const cardRefs = useRef({});
  const containerRef = useRef(null);
  const overlayRef = useRef(null);

  const handleCardClick = useCallback((id) => {
    if (animating || expandedId !== null) return;

    const cardEl = cardRefs.current[id];
    const containerEl = containerRef.current;
    if (!cardEl || !containerEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    const overlay = overlayRef.current;

    gsap.set(overlay, {
      display: 'flex',
      x: cardRect.left - containerRect.left,
      y: cardRect.top - containerRect.top,
      width: cardRect.width,
      height: cardRect.height,
      borderRadius: getComputedStyle(cardEl).borderRadius,
    });

    setExpandedId(id);
    setAnimating(true);

    gsap.to(overlay, {
      x: 0,
      y: 0,
      width: containerRect.width,
      height: containerRect.height,
      borderRadius: getComputedStyle(cardEl).borderRadius,
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: () => setAnimating(false),
    });
  }, [animating, expandedId]);

  const handleClose = useCallback((e) => {
    e.stopPropagation();
    if (animating || expandedId === null) return;

    const cardEl = cardRefs.current[expandedId];
    const containerEl = containerRef.current;
    if (!cardEl || !containerEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const overlay = overlayRef.current;

    setAnimating(true);

    gsap.to(overlay, {
      x: cardRect.left - containerRect.left,
      y: cardRect.top - containerRect.top,
      width: cardRect.width,
      height: cardRect.height,
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(overlay, { display: 'none' });
        setExpandedId(null);
        setAnimating(false);
      },
    });
  }, [animating, expandedId]);

  return (
    <div ref={containerRef} className="cards-area">

      {[1, 2, 3].map((id) => (
        <div
          key={id}
          ref={(el) => { cardRefs.current[id] = el; }}
          className={`card ${CARDS[id].className}`}
          onClick={() => handleCardClick(id)}
          style={{ cursor: animating ? 'default' : 'pointer' }}
        >
          <span className="card-num">{CARDS[id].label}</span>
        </div>
      ))}

      {/* Single overlay — absolutely positioned, animated by GSAP */}
      <div ref={overlayRef} className="card expandable-overlay" style={{ display: 'none' }}>
        {expandedId === 2
          ? <ProspectFinder />
          : <span className="card-num">{expandedId ? CARDS[expandedId].label : null}</span>
        }
        {expandedId && (
          <button className="close-btn" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

    </div>
  );
}
