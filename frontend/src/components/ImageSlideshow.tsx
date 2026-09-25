import React, { useState, useEffect } from 'react';

interface Slide {
  src: string;
  alt: string;
  caption?: string;
  zoom?: number; // e.g. 1.2 = zoom in 20% to crop out borders/padding baked into the source image
}

interface ImageSlideshowProps {
  slides: Slide[];
  intervalMs?: number;
  height?: string;
}

export const ImageSlideshow: React.FC<ImageSlideshowProps> = ({ slides, intervalMs = 4000, height = '320px' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        marginBottom: '4px',
        background: '#0b1120',
      }}
    >
      {slides.map((slide, idx) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transform: `scale(${slide.zoom ?? 1})`,
            transformOrigin: 'center',
            opacity: idx === activeIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}

      {slides[activeIndex]?.caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 28px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3) 60%, transparent)',
            color: '#f8fafc',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
        >
          {slides[activeIndex].caption}
        </div>
      )}

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: '18px', right: '20px', display: 'flex', gap: '5px' }}>
          {slides.map((_, idx) => (
            <span
              key={idx}
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: idx === activeIndex ? 'var(--accent-amber, #d97706)' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};