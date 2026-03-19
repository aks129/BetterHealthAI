import React, { useState, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { processTurn } from '../game/engine';
import { audioEngine } from '../game/audio';

export default function TopBar() {
  const { gameState, dispatch } = useGame();
  const [turnAnimating, setTurnAnimating] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const playerFaction = gameState.factions.find((f) => f.id === gameState.playerFactionId);
  const playerBases = gameState.bases.filter((b) => b.factionId === gameState.playerFactionId);
  const factionColor = playerFaction?.color || '#00bcd4';

  const totalNutrients = playerBases.reduce((s, b) => s + b.nutrients, 0);
  const totalMinerals = playerBases.reduce((s, b) => s + b.minerals, 0);
  const totalEnergy = playerBases.reduce((s, b) => s + b.energy, 0);

  const [muted, setMuted] = useState(audioEngine.muted);
  const [showVolume, setShowVolume] = useState(false);
  const [musicVol, setMusicVol] = useState(Math.round(audioEngine.musicVolume * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(audioEngine.sfxVolume * 100));

  const handleEndTurn = () => {
    audioEngine.playSfx('endturn');
    setTurnAnimating(true);
    setTimeout(() => setTurnAnimating(false), 600);
    const newState = processTurn(gameState);
    dispatch({ type: 'END_TURN', payload: newState });
  };

  const buttons = [
    { key: 'endturn', label: 'End Turn', action: handleEndTurn },
    { key: 'research', label: 'Research', action: () => { audioEngine.playSfx('click'); audioEngine.setPhase('research', gameState.playerFactionId); dispatch({ type: 'SET_PHASE', payload: 'research' }); } },
    { key: 'diplomacy', label: 'Diplomacy', action: () => { audioEngine.playSfx('click'); audioEngine.setPhase('diplomacy', gameState.playerFactionId); dispatch({ type: 'SET_PHASE', payload: 'diplomacy' }); } },
    { key: 'datalinks', label: 'Datalinks', action: () => { audioEngine.playSfx('click'); dispatch({ type: 'SET_PHASE', payload: 'datalinks' }); } },
  ];

  return (
    <div
      className="w-full h-14 flex items-center justify-between px-4 select-none relative z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,30,0.98) 0%, rgba(5,10,20,0.95) 100%)',
        borderBottom: `1px solid ${factionColor}33`,
        boxShadow: `0 2px 20px rgba(0,0,0,0.5), inset 0 -1px 0 ${factionColor}22`,
      }}
    >
      {/* Left: Faction info + Turn */}
      <div className="flex items-center gap-6">
        {/* Faction badge */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center text-xs font-bold"
            style={{
              background: `${factionColor}22`,
              border: `1px solid ${factionColor}66`,
              color: factionColor,
              boxShadow: `0 0 10px ${factionColor}22`,
            }}
          >
            {playerFaction?.name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider" style={{ color: factionColor }}>
              {playerFaction?.name || 'Unknown'}
            </div>
            <div className="text-[10px] text-gray-500 tracking-wide">
              {playerFaction?.leader || ''}
            </div>
          </div>
        </div>

        {/* Turn / Year */}
        <div className="flex items-center gap-2 border-l border-gray-700/50 pl-4">
          <div
            className={`transition-all duration-300 ${turnAnimating ? 'scale-125 text-white' : ''}`}
          >
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Turn</div>
            <div className="text-lg font-bold text-cyan-300 font-mono leading-none">
              {gameState.turn}
            </div>
          </div>
          <div className="text-gray-600 mx-1">|</div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Year</div>
            <div className="text-sm text-gray-300 font-mono leading-none">
              M.Y. {gameState.year}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Resources */}
      <div className="flex items-center gap-5">
        <ResourceDisplay label="Nutrients" value={totalNutrients} color="#4ade80" icon="N" />
        <ResourceDisplay label="Minerals" value={totalMinerals} color="#f59e0b" icon="M" />
        <ResourceDisplay label="Energy" value={totalEnergy} color="#facc15" icon="E" />
      </div>

      {/* Right: Audio controls + Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Audio controls */}
        <div className="relative flex items-center gap-1 mr-2 border-r border-gray-700/50 pr-3">
          <button
            onClick={() => {
              const newMuted = audioEngine.toggleMute();
              setMuted(newMuted);
              if (!newMuted) audioEngine.playSfx('click');
            }}
            className="w-8 h-8 flex items-center justify-center text-xs transition-colors duration-200 cursor-pointer"
            style={{
              color: muted ? '#555' : factionColor,
              opacity: muted ? 0.5 : 0.8,
            }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '♪'}
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="w-6 h-6 flex items-center justify-center text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer transition-colors"
            title="Volume settings"
          >
            ▾
          </button>
          {showVolume && (
            <div
              className="absolute top-full right-0 mt-2 p-3 rounded-lg z-50"
              style={{
                background: 'rgba(10,15,25,0.95)',
                border: `1px solid ${factionColor}33`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                minWidth: '160px',
              }}
            >
              <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Music</div>
              <input
                type="range" min="0" max="100" value={musicVol}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMusicVol(v);
                  audioEngine.setMusicVolume(v / 100);
                }}
                className="w-full h-1 appearance-none rounded-full cursor-pointer mb-3"
                style={{ accentColor: factionColor }}
              />
              <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Effects</div>
              <input
                type="range" min="0" max="100" value={sfxVol}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSfxVol(v);
                  audioEngine.setSfxVolume(v / 100);
                }}
                className="w-full h-1 appearance-none rounded-full cursor-pointer"
                style={{ accentColor: factionColor }}
              />
            </div>
          )}
        </div>

        {buttons.map((btn) => (
          <button
            key={btn.key}
            onClick={btn.action}
            onMouseEnter={() => setHoveredButton(btn.key)}
            onMouseLeave={() => setHoveredButton(null)}
            className="px-2 sm:px-4 py-2 text-[10px] sm:text-xs uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer active:bg-opacity-30"
            style={{
              background: hoveredButton === btn.key
                ? `${btn.key === 'endturn' ? factionColor : '#00bcd4'}22`
                : 'transparent',
              border: `1px solid ${hoveredButton === btn.key
                ? (btn.key === 'endturn' ? factionColor : '#00bcd4')
                : '#333'}`,
              color: hoveredButton === btn.key
                ? (btn.key === 'endturn' ? factionColor : '#00bcd4')
                : '#888',
              boxShadow: hoveredButton === btn.key
                ? `0 0 12px ${btn.key === 'endturn' ? factionColor : '#00bcd4'}33`
                : 'none',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Animated border glow */}
      <div
        className="absolute bottom-0 left-0 h-[1px]"
        style={{
          width: '100%',
          background: `linear-gradient(90deg, transparent 0%, ${factionColor}44 30%, ${factionColor}88 50%, ${factionColor}44 70%, transparent 100%)`,
          animation: 'borderShimmer 4s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes borderShimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

function ResourceDisplay({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-sm flex items-center justify-center text-xs sm:text-[10px] font-bold"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}40`,
          color: color,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[11px] sm:text-[9px] uppercase tracking-widest text-gray-500 hidden sm:block">{label}</div>
        <div className="text-sm font-mono font-bold" style={{ color }}>
          {value}
        </div>
      </div>
    </div>
  );
}
