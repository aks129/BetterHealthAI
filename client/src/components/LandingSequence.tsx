import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../game/GameContext';
import { createNewGame } from '../game/engine';

const NARRATION_LINES = [
  'The U.N.S. Unity has arrived in the Alpha Centauri system...',
  'After forty years in cryogenic suspension, the colonists awaken to a new star.',
  'Below lies Planet -- a world of alien fungus, uncharted seas, and strange promise.',
  'The ship is breaking apart. Factions form. Pod bays are launched.',
  'Your group descends through the amber atmosphere...',
  'Touchdown. The alien soil crunches beneath boots never meant for this world.',
];

const STAR_COUNT = 120;

function generateStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.3,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1,
  }));
}

export default function LandingSequence() {
  const { gameState, dispatch } = useGame();
  const [stars] = useState(generateStars);
  const [phase, setPhase] = useState(0); // 0=space, 1=approach, 2=narration, 3=planetfall, 4=done
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shipY, setShipY] = useState(0);

  const faction = gameState.factions.find((f) => f.id === gameState.playerFactionId);
  const factionColor = faction?.color || '#00bcd4';
  const factionQuote = faction?.quotes?.[0] || 'We shall build anew upon this alien shore.';
  const factionLeader = faction?.leader || 'Unknown Leader';

  // Phase progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 1500));
    timers.push(setTimeout(() => setPhase(2), 3500));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Ship animation during approach
  useEffect(() => {
    if (phase < 1) return;
    const interval = setInterval(() => {
      setShipY((y) => {
        if (y >= 100) { clearInterval(interval); return 100; }
        return y + 0.5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  // Typewriter effect for narration
  useEffect(() => {
    if (phase !== 2) return;
    const currentLine = NARRATION_LINES[narrationIndex];
    if (!currentLine) {
      setPhase(3);
      return;
    }

    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedText((t) => t + currentLine[charIndex]);
        setCharIndex((c) => c + 1);
      }, 35);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        if (narrationIndex < NARRATION_LINES.length - 1) {
          setNarrationIndex((n) => n + 1);
          setCharIndex(0);
          setDisplayedText('');
        } else {
          setPhase(3);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, narrationIndex, charIndex]);

  // Progress bar and planetfall phase
  useEffect(() => {
    if (phase !== 3) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase(4), 1000);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-advance to playing
  useEffect(() => {
    if (phase !== 4) return;
    const timer = setTimeout(() => {
      const newGame = createNewGame(gameState.playerFactionId || 'gaians', 'medium');
      dispatch({ type: 'NEW_GAME', payload: { ...newGame, phase: 'playing' } });
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase, dispatch]);

  const handleSkip = useCallback(() => {
    dispatch({ type: 'SET_PHASE', payload: 'playing' });
  }, [dispatch]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Starfield - streaking during approach */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: phase >= 1 ? `${star.size * 3}px` : `${star.size}px`,
              opacity: 0,
              transition: 'height 2s ease-in-out',
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Planet growing larger during approach */}
      <div
        className="absolute transition-all duration-[3s] ease-in-out"
        style={{
          width: phase >= 1 ? '600px' : '60px',
          height: phase >= 1 ? '600px' : '60px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 35% 35%,
              #2d5a27 0%, #1a4a1a 20%, #0d3b0d 40%,
              #1a3a5c 55%, #0f2844 70%, #081428 90%, #030a14 100%
            )
          `,
          boxShadow: `
            inset -40px -20px 60px rgba(0,0,0,0.8),
            0 0 ${phase >= 1 ? '80' : '20'}px rgba(0,180,216,0.15)
          `,
          bottom: phase >= 1 ? '-200px' : '30%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Atmosphere glow */}
        <div
          className="absolute inset-[-5%] rounded-full"
          style={{
            background: `radial-gradient(circle, transparent 45%, ${factionColor}11 55%, ${factionColor}05 70%, transparent 80%)`,
          }}
        />
      </div>

      {/* Unity spacecraft (simple CSS shape) */}
      {phase >= 0 && phase < 3 && (
        <div
          className="absolute left-1/2 transition-all duration-1000"
          style={{
            top: `${Math.min(shipY, 70)}%`,
            transform: `translateX(-50%) ${phase >= 1 ? 'scale(0.5)' : 'scale(1)'}`,
            opacity: phase >= 2 ? 0.3 : 1,
            transition: 'opacity 2s, transform 3s',
          }}
        >
          {/* Ship body */}
          <div
            className="relative"
            style={{
              width: '12px',
              height: '40px',
              background: `linear-gradient(180deg, ${factionColor} 0%, #aaa 30%, #666 100%)`,
              borderRadius: '6px 6px 2px 2px',
              boxShadow: `0 0 15px ${factionColor}44`,
            }}
          >
            {/* Engines */}
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2"
              style={{
                height: phase >= 1 ? '20px' : '10px',
                background: `linear-gradient(180deg, #ff6600, #ff4400, transparent)`,
                borderRadius: '0 0 2px 2px',
                opacity: 0.8,
                transition: 'height 2s',
                animation: 'engineFlicker 0.15s infinite alternate',
              }}
            />
            {/* Wings */}
            <div
              className="absolute top-[60%] left-[-6px] w-[24px] h-[2px]"
              style={{ background: '#888' }}
            />
          </div>
        </div>
      )}

      {/* Narration text */}
      {phase === 2 && (
        <div
          className="relative z-10 max-w-xl text-center px-8"
          style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
          <div
            className="text-lg font-light leading-relaxed tracking-wide"
            style={{
              color: 'rgba(200,230,255,0.9)',
              textShadow: '0 0 20px rgba(0,188,212,0.3)',
              minHeight: '3em',
            }}
          >
            {displayedText}
            <span
              className="inline-block w-0.5 h-5 ml-1 align-middle"
              style={{ background: factionColor, animation: 'cursorBlink 0.8s step-end infinite' }}
            />
          </div>
        </div>
      )}

      {/* Planetfall phase */}
      {phase >= 3 && (
        <div
          className="relative z-10 text-center"
          style={{ animation: 'fadeIn 1s ease-out' }}
        >
          <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-2">
            Planetfall
          </div>
          <div
            className="text-4xl font-bold tracking-wider mb-6"
            style={{
              color: factionColor,
              textShadow: `0 0 30px ${factionColor}44`,
            }}
          >
            Mission Year 2100
          </div>

          {/* Leader quote */}
          <div
            className="max-w-md mx-auto mb-8 italic text-sm leading-relaxed"
            style={{
              color: `${factionColor}aa`,
              animation: 'fadeIn 1.5s ease-out',
            }}
          >
            "{factionQuote}"
            <div className="text-[10px] text-gray-600 mt-2 not-italic">
              -- {factionLeader}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-80 mx-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-widest text-gray-600">
                Establishing Colony
              </span>
              <span className="text-[10px] font-mono" style={{ color: factionColor }}>
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${factionColor}88, ${factionColor})`,
                  boxShadow: `0 0 10px ${factionColor}44`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Final flash */}
      {phase === 4 && (
        <div
          className="absolute inset-0 z-20"
          style={{
            background: 'white',
            animation: 'flashFade 2.5s ease-out forwards',
          }}
        />
      )}

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-30 text-[10px] uppercase tracking-widest text-gray-700 hover:text-gray-400 transition-colors cursor-pointer"
      >
        Skip [ESC]
      </button>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes engineFlicker {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
        @keyframes flashFade {
          0% { opacity: 0; }
          10% { opacity: 0.8; }
          100% { opacity: 0; background: black; }
        }
      `}</style>
    </div>
  );
}
