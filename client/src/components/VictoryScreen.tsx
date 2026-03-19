import React, { useState, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { audioEngine } from '../game/audio';

const VICTORY_TYPES: Record<string, { title: string; description: string; color: string; icon: string }> = {
  transcendence: {
    title: 'Transcendence Victory',
    description: 'Your faction has completed the Ascent to Transcendence, merging human consciousness with Planet\'s neural network. A new form of life emerges.',
    color: '#a855f6',
    icon: '◈',
  },
  diplomatic: {
    title: 'Diplomatic Victory',
    description: 'Through masterful diplomacy, your faction has been elected Supreme Leader of the Planetary Council. All factions bow to your wisdom.',
    color: '#60a5fa',
    icon: '☆',
  },
  conquest: {
    title: 'Conquest Victory',
    description: 'Your military might has overwhelmed all opposition. Every faction on Planet now flies your banner. The world is united under your rule.',
    color: '#ef4444',
    icon: '⚔',
  },
  economic: {
    title: 'Economic Victory',
    description: 'Your economic empire spans the globe. Through the power of energy credits and commerce, you have achieved dominion over Planet.',
    color: '#eab308',
    icon: '◉',
  },
};

const STAR_COUNT = 100;

function generateStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 1,
  }));
}

export default function VictoryScreen() {
  const { gameState, dispatch } = useGame();
  const [stars] = useState(generateStars);
  const [phase, setPhase] = useState(0);
  const [particleAngle, setParticleAngle] = useState(0);

  const faction = gameState.factions.find((f) => f.id === gameState.playerFactionId);
  const factionColor = faction?.color || '#00bcd4';

  // Determine victory type from progress
  const playerProgress = gameState.victoryProgress[gameState.playerFactionId];
  let victoryType = 'transcendence';
  if (playerProgress) {
    const entries = Object.entries(playerProgress).filter(([k]) => k !== 'factionId');
    const best = entries.reduce((a, b) => ((b[1] as number) > (a[1] as number) ? b : a), entries[0]);
    if (best) victoryType = best[0];
  }

  const victory = VICTORY_TYPES[victoryType] || VICTORY_TYPES.transcendence;
  const leaderQuote = faction?.quotes?.[faction.quotes.length - 1] || 'We have achieved what we came here to do.';

  const playerBases = gameState.bases.filter((b) => b.factionId === gameState.playerFactionId);
  const playerTechs = (gameState.researchedTechs[gameState.playerFactionId] || []).length;

  useEffect(() => {
    audioEngine.playSfx('victory_fanfare');
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticleAngle((a) => (a + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center select-none">
      {/* Starfield */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`, top: `${star.y}%`,
              width: `${star.size}px`, height: `${star.size}px`,
              opacity: 0,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Dramatic radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${victory.color}15 0%, transparent 60%)`,
          animation: 'victoryPulse 3s ease-in-out infinite',
        }}
      />

      {/* Rotating particle ring */}
      <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 + particleAngle) * (Math.PI / 180);
          const baseRadius = Math.min(200, window.innerWidth * 0.35);
          const radius = baseRadius + Math.sin(i * 0.5 + particleAngle * 0.02) * 30;
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: Math.cos(angle) * radius,
                top: Math.sin(angle) * radius,
                background: victory.color,
                boxShadow: `0 0 6px ${victory.color}`,
                opacity: 0.3 + Math.sin(i + particleAngle * 0.05) * 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-xl px-8">
        {/* Victory icon */}
        <div
          className="text-6xl mb-6 transition-all duration-1000"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1)' : 'scale(0.5)',
            color: victory.color,
            textShadow: `0 0 30px ${victory.color}66`,
            filter: `drop-shadow(0 0 20px ${victory.color}44)`,
          }}
        >
          {victory.icon}
        </div>

        {/* Victory title */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div className="text-xs sm:text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-2">Victory Achieved</div>
          <h1
            className="text-2xl sm:text-4xl font-bold tracking-wider mb-4"
            style={{
              color: victory.color,
              textShadow: `0 0 20px ${victory.color}44`,
            }}
          >
            {victory.title}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {victory.description}
          </p>
        </div>

        {/* Leader quote */}
        <div
          className="transition-all duration-1000 mb-8"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div
            className="italic text-sm leading-relaxed border-l-2 pl-4 text-left max-w-md mx-auto"
            style={{
              color: `${factionColor}aa`,
              borderColor: `${factionColor}44`,
            }}
          >
            "{leaderQuote}"
            <div className="text-[10px] text-gray-600 mt-2 not-italic">
              -- {faction?.leader || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div
          className="transition-all duration-1000 mb-10"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <StatBlock label="Turns Played" value={String(gameState.turn)} color={victory.color} />
            <StatBlock label="Bases Founded" value={String(playerBases.length)} color={victory.color} />
            <StatBlock label="Techs Researched" value={String(playerTechs)} color={victory.color} />
          </div>
        </div>

        {/* Play Again button */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: phase >= 3 ? 1 : 0,
          }}
        >
          <button
            onClick={() => { audioEngine.playSfx('click'); dispatch({ type: 'SET_PHASE', payload: 'title' }); }}
            className="px-10 py-3 text-sm uppercase tracking-[0.3em] font-bold transition-all duration-300 cursor-pointer active:scale-95"
            style={{
              background: `${victory.color}22`,
              border: `1px solid ${victory.color}88`,
              color: victory.color,
              boxShadow: `0 0 25px ${victory.color}22`,
            }}
          >
            Play Again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.8; }
        }
        @keyframes victoryPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">{label}</div>
    </div>
  );
}
