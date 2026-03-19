import React, { useState, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { Faction, DiplomacyState } from '../game/types';

const RELATIONSHIP_COLORS: Record<string, string> = {
  allied: '#4ade80',
  pact: '#60a5fa',
  treaty: '#a78bfa',
  neutral: '#9ca3af',
  vendetta: '#ef4444',
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  allied: 'Allied',
  pact: 'Pact of Brotherhood',
  treaty: 'Treaty of Friendship',
  neutral: 'Neutral',
  vendetta: 'Blood Vendetta',
};

function LeaderPortrait({ faction, size = 80 }: { faction: Faction; size?: number }) {
  const color = faction.color || '#888';
  return (
    <div
      className="relative rounded-lg overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `
          linear-gradient(135deg, ${color}33 0%, ${color}11 40%, rgba(0,0,0,0.8) 100%),
          radial-gradient(ellipse at 50% 30%, ${color}22 0%, transparent 60%)
        `,
        border: `1px solid ${color}44`,
      }}
    >
      {/* Abstract face silhouette */}
      <div
        className="absolute"
        style={{
          width: size * 0.45,
          height: size * 0.55,
          borderRadius: '50% 50% 45% 45%',
          background: `linear-gradient(180deg, ${color}33 0%, ${color}11 60%, transparent 100%)`,
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      {/* Eyes glow */}
      <div
        className="absolute flex gap-2"
        style={{ top: '38%', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="w-1.5 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <div className="w-1.5 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      {/* Animated background shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, transparent 40%, ${color}0a 50%, transparent 60%)`,
          animation: 'portraitShimmer 4s ease-in-out infinite',
        }}
      />
      {/* Faction initial */}
      <div
        className="absolute bottom-1 right-1.5 text-[8px] font-bold opacity-50"
        style={{ color }}
      >
        {faction.name.charAt(0)}
      </div>
    </div>
  );
}

function OpinionMeter({ value, color }: { value: number; color: string }) {
  const normalized = ((value + 100) / 200) * 100;
  const barColor = value > 30 ? '#4ade80' : value > 0 ? '#a3e635' : value > -30 ? '#fbbf24' : value > -60 ? '#f97316' : '#ef4444';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[9px] mb-1">
        <span className="text-gray-600">-100</span>
        <span className="font-mono font-bold" style={{ color: barColor }}>{value > 0 ? '+' : ''}{value}</span>
        <span className="text-gray-600">+100</span>
      </div>
      <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-600 z-10" />
        {/* Fill from center */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-500"
          style={{
            left: value >= 0 ? '50%' : `${normalized}%`,
            width: value >= 0 ? `${normalized - 50}%` : `${50 - normalized}%`,
            background: barColor,
            boxShadow: `0 0 6px ${barColor}44`,
          }}
        />
      </div>
    </div>
  );
}

