import React, { useState, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { Base } from '../game/types';

const FACILITY_ICONS: Record<string, string> = {
  'Recycling Tanks': '♻',
  'Network Node': '◉',
  'Recreation Commons': '♫',
  'Pressure Dome': '◎',
  'Command Center': '⚔',
  'Perimeter Defense': '⛊',
  'Hab Complex': '⌂',
  'Research Hospital': '✚',
  'Energy Bank': '⚡',
  'Tree Farm': '🌿',
  'Aerospace Complex': '△',
  'Bioenhancement Center': '◈',
};

const BUILD_OPTIONS = [
  { id: 'scout', name: 'Scout Patrol', cost: 20, type: 'unit' },
  { id: 'colony', name: 'Colony Pod', cost: 100, type: 'unit' },
  { id: 'infantry', name: 'Garrison Infantry', cost: 30, type: 'unit' },
  { id: 'rover', name: 'Recon Rover', cost: 40, type: 'unit' },
  { id: 'recycling_tanks', name: 'Recycling Tanks', cost: 60, type: 'facility' },
  { id: 'network_node', name: 'Network Node', cost: 50, type: 'facility' },
  { id: 'recreation_commons', name: 'Recreation Commons', cost: 40, type: 'facility' },
  { id: 'perimeter_defense', name: 'Perimeter Defense', cost: 80, type: 'facility' },
  { id: 'command_center', name: 'Command Center', cost: 60, type: 'facility' },
  { id: 'pressure_dome', name: 'Pressure Dome', cost: 100, type: 'facility' },
];

export default function BasePanel() {
  const { gameState, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'overview' | 'build'>('overview');
  const [hoveredFacility, setHoveredFacility] = useState<string | null>(null);

  const selectedBase = useMemo(() => {
    if (!gameState.selectedBaseId) return null;
    return gameState.bases.find((b) => b.id === gameState.selectedBaseId) || null;
  }, [gameState.selectedBaseId, gameState.bases]);

  if (!selectedBase) return null;

  const faction = gameState.factions.find((f) => f.id === selectedBase.factionId);
  const factionColor = faction?.color || '#00ffcc';
  const moralePercent = selectedBase.morale;
  const moraleColor = moralePercent > 60 ? '#00ff88' : moralePercent > 30 ? '#ffaa00' : '#ff3333';
  const currentBuild = selectedBase.productionQueue[0] || null;
  const buildItem = BUILD_OPTIONS.find((b) => b.id === currentBuild);
  const buildProgress = buildItem ? Math.min(100, (selectedBase.productionProgress / buildItem.cost) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-[700px] max-h-[80vh] overflow-hidden rounded-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(8,14,28,0.99) 0%, rgba(4,8,16,0.99) 100%)',
          border: `1px solid ${factionColor}33`,
          boxShadow: `0 0 40px rgba(0,0,0,0.7), 0 0 20px ${factionColor}11`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            borderBottom: `1px solid ${factionColor}22`,
            background: `linear-gradient(90deg, ${factionColor}08, transparent)`,
          }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">Base Management</div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-wide" style={{ color: factionColor }}>
                {selectedBase.name}
              </h2>
              <div className="text-gray-500 text-xs font-mono">
                ({selectedBase.q}, {selectedBase.r})
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SELECT_BASE', payload: null })}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer border border-gray-700 hover:border-cyan-700 rounded"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {(['overview', 'build'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
              style={{
                color: activeTab === tab ? factionColor : '#666',
                borderBottom: activeTab === tab ? `2px solid ${factionColor}` : '2px solid transparent',
                background: activeTab === tab ? `${factionColor}08` : 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {activeTab === 'overview' ? (
            <div className="space-y-5">
              {/* Population & Morale */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-3 rounded"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Population</div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-mono" style={{ color: factionColor }}>
                      {selectedBase.population}
                    </span>
                    <span className="text-gray-500 text-xs mb-1">citizens</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: selectedBase.population }, (_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ background: `${factionColor}66`, border: `1px solid ${factionColor}` }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="p-3 rounded"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Morale</div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold font-mono" style={{ color: moraleColor }}>
                      {moralePercent}%
                    </span>
                    <span className="text-gray-500 text-xs mb-1">
                      {moralePercent > 70 ? 'Thriving' : moralePercent > 40 ? 'Content' : 'Unrest'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${moralePercent}%`,
                        background: `linear-gradient(90deg, ${moraleColor}cc, ${moraleColor})`,
                        boxShadow: `0 0 8px ${moraleColor}44`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Resource Production */}
              <div
                className="p-3 rounded"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3">Resource Production</div>
                <div className="grid grid-cols-3 gap-4">
                  <ResourceBar label="Nutrients" value={selectedBase.nutrients} max={20} color="#4ade80" icon="N" />
                  <ResourceBar label="Minerals" value={selectedBase.minerals} max={20} color="#f59e0b" icon="M" />
                  <ResourceBar label="Energy" value={selectedBase.energy} max={20} color="#facc15" icon="E" />
                </div>
              </div>

              {/* Production Queue */}
              <div
                className="p-3 rounded"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3">Production Queue</div>
                {currentBuild ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-cyan-300">
                        {buildItem?.name || currentBuild}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {selectedBase.productionProgress}/{buildItem?.cost || '?'} minerals
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${buildProgress}%`,
                          background: 'linear-gradient(90deg, #f59e0baa, #f59e0b)',
                          boxShadow: '0 0 8px #f59e0b44',
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      ~{buildItem ? Math.max(1, Math.ceil((buildItem.cost - selectedBase.productionProgress) / Math.max(1, selectedBase.minerals))) : '?'} turns remaining
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm italic">No production queued</div>
                )}

                {/* Rest of queue */}
                {selectedBase.productionQueue.length > 1 && (
                  <div className="mt-3 space-y-1">
                    {selectedBase.productionQueue.slice(1).map((item, i) => {
                      const opt = BUILD_OPTIONS.find((b) => b.id === item);
                      return (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-500 py-1 border-t border-gray-800/50">
                          <span>{i + 2}. {opt?.name || item}</span>
                          <span className="font-mono">{opt?.cost || '?'}M</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Facilities */}
              <div
                className="p-3 rounded"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3">Facilities</div>
                {selectedBase.facilities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBase.facilities.map((facility) => (
                      <div
                        key={facility}
                        onMouseEnter={() => setHoveredFacility(facility)}
                        onMouseLeave={() => setHoveredFacility(null)}
                        className="flex items-center gap-2 p-2 rounded transition-all duration-200"
                        style={{
                          background: hoveredFacility === facility ? `${factionColor}11` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${hoveredFacility === facility ? `${factionColor}33` : 'rgba(255,255,255,0.03)'}`,
                        }}
                      >
                        <span className="text-base" style={{ color: factionColor }}>
                          {FACILITY_ICONS[facility] || '◆'}
                        </span>
                        <span className="text-xs text-gray-300">{facility}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm italic">No facilities built</div>
                )}
              </div>
            </div>
          ) : (
            /* Build Tab */
            <div className="space-y-4">
              <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Select Production</div>

              {/* Units */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-cyan-600 mb-2">Units</div>
                <div className="space-y-1">
                  {BUILD_OPTIONS.filter((b) => b.type === 'unit').map((item) => (
                    <BuildOption key={item.id} item={item} factionColor={factionColor} base={selectedBase} />
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-cyan-600 mb-2">Facilities</div>
                <div className="space-y-1">
                  {BUILD_OPTIONS.filter((b) => b.type === 'facility').map((item) => {
                    const alreadyBuilt = selectedBase.facilities.includes(item.name);
                    return (
                      <BuildOption
                        key={item.id}
                        item={item}
                        factionColor={factionColor}
                        base={selectedBase}
                        disabled={alreadyBuilt}
                        disabledReason={alreadyBuilt ? 'Already built' : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer scanline effect */}
        <div
          className="h-8 relative overflow-hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(${factionColor === '#00bcd4' ? '0,188,212' : '0,255,200'},0.02) 2px, rgba(0,255,200,0.02) 4px)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] text-gray-700 tracking-[0.5em] uppercase">
            Terminal Active
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          <span style={{ color }} className="font-bold">{icon}</span> {label}
        </span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(value / max) * 100}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 4px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

function BuildOption({
  item,
  factionColor,
  base,
  disabled = false,
  disabledReason,
}: {
  item: { id: string; name: string; cost: number; type: string };
  factionColor: string;
  base: Base;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const turnsNeeded = Math.max(1, Math.ceil(item.cost / Math.max(1, base.minerals)));

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center justify-between p-2 rounded transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-left"
      style={{
        background: hovered && !disabled ? `${factionColor}11` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered && !disabled ? `${factionColor}33` : 'rgba(255,255,255,0.03)'}`,
      }}
    >
      <div>
        <span className="text-sm text-gray-200">{item.name}</span>
        {disabledReason && <span className="text-[10px] text-gray-600 ml-2">({disabledReason})</span>}
      </div>
      <div className="text-right">
        <div className="text-[10px] font-mono text-amber-400">{item.cost}M</div>
        <div className="text-[9px] text-gray-600">{turnsNeeded}T</div>
      </div>
    </button>
  );
}
