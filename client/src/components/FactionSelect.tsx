import React, { useState, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { Faction } from '../game/types';
import { FACTIONS, getRandomQuote } from '../game/factions';
import { audioEngine } from '../game/audio';

const STAR_COUNT = 150;

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

function FactionPortrait({ faction, size = 120 }: { faction: Faction; size?: number }) {
  const color = faction.color;
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size * 1.2,
        borderRadius: '8px',
        background: `
          linear-gradient(180deg, ${color}22 0%, ${color}08 50%, rgba(0,0,0,0.9) 100%),
          radial-gradient(ellipse at 50% 25%, ${color}33 0%, transparent 50%)
        `,
        border: `1px solid ${color}33`,
      }}
    >
      {/* Abstract leader silhouette */}
      <div
        className="absolute"
        style={{
          width: '55%', height: '50%',
          borderRadius: '50% 50% 45% 45%',
          background: `linear-gradient(180deg, ${color}44 0%, ${color}11 70%, transparent 100%)`,
          top: '10%', left: '50%', transform: 'translateX(-50%)',
        }}
      />
      {/* Collar / shoulders */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '35%',
          background: `linear-gradient(180deg, transparent 0%, ${color}11 40%, ${color}22 100%)`,
          borderRadius: '60% 60% 0 0',
        }}
      />
      {/* Eyes */}
      <div className="absolute flex gap-3" style={{ top: '32%', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="w-2 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <div className="w-2 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      {/* Ambient animation */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${color}33 0%, transparent 50%)`,
          animation: 'factionPulse 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export default function FactionSelect() {
  const { gameState, dispatch } = useGame();
  const [stars] = useState(generateStars);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const [randomQuote, setRandomQuote] = useState<string>('');
  const factions = FACTIONS;
  const selectedFaction = factions.find((f) => f.id === selectedId);

  // Update random quote when faction selection changes
  useEffect(() => {
    if (selectedFaction) {
      setRandomQuote(getRandomQuote(selectedFaction));
    }
  }, [selectedId]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleBeginJourney = () => {
    if (selectedId) {
      audioEngine.playSfx('confirm');
      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          playerFactionId: selectedId,
          factions: factions,
        },
      });
      dispatch({ type: 'SET_PHASE', payload: 'landing' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col select-none">
      {/* Starfield background */}
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

      {/* Nebula */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #8B4513 0%, transparent 70%)',
          top: '-10%', right: '-5%',
        }}
      />

      {/* Header */}
      <div
        className="relative z-10 text-center pt-8 pb-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.8s ease-out',
        }}
      >
        <div className="text-xs sm:text-[10px] uppercase tracking-[0.5em] text-cyan-500/50 mb-2">Select Your Faction</div>
        <h1
          className="text-3xl font-bold tracking-wider"
          style={{
            background: 'linear-gradient(180deg, #e0f7fa 0%, #00bcd4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(0,188,212,0.3))',
          }}
        >
          Choose Your Path
        </h1>
      </div>

      {/* Faction cards - scrollable horizontal */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center px-4 overflow-x-auto"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 1s ease-out 0.3s',
        }}
      >
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {factions.map((faction) => {
            const isSelected = selectedId === faction.id;
            const isHovered = hoveredId === faction.id;

            return (
              <button
                key={faction.id}
                onClick={() => { audioEngine.playSfx('select'); setSelectedId(faction.id); }}
                onMouseEnter={() => setHoveredId(faction.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex-shrink-0 w-36 sm:w-48 rounded-lg p-4 transition-all duration-300 cursor-pointer text-left active:scale-[0.98]"
                style={{
                  background: isSelected
                    ? `linear-gradient(180deg, ${faction.color}22 0%, rgba(0,0,0,0.8) 100%)`
                    : 'rgba(5,10,20,0.8)',
                  border: `1px solid ${isSelected ? faction.color : isHovered ? `${faction.color}66` : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isSelected
                    ? `0 0 30px ${faction.color}22, inset 0 0 20px ${faction.color}08`
                    : isHovered
                    ? `0 0 15px ${faction.color}11`
                    : '0 4px 20px rgba(0,0,0,0.3)',
                  transform: isSelected ? 'translateY(-8px) scale(1.02)' : isHovered ? 'translateY(-4px)' : 'translateY(0)',
                }}
              >
                <div className="flex justify-center mb-3">
                  <FactionPortrait faction={faction} size={80} />
                </div>

                <div className="text-center mb-2">
                  <div className="text-sm font-bold tracking-wide" style={{ color: faction.color }}>
                    {faction.name}
                  </div>
                  <div className="text-xs sm:text-[10px] text-gray-500">{faction.leader}</div>
                  <div className="text-[11px] sm:text-[9px] text-gray-600 italic mt-0.5">{faction.ideology}</div>
                </div>

                {/* Bonuses/Penalties */}
                <div className="space-y-1 mt-3">
                  {faction.bonuses.slice(0, 2).map((b, i) => (
                    <div key={i} className="text-[11px] sm:text-[9px] text-green-400/80 flex items-start gap-1">
                      <span className="text-green-500">+</span> {b}
                    </div>
                  ))}
                  {faction.penalties.slice(0, 2).map((p, i) => (
                    <div key={i} className="text-[11px] sm:text-[9px] text-red-400/60 flex items-start gap-1">
                      <span className="text-red-500">-</span> {p}
                    </div>
                  ))}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div
                    className="mt-3 text-center text-[11px] sm:text-[9px] uppercase tracking-widest py-1 rounded"
                    style={{
                      background: `${faction.color}22`,
                      color: faction.color,
                      border: `1px solid ${faction.color}44`,
                    }}
                  >
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected faction detail + Begin button */}
      <div
        className="relative z-10 px-8 py-4"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.5))',
        }}
      >
        {selectedFaction ? (
          <div className="max-w-2xl mx-auto flex items-center gap-6">
            <div className="flex-1">
              <div className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                {selectedFaction.backstory}
              </div>
              {randomQuote && (
                <div className="text-[11px] italic mt-1.5 leading-relaxed line-clamp-2" style={{ color: `${selectedFaction.color}99` }}>
                  {randomQuote}
                </div>
              )}
            </div>
            <button
              onClick={handleBeginJourney}
              className="flex-shrink-0 px-8 py-3 text-sm uppercase tracking-[0.3em] font-bold transition-all duration-300 cursor-pointer"
              style={{
                background: `${selectedFaction.color}22`,
                border: `1px solid ${selectedFaction.color}`,
                color: selectedFaction.color,
                boxShadow: `0 0 25px ${selectedFaction.color}33`,
              }}
            >
              Begin Journey
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-600 text-sm italic">
            Select a faction to begin your journey to Planet
          </div>
        )}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes factionPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
