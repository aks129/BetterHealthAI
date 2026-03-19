import React, { useState, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { Technology, TechCategory } from '../game/types';
import { audioEngine } from '../game/audio';

const CATEGORY_COLORS: Record<TechCategory, string> = {
  explore: '#4ade80',
  discover: '#60a5fa',
  build: '#f59e0b',
  conquer: '#ef4444',
};

const CATEGORY_LABELS: Record<TechCategory, string> = {
  explore: 'Explore',
  discover: 'Discover',
  build: 'Build',
  conquer: 'Conquer',
};

export default function ResearchPanel() {
  const { gameState, dispatch } = useGame();
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  const playerFactionId = gameState.playerFactionId;
  const faction = gameState.factions.find((f) => f.id === playerFactionId);
  const factionColor = faction?.color || '#00bcd4';
  const researchedIds = gameState.researchedTechs[playerFactionId] || [];
  const currentResearchId = gameState.currentResearch[playerFactionId] || null;
  const researchProgress = gameState.researchProgress[playerFactionId] || 0;

  const allTechs = useMemo(() => Object.values(gameState.technologies), [gameState.technologies]);
  const tierGroups = useMemo(() => {
    const groups: Record<number, Technology[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const tech of allTechs) {
      if (groups[tech.tier]) groups[tech.tier].push(tech);
    }
    return groups;
  }, [allTechs]);

  const isResearched = (id: string) => researchedIds.includes(id);
  const isAvailable = (tech: Technology) => {
    if (isResearched(tech.id)) return false;
    return tech.prerequisites.every((p) => researchedIds.includes(p));
  };

  const currentTech = currentResearchId ? gameState.technologies[currentResearchId] : null;
  const progressPercent = currentTech ? Math.min(100, (researchProgress / currentTech.cost) * 100) : 0;

  const handleSelectResearch = (techId: string) => {
    const tech = gameState.technologies[techId];
    if (tech && isAvailable(tech)) {
      setSelectedTechId(techId);
    }
  };

  const confirmResearch = () => {
    if (selectedTechId) {
      dispatch({ type: 'SET_RESEARCH', payload: { factionId: playerFactionId, techId: selectedTechId } });
      setSelectedTechId(null);
    }
  };

  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 60;
  const TIER_GAP = 120;
  const NODE_GAP = 20;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(2,4,12,0.97)' }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
        style={{
          borderBottom: '1px solid rgba(0,188,212,0.15)',
          background: 'linear-gradient(180deg, rgba(0,20,40,0.9) 0%, transparent 100%)',
        }}
      >
        <div>
          <div className="text-xs sm:text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-1">Research Directory</div>
          <h2 className="text-xl font-bold tracking-wider text-cyan-300">Technology Tree</h2>
        </div>

        {/* Current research info */}
        <div className="flex items-center gap-6">
          {currentTech && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Researching</div>
              <div className="text-sm font-medium" style={{ color: CATEGORY_COLORS[currentTech.category] }}>
                {currentTech.name}
              </div>
              <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${CATEGORY_COLORS[currentTech.category]}88, ${CATEGORY_COLORS[currentTech.category]})`,
                    boxShadow: `0 0 8px ${CATEGORY_COLORS[currentTech.category]}44`,
                  }}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                {researchProgress}/{currentTech.cost} research points
              </div>
            </div>
          )}

          {selectedTechId && (
            <button
              onClick={confirmResearch}
              className="px-5 py-2 min-h-[44px] text-xs uppercase tracking-wider font-bold cursor-pointer transition-all duration-200 active:scale-95"
              style={{
                background: `${factionColor}22`,
                border: `1px solid ${factionColor}`,
                color: factionColor,
                boxShadow: `0 0 15px ${factionColor}33`,
              }}
            >
              Confirm Research
            </button>
          )}

          <button
            onClick={() => { audioEngine.playSfx('cancel'); audioEngine.setPhase('playing', gameState.playerFactionId); dispatch({ type: 'SET_PHASE', payload: 'playing' }); }}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-cyan-400 active:text-cyan-400 transition-colors cursor-pointer border border-gray-700 hover:border-cyan-700 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Category legend */}
      <div className="flex-shrink-0 px-6 py-2 flex items-center gap-6 border-b border-gray-800/50">
        {(Object.keys(CATEGORY_COLORS) as TechCategory[]).map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_COLORS[cat] }} />
            <span className="text-xs sm:text-[10px] uppercase tracking-widest text-gray-400">{CATEGORY_LABELS[cat]}</span>
          </div>
        ))}
      </div>

      {/* Tech tree - scrollable */}
      <div className="flex-1 overflow-auto p-8">
        <div className="w-full">
          {[1, 2, 3, 4].map((tier) => {
            const techs = tierGroups[tier] || [];
            return (
              <div key={tier} className="mb-8">
                <div className="text-xs uppercase tracking-[0.5em] text-gray-600 mb-4 pl-2">
                  Tier {tier}
                </div>
                <div className="flex flex-wrap gap-4">
                  {techs.map((tech) => {
                    const researched = isResearched(tech.id);
                    const available = isAvailable(tech);
                    const isCurrent = tech.id === currentResearchId;
                    const isSelected = tech.id === selectedTechId;
                    const isHovered = hoveredTech?.id === tech.id;
                    const catColor = CATEGORY_COLORS[tech.category];

                    return (
                      <div
                        key={tech.id}
                        onClick={() => handleSelectResearch(tech.id)}
                        onMouseEnter={() => setHoveredTech(tech)}
                        onMouseLeave={() => setHoveredTech(null)}
                        className="relative transition-all duration-300"
                        style={{
                          width: '100%',
                          maxWidth: `${NODE_WIDTH}px`,
                          cursor: available ? 'pointer' : 'default',
                          opacity: researched ? 0.5 : available ? 1 : 0.25,
                        }}
                      >
                        {/* Glow for available techs */}
                        {available && !researched && (
                          <div
                            className="absolute -inset-1 rounded-lg"
                            style={{
                              background: `${catColor}08`,
                              border: `1px solid ${catColor}33`,
                              animation: 'techGlow 2s ease-in-out infinite',
                              boxShadow: `0 0 15px ${catColor}11`,
                            }}
                          />
                        )}

                        <div
                          className="relative rounded-lg p-3 transition-all duration-200"
                          style={{
                            background: isSelected
                              ? `${catColor}22`
                              : isHovered && available
                              ? `${catColor}11`
                              : 'rgba(10,15,30,0.8)',
                            border: `1px solid ${
                              isSelected
                                ? catColor
                                : isCurrent
                                ? `${catColor}88`
                                : researched
                                ? `${catColor}44`
                                : available
                                ? `${catColor}33`
                                : 'rgba(255,255,255,0.05)'
                            }`,
                            boxShadow: isSelected
                              ? `0 0 20px ${catColor}33`
                              : isCurrent
                              ? `0 0 15px ${catColor}22`
                              : 'none',
                          }}
                        >
                          {/* Category dot */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: catColor }} />
                            <span
                              className="text-xs font-medium truncate"
                              style={{ color: researched || available ? catColor : '#555' }}
                            >
                              {tech.name}
                            </span>
                          </div>

                          {/* Status badges */}
                          <div className="flex items-center gap-1">
                            {researched && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 uppercase tracking-wider">
                                Done
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 uppercase tracking-wider">
                                Active
                              </span>
                            )}
                            {isSelected && !isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400 uppercase tracking-wider">
                                Selected
                              </span>
                            )}
                          </div>

                          {/* Cost */}
                          <div className="text-[9px] text-gray-600 mt-1 font-mono">
                            Cost: {tech.cost} RP
                          </div>

                          {/* Prerequisites */}
                          {tech.prerequisites.length > 0 && (
                            <div className="text-[8px] text-gray-700 mt-1 truncate">
                              Req: {tech.prerequisites.map((p) => gameState.technologies[p]?.name || p).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover tooltip with flavor text */}
      {hoveredTech && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-lg z-50 pointer-events-none"
          style={{
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(5,10,20,0.97)',
              border: `1px solid ${CATEGORY_COLORS[hoveredTech.category]}44`,
              boxShadow: `0 0 30px rgba(0,0,0,0.8), 0 0 15px ${CATEGORY_COLORS[hoveredTech.category]}11`,
            }}
          >
            <div className="text-sm font-bold mb-1" style={{ color: CATEGORY_COLORS[hoveredTech.category] }}>
              {hoveredTech.name}
            </div>
            <div className="text-xs text-gray-400 mb-2">{hoveredTech.description}</div>
            {hoveredTech.flavor && (
              <div
                className="text-xs italic border-l-2 pl-3 mt-2"
                style={{
                  color: CATEGORY_COLORS[hoveredTech.category] + '88',
                  borderColor: CATEGORY_COLORS[hoveredTech.category] + '44',
                }}
              >
                "{hoveredTech.flavor}"
                {hoveredTech.quoteAuthor && (
                  <span className="block text-[10px] text-gray-600 mt-1 not-italic">
                    -- {hoveredTech.quoteAuthor}
                  </span>
                )}
              </div>
            )}
            {hoveredTech.unlocks.length > 0 && (
              <div className="mt-2 text-[10px] text-gray-500">
                Unlocks: {hoveredTech.unlocks.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes techGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,200,255,0.05); }
          50% { box-shadow: 0 0 20px rgba(0,200,255,0.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
