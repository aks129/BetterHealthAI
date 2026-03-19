import React, { useState, useEffect } from 'react';
import { useGame } from '../game/GameContext';

const STAR_COUNT = 200;

function generateStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));
}

export default function TitleScreen() {
  const { dispatch } = useGame();
  const [stars] = useState(generateStars);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 300);
    const t2 = setTimeout(() => setMenuVisible(true), 1200);
    const t3 = setTimeout(() => setTaglineVisible(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const menuItems = [
    { key: 'new', label: 'New Game', phase: 'faction_select' as const },
    { key: 'datalinks', label: 'Datalinks', phase: 'datalinks' as const },
    { key: 'credits', label: 'Credits', phase: null },
  ];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Animated Starfield */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Nebula glow backgrounds */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #4a00e0 0%, transparent 70%)',
          top: '10%',
          right: '-10%',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, #00b4d8 0%, transparent 70%)',
          bottom: '5%',
          left: '-5%',
          animation: 'pulse 10s ease-in-out 2s infinite',
        }}
      />

      {/* Rotating Planet */}
      <div
        className="absolute"
        style={{
          width: 'min(320px, 70vw)',
          height: 'min(320px, 70vw)',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 35% 35%,
              #2d5a27 0%,
              #1a4a1a 20%,
              #0d3b0d 40%,
              #1a3a5c 55%,
              #0f2844 70%,
              #081428 90%,
              #030a14 100%
            )
          `,
          boxShadow: `
            inset -40px -20px 60px rgba(0,0,0,0.8),
            inset 5px 5px 20px rgba(100,200,100,0.1),
            0 0 60px rgba(0,180,216,0.15),
            0 0 120px rgba(0,180,216,0.05)
          `,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'planetRotate 60s linear infinite',
        }}
      >
        {/* Atmosphere glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(100,200,255,0.08) 0%, transparent 50%)',
          }}
        />
        {/* Cloud bands */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden opacity-20"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 30px,
                rgba(200,220,200,0.15) 30px,
                rgba(200,220,200,0.15) 33px,
                transparent 33px,
                transparent 60px
              )
            `,
            animation: 'cloudDrift 45s linear infinite',
          }}
        />
      </div>

      {/* Title */}
      <div
        className="relative z-10 text-center mb-4"
        style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'all 1.5s ease-out',
        }}
      >
        <div className="text-sm tracking-[0.5em] text-cyan-400/70 uppercase mb-2 font-light">
          Alpha Centauri
        </div>
        <h1
          className="text-6xl md:text-7xl font-bold tracking-wider"
          style={{
            background: 'linear-gradient(180deg, #e0f7fa 0%, #00bcd4 40%, #006064 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(0,188,212,0.4))',
          }}
        >
          NEW HORIZON
        </h1>
        <div
          className="h-[1px] w-full max-w-[256px] mx-auto mt-4"
          style={{
            background: 'linear-gradient(90deg, transparent, #00bcd4, transparent)',
          }}
        />
      </div>

      {/* Tagline */}
      <p
        className="relative z-10 text-cyan-300/50 text-lg italic tracking-wide mb-16 font-light"
        style={{
          opacity: taglineVisible ? 1 : 0,
          transition: 'opacity 2s ease-out',
        }}
      >
        A new world awaits...
      </p>

      {/* Menu */}
      <div
        className="relative z-10 flex flex-col items-center gap-3"
        style={{
          opacity: menuVisible ? 1 : 0,
          transform: menuVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease-out',
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.key}
            onMouseEnter={() => setHoveredButton(item.key)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => {
              if (item.phase) {
                dispatch({ type: 'SET_PHASE', payload: item.phase });
              }
            }}
            className="relative w-full max-w-[256px] py-3 px-8 text-center uppercase tracking-[0.3em] text-sm font-medium transition-all duration-300 border cursor-pointer active:scale-95"
            style={{
              color: hoveredButton === item.key ? '#e0f7fa' : '#80deea',
              borderColor: hoveredButton === item.key ? '#00bcd4' : 'rgba(0,188,212,0.3)',
              backgroundColor: hoveredButton === item.key ? 'rgba(0,188,212,0.1)' : 'rgba(0,188,212,0.03)',
              boxShadow: hoveredButton === item.key
                ? '0 0 20px rgba(0,188,212,0.2), inset 0 0 20px rgba(0,188,212,0.05)'
                : 'none',
            }}
          >
            {/* Corner accents */}
            <span
              className="absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300"
              style={{ borderColor: hoveredButton === item.key ? '#00bcd4' : 'rgba(0,188,212,0.5)' }}
            />
            <span
              className="absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300"
              style={{ borderColor: hoveredButton === item.key ? '#00bcd4' : 'rgba(0,188,212,0.5)' }}
            />
            <span
              className="absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300"
              style={{ borderColor: hoveredButton === item.key ? '#00bcd4' : 'rgba(0,188,212,0.5)' }}
            />
            <span
              className="absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300"
              style={{ borderColor: hoveredButton === item.key ? '#00bcd4' : 'rgba(0,188,212,0.5)' }}
            />
            {item.label}
          </button>
        ))}
      </div>

      {/* Version */}
      <div className="absolute bottom-4 right-6 text-cyan-800 text-xs tracking-widest">
        v0.1.0 ALPHA
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        @keyframes planetRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes cloudDrift {
          from { transform: translateX(0); }
          to { transform: translateX(30px); }
        }
      `}</style>
    </div>
  );
}