export default function DiplomacyPanel() {
  const { gameState, dispatch } = useGame();
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [leaderQuote, setLeaderQuote] = useState<string | null>(null);

  const playerFactionId = gameState.playerFactionId;
  const playerFaction = gameState.factions.find((f) => f.id === playerFactionId);
  const otherFactions = gameState.factions.filter((f) => f.id !== playerFactionId);

  const getDiplomacy = (targetId: string): DiplomacyState | undefined => {
    return gameState.diplomacy.find(
      (d) => d.factionId === playerFactionId && d.targetFactionId === targetId
    );
  };

  const handleAction = (action: string, faction: Faction) => {
    setActiveDialogue(action);
    const quotes = faction.quotes || [];
    const quote = quotes[Math.floor(Math.random() * Math.max(1, quotes.length))] || `The ${faction.name} consider your proposal...`;
    setLeaderQuote(quote);
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(2,4,12,0.97)' }}>
      {/* Left sidebar - Faction list */}
      <div
        className="w-80 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          borderRight: '1px solid rgba(0,188,212,0.1)',
          background: 'linear-gradient(180deg, rgba(5,10,25,0.95) 0%, rgba(3,6,15,0.98) 100%)',
        }}
      >
        <div className="px-5 py-4 border-b border-gray-800/50">
          <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-1">Planetary Council</div>
          <h2 className="text-lg font-bold tracking-wider text-cyan-300">Diplomacy</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {otherFactions.map((faction) => {
            const diplo = getDiplomacy(faction.id);
            const relationship = diplo?.relationship || 'neutral';
            const relColor = RELATIONSHIP_COLORS[relationship];
            const isSelected = selectedFaction?.id === faction.id;

            return (
              <button
                key={faction.id}
                onClick={() => {
                  setSelectedFaction(faction);
                  setActiveDialogue(null);
                  setLeaderQuote(null);
                }}
                className="w-full p-4 flex items-center gap-3 transition-all duration-200 cursor-pointer text-left"
                style={{
                  background: isSelected ? `${faction.color}11` : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  borderLeft: isSelected ? `3px solid ${faction.color}` : '3px solid transparent',
                }}
              >
                <LeaderPortrait faction={faction} size={50} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: faction.color }}>
                    {faction.name}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{faction.leader}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: relColor }} />
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: relColor }}>
                      {RELATIONSHIP_LABELS[relationship]}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel - Selected faction details */}
      <div className="flex-1 flex flex-col">
        {/* Close button */}
        <div className="flex-shrink-0 px-6 py-3 flex justify-end border-b border-gray-800/30">
          <button
            onClick={() => dispatch({ type: 'SET_PHASE', payload: 'playing' })}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer border border-gray-700 hover:border-cyan-700 rounded"
          >
            ✕
          </button>
        </div>

        {selectedFaction ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-xl mx-auto">
              {/* Leader portrait large */}
              <div className="flex items-start gap-6 mb-8">
                <LeaderPortrait faction={selectedFaction} size={120} />
                <div>
                  <h3 className="text-2xl font-bold tracking-wide" style={{ color: selectedFaction.color }}>
                    {selectedFaction.fullName || selectedFaction.name}
                  </h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {selectedFaction.leaderTitle} {selectedFaction.leader}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 italic">{selectedFaction.ideology}</div>

                  {/* Relationship */}
                  {(() => {
                    const diplo = getDiplomacy(selectedFaction.id);
                    const relationship = diplo?.relationship || 'neutral';
                    const opinion = diplo?.opinion || 0;
                    return (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: RELATIONSHIP_COLORS[relationship] }} />
                          <span className="text-xs uppercase tracking-wider" style={{ color: RELATIONSHIP_COLORS[relationship] }}>
                            {RELATIONSHIP_LABELS[relationship]}
                          </span>
                        </div>
                        <OpinionMeter value={opinion} color={selectedFaction.color} />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Personality traits */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3">Personality Profile</div>
                <div className="grid grid-cols-5 gap-2">
                  {selectedFaction.personality && Object.entries(selectedFaction.personality).map(([trait, val]) => (
                    <div key={trait} className="text-center">
                      <div
                        className="w-full h-16 rounded relative overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                      >
                        <div
                          className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                          style={{
                            height: `${(val as number) * 10}%`,
                            background: `${selectedFaction.color}66`,
                          }}
                        />
                      </div>
                      <div className="text-[8px] uppercase tracking-wider text-gray-500 mt-1">{trait}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dialogue actions */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3">Diplomatic Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'treaty', label: 'Propose Treaty', icon: '🤝', color: '#a78bfa' },
                    { key: 'vendetta', label: 'Declare Vendetta', icon: '⚔', color: '#ef4444' },
                    { key: 'trade', label: 'Trade Technology', icon: '🔬', color: '#60a5fa' },
                    { key: 'pact', label: 'Form Pact', icon: '🛡', color: '#4ade80' },
                  ].map((action) => (
                    <button
                      key={action.key}
                      onClick={() => handleAction(action.key, selectedFaction)}
                      className="p-3 rounded text-left transition-all duration-200 cursor-pointer group"
                      style={{
                        background: activeDialogue === action.key ? `${action.color}11` : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${activeDialogue === action.key ? `${action.color}44` : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      <div className="text-sm mb-0.5" style={{ color: action.color }}>
                        {action.label}
                      </div>
                      <div className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">
                        {action.key === 'treaty' && 'Establish formal diplomatic relations'}
                        {action.key === 'vendetta' && 'Sever all ties and declare hostility'}
                        {action.key === 'trade' && 'Exchange technological knowledge'}
                        {action.key === 'pact' && 'Forge a deep alliance'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Leader quote response */}
              {leaderQuote && (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: `${selectedFaction.color}08`,
                    border: `1px solid ${selectedFaction.color}22`,
                    animation: 'fadeSlideIn 0.3s ease-out',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <LeaderPortrait faction={selectedFaction} size={40} />
                    <div>
                      <div className="text-xs font-bold mb-1" style={{ color: selectedFaction.color }}>
                        {selectedFaction.leader} responds:
                      </div>
                      <div className="text-sm text-gray-300 italic">"{leaderQuote}"</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-700 text-6xl mb-4">◉</div>
              <div className="text-gray-600 text-sm">Select a faction to begin diplomacy</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes portraitShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
