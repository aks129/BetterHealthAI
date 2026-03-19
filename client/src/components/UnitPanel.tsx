import React, { useState, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { foundBase } from '../game/engine';
import { Unit, UnitType } from '../game/types';

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  scout: 'Scout Patrol',
  colony: 'Colony Pod',
  infantry: 'Garrison Infantry',
  rover: 'Recon Rover',
  artillery: 'Artillery Battery',
  needlejet: 'Needlejet',
  speeder: 'Speeder',
  mindworm: 'Mind Worm',
};

function UnitTypeIcon({ type, size = 40 }: { type: UnitType; size?: number }) {
  const c = size / 2;
  const color = '#00ffcc';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {type === 'scout' && (
        <polygon points={`${c},${c - 14} ${c + 10},${c + 10} ${c - 10},${c + 10}`} fill="none" stroke={color} strokeWidth="2" />
      )}
      {type === 'colony' && (
        <>
          <rect x={c - 10} y={c - 10} width="20" height="20" fill="none" stroke={color} strokeWidth="2" rx="3" />
          <circle cx={c} cy={c} r="5" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={c} cy={c} r="2" fill={color} />
        </>
      )}
      {type === 'infantry' && (
        <>
          <line x1={c - 10} y1={c + 12} x2={c} y2={c - 14} stroke={color} strokeWidth="2.5" />
          <line x1={c} y1={c - 14} x2={c + 10} y2={c + 12} stroke={color} strokeWidth="2.5" />
          <line x1={c - 7} y1={c + 2} x2={c + 7} y2={c + 2} stroke={color} strokeWidth="2" />
        </>
      )}
      {type === 'rover' && (
        <>
          <rect x={c - 12} y={c - 6} width="24" height="12" fill="none" stroke={color} strokeWidth="2" rx="4" />
          <circle cx={c - 6} cy={c + 8} r="3" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={c + 6} cy={c + 8} r="3" fill="none" stroke={color} strokeWidth="1.5" />
        </>
      )}
      {type === 'artillery' && (
        <>
          <rect x={c - 10} y={c - 2} width="20" height="10" fill="none" stroke={color} strokeWidth="2" rx="2" />
          <line x1={c - 4} y1={c - 2} x2={c + 8} y2={c - 14} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {type === 'needlejet' && (
        <polygon points={`${c},${c - 15} ${c + 12},${c + 10} ${c},${c + 4} ${c - 12},${c + 10}`} fill="none" stroke={color} strokeWidth="2" />
      )}
      {type === 'speeder' && (
        <polygon points={`${c - 14},${c} ${c},${c - 10} ${c + 14},${c} ${c},${c + 10}`} fill="none" stroke={color} strokeWidth="2" />
      )}
      {type === 'mindworm' && (
        <path d={`M${c - 12} ${c} Q${c - 6} ${c - 10} ${c} ${c} Q${c + 6} ${c + 10} ${c + 12} ${c}`} stroke="#ff00ff" strokeWidth="2.5" fill="none" />
      )}
    </svg>
  );
}

export default function UnitPanel() {
  const { gameState, dispatch } = useGame();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const selectedUnit = useMemo(() => {
    if (!gameState.selectedUnitId) return null;
    return gameState.units.find((u) => u.id === gameState.selectedUnitId) || null;
  }, [gameState.selectedUnitId, gameState.units]);

  if (!selectedUnit) return null;

  const faction = gameState.factions.find((f) => f.id === selectedUnit.factionId);
  const factionColor = faction?.color || '#00ffcc';
  const hpPercent = (selectedUnit.hp / selectedUnit.maxHp) * 100;
  const hpColor = hpPercent > 60 ? '#00ff88' : hpPercent > 30 ? '#ffaa00' : '#ff3333';
  const isPlayerUnit = selectedUnit.factionId === gameState.playerFactionId;

  const actions = isPlayerUnit
    ? [
        { key: 'move', label: 'Move', icon: 'M', enabled: selectedUnit.movementLeft > 0 },
        { key: 'attack', label: 'Attack', icon: 'A', enabled: selectedUnit.attack > 0 && selectedUnit.movementLeft > 0 },
        { key: 'fortify', label: 'Fortify', icon: 'F', enabled: true },
        ...(selectedUnit.type === 'colony'
          ? [{ key: 'found', label: 'Found Base', icon: 'B', enabled: true }]
          : []),
        { key: 'disband', label: 'Disband', icon: 'X', enabled: true },
      ]
    : [];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div
        className="mx-auto max-w-2xl rounded-t-lg overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,18,32,0.97) 0%, rgba(5,10,20,0.99) 100%)',
          border: `1px solid ${factionColor}33`,
          borderBottom: 'none',
          boxShadow: `0 -4px 30px rgba(0,0,0,0.5), 0 0 20px ${factionColor}11`,
        }}
      >
        {/* Top accent bar */}
        <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${factionColor}, transparent)` }} />

        <div className="flex items-center gap-4 p-4">
          {/* Unit icon */}
          <div
            className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center"
            style={{
              background: `${factionColor}11`,
              border: `1px solid ${factionColor}44`,
            }}
          >
            <UnitTypeIcon type={selectedUnit.type} />
          </div>

          {/* Unit info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm tracking-wide" style={{ color: factionColor }}>
                {selectedUnit.name}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                {UNIT_TYPE_LABELS[selectedUnit.type]}
              </span>
              {selectedUnit.veterancy > 0 && (
                <span className="text-yellow-400 text-[10px]">
                  {'★'.repeat(selectedUnit.veterancy)}
                </span>
              )}
            </div>

            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">HP</span>
                <span className="text-[10px] font-mono" style={{ color: hpColor }}>
                  {selectedUnit.hp}/{selectedUnit.maxHp}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${hpPercent}%`,
                    background: `linear-gradient(90deg, ${hpColor}cc, ${hpColor})`,
                    boxShadow: `0 0 6px ${hpColor}66`,
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-[11px] font-mono">
              <StatChip label="ATK" value={selectedUnit.attack} color="#ff6666" />
              <StatChip label="DEF" value={selectedUnit.defense} color="#6699ff" />
              <StatChip label="MOV" value={`${selectedUnit.movementLeft}/${selectedUnit.movement}`} color="#66ffcc" />
            </div>
          </div>

          {/* Action buttons */}
          {isPlayerUnit && (
            <div className="flex-shrink-0 flex flex-wrap gap-1.5 max-w-[200px]">
              {actions.map((action) => (
                <button
                  key={action.key}
                  disabled={!action.enabled}
                  onClick={() => {
                    if (action.key === 'found' && selectedUnit) {
                      const newState = foundBase(gameState, selectedUnit.id);
                      if (newState !== gameState) dispatch({ type: 'UPDATE_STATE', payload: newState });
                    } else if (action.key === 'disband' && selectedUnit) {
                      dispatch({ type: 'UPDATE_STATE', payload: { units: gameState.units.filter(u => u.id !== selectedUnit.id), selectedUnitId: null } });
                    }
                  }}
                  onMouseEnter={() => setHoveredAction(action.key)}
                  onMouseLeave={() => setHoveredAction(null)}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: hoveredAction === action.key && action.enabled
                      ? `${action.key === 'disband' ? '#ff3333' : factionColor}22`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hoveredAction === action.key && action.enabled
                      ? (action.key === 'disband' ? '#ff3333' : factionColor)
                      : '#333'}`,
                    color: hoveredAction === action.key && action.enabled
                      ? (action.key === 'disband' ? '#ff3333' : factionColor)
                      : '#777',
                  }}
                >
                  <span className="mr-1 opacity-50">[{action.icon}]</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => dispatch({ type: 'SELECT_UNIT', payload: null })}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-600">{label}</span>
      <span style={{ color }} className="font-bold">{value}</span>
    </div>
  );
}
