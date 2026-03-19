import React, { useState, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { Technology, TechCategory, UnitType } from '../game/types';

type DatalinkTab = 'technologies' | 'units' | 'buildings';

const CATEGORY_COLORS: Record<TechCategory, string> = {
  explore: '#4ade80',
  discover: '#60a5fa',
  build: '#f59e0b',
  conquer: '#ef4444',
};

const UNIT_DATA: Record<UnitType, { name: string; description: string; attack: number; defense: number; movement: number }> = {
  scout: { name: 'Scout Patrol', description: 'Light reconnaissance unit. Fast and expendable, scouts map the unknown terrain of Planet.', attack: 1, defense: 1, movement: 2 },
  colony: { name: 'Colony Pod', description: 'Carries colonists and equipment to establish new bases. Consumed upon founding.', attack: 0, defense: 1, movement: 1 },
  infantry: { name: 'Garrison Infantry', description: 'Standard defensive unit. The backbone of any faction\'s military forces.', attack: 1, defense: 2, movement: 1 },
  rover: { name: 'Recon Rover', description: 'Fast wheeled vehicle for scouting and raiding. Excels on open terrain.', attack: 2, defense: 1, movement: 3 },
  artillery: { name: 'Artillery Battery', description: 'Long-range bombardment unit. Attacks from distance but vulnerable in close combat.', attack: 4, defense: 1, movement: 1 },
  needlejet: { name: 'Needlejet', description: 'Atmospheric fighter aircraft. Devastating attack power but must return to base each turn.', attack: 5, defense: 2, movement: 8 },
  speeder: { name: 'Speeder', description: 'Hover vehicle capable of traversing any terrain at speed.', attack: 3, defense: 2, movement: 4 },
  mindworm: { name: 'Mind Worm', description: 'Native psychic life form of Planet. Attacks the mind directly, bypassing conventional armor.', attack: 3, defense: 3, movement: 1 },
};

const BUILDING_DATA = [
  { id: 'recycling_tanks', name: 'Recycling Tanks', description: 'Converts waste into usable resources. +1 Nutrients, +1 Minerals, +1 Energy.', cost: 60, category: 'infrastructure' },
  { id: 'network_node', name: 'Network Node', description: 'Links base to the planetary datalinks network. +50% Research output.', cost: 50, category: 'research' },
  { id: 'recreation_commons', name: 'Recreation Commons', description: 'Provides entertainment and relaxation facilities. Reduces drone unrest.', cost: 40, category: 'psych' },
  { id: 'perimeter_defense', name: 'Perimeter Defense', description: 'Defensive fortifications around the base. +100% Defense for garrison units.', cost: 80, category: 'military' },
  { id: 'command_center', name: 'Command Center', description: 'Military command post. All units built here receive +1 Morale.', cost: 60, category: 'military' },
  { id: 'pressure_dome', name: 'Pressure Dome', description: 'Seals the base against Planet\'s atmosphere. Required for bases over size 7.', cost: 100, category: 'infrastructure' },
  { id: 'hab_complex', name: 'Hab Complex', description: 'Expands habitation capacity. Required for bases over size 11.', cost: 120, category: 'infrastructure' },
  { id: 'research_hospital', name: 'Research Hospital', description: 'Advanced medical facility. +25% Research, reduces drone unrest.', cost: 100, category: 'research' },
  { id: 'energy_bank', name: 'Energy Bank', description: 'Stores and manages energy credits. +50% Energy output.', cost: 80, category: 'economy' },
  { id: 'tree_farm', name: 'Tree Farm', description: 'Cultivates Earth vegetation on Planet. +1 Nutrients per forest square, +50% Psych.', cost: 80, category: 'infrastructure' },
  { id: 'aerospace_complex', name: 'Aerospace Complex', description: 'Enables construction of air units and orbital improvements.', cost: 140, category: 'military' },
  { id: 'bioenhancement_center', name: 'Bioenhancement Center', description: 'Genetic modification facility. +2 Morale for all units.', cost: 160, category: 'military' },
];

export default function DatalinksPanel() {
  const { gameState, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<DatalinkTab>('technologies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const allTechs = useMemo(() => Object.values(gameState.technologies), [gameState.technologies]);
  const playerResearched = gameState.researchedTechs[gameState.playerFactionId] || [];

  const filteredTechs = useMemo(() => {
    if (!searchQuery) return allTechs;
    const q = searchQuery.toLowerCase();
    return allTechs.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [allTechs, searchQuery]);

  const filteredUnits = useMemo(() => {
    if (!searchQuery) return Object.entries(UNIT_DATA);
    const q = searchQuery.toLowerCase();
    return Object.entries(UNIT_DATA).filter(([_, u]) => u.name.toLowerCase().includes(q) || u.description.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredBuildings = useMemo(() => {
    if (!searchQuery) return BUILDING_DATA;
    const q = searchQuery.toLowerCase();
    return BUILDING_DATA.filter((b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(2,4,12,0.98)' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
        style={{
          borderBottom: '1px solid rgba(0,188,212,0.12)',
          background: 'linear-gradient(180deg, rgba(0,15,30,0.9) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-1">Planetary Database</div>
            <h2 className="text-xl font-bold tracking-wider text-cyan-300">Datalinks</h2>
          </div>

          {/* Search */}
          <div className="relative ml-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search database..."
              className="w-64 px-4 py-1.5 text-xs bg-gray-900/50 border border-gray-700/50 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-700/50 font-mono"
              style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">
              ⌕
            </span>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'SET_PHASE', payload: gameState.phase === 'datalinks' ? 'title' : 'playing' })}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer border border-gray-700 hover:border-cyan-700 rounded"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-gray-800/50">
        {([
          { key: 'technologies' as DatalinkTab, label: 'Technologies', count: allTechs.length },
          { key: 'units' as DatalinkTab, label: 'Units', count: Object.keys(UNIT_DATA).length },
          { key: 'buildings' as DatalinkTab, label: 'Buildings', count: BUILDING_DATA.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedItemId(null); }}
            className="px-6 py-3 text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
            style={{
              color: activeTab === tab.key ? '#00bcd4' : '#666',
              borderBottom: activeTab === tab.key ? '2px solid #00bcd4' : '2px solid transparent',
              background: activeTab === tab.key ? 'rgba(0,188,212,0.05)' : 'transparent',
            }}
          >
            {tab.label}
            <span className="ml-2 text-[9px] text-gray-600">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div
          className="w-96 flex-shrink-0 overflow-y-auto border-r border-gray-800/30"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          {activeTab === 'technologies' && (
            <div>
              {filteredTechs.length === 0 ? (
                <div className="text-gray-700 text-xs text-center py-8 italic">No matching technologies</div>
              ) : (
                filteredTechs.map((tech) => {
                  const isResearched = playerResearched.includes(tech.id);
                  const catColor = CATEGORY_COLORS[tech.category];
                  return (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedItemId(tech.id)}
                      className="w-full p-3 text-left transition-all duration-150 cursor-pointer border-b border-gray-800/20"
                      style={{
                        background: selectedItemId === tech.id ? 'rgba(0,188,212,0.08)' : 'transparent',
                        borderLeft: selectedItemId === tech.id ? '3px solid #00bcd4' : '3px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: catColor }} />
                        <span className="text-sm" style={{ color: isResearched ? catColor : '#aaa' }}>
                          {tech.name}
                        </span>
                        {isResearched && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-green-900/30 text-green-500 uppercase">
                            Researched
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1 ml-4 truncate">{tech.description}</div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'units' && (
            <div>
              {filteredUnits.map(([type, unit]) => (
                <button
                  key={type}
                  onClick={() => setSelectedItemId(type)}
                  className="w-full p-3 text-left transition-all duration-150 cursor-pointer border-b border-gray-800/20"
                  style={{
                    background: selectedItemId === type ? 'rgba(0,188,212,0.08)' : 'transparent',
                    borderLeft: selectedItemId === type ? '3px solid #00bcd4' : '3px solid transparent',
                  }}
                >
                  <div className="text-sm text-gray-200">{unit.name}</div>
                  <div className="flex gap-3 mt-1 text-[9px] font-mono">
                    <span className="text-red-400">ATK {unit.attack}</span>
                    <span className="text-blue-400">DEF {unit.defense}</span>
                    <span className="text-green-400">MOV {unit.movement}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'buildings' && (
            <div>
              {filteredBuildings.map((bldg) => (
                <button
                  key={bldg.id}
                  onClick={() => setSelectedItemId(bldg.id)}
                  className="w-full p-3 text-left transition-all duration-150 cursor-pointer border-b border-gray-800/20"
                  style={{
                    background: selectedItemId === bldg.id ? 'rgba(0,188,212,0.08)' : 'transparent',
                    borderLeft: selectedItemId === bldg.id ? '3px solid #00bcd4' : '3px solid transparent',
                  }}
                >
                  <div className="text-sm text-gray-200">{bldg.name}</div>
                  <div className="flex gap-3 mt-1 text-[9px]">
                    <span className="text-amber-400 font-mono">{bldg.cost}M</span>
                    <span className="text-gray-600 uppercase tracking-wider">{bldg.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedItemId ? (
            <DetailView
              tab={activeTab}
              itemId={selectedItemId}
              techs={gameState.technologies}
              playerResearched={playerResearched}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-700 text-5xl mb-4">◈</div>
                <div className="text-gray-600 text-sm">Select an entry to view details</div>
                <div className="text-gray-700 text-xs mt-1 italic">Datalinks database online</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer scanlines */}
      <div className="flex-shrink-0 h-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,188,212,0.015) 2px, rgba(0,188,212,0.015) 4px)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-700 tracking-[0.5em] uppercase font-mono">
          Datalinks v2.4.1 -- Planetary Information Network -- {Object.keys(gameState.technologies).length} entries indexed
        </div>
      </div>
    </div>
  );
}

function DetailView({
  tab,
  itemId,
  techs,
  playerResearched,
}: {
  tab: DatalinkTab;
  itemId: string;
  techs: Record<string, Technology>;
  playerResearched: string[];
}) {
  if (tab === 'technologies') {
    const tech = techs[itemId];
    if (!tech) return <div className="text-gray-600">Entry not found</div>;
    const catColor = CATEGORY_COLORS[tech.category];
    const isResearched = playerResearched.includes(tech.id);

    return (
      <div className="max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ background: catColor }} />
          <h3 className="text-2xl font-bold tracking-wide" style={{ color: catColor }}>
            {tech.name}
          </h3>
          {isResearched && (
            <span className="text-[9px] px-2 py-0.5 rounded bg-green-900/30 text-green-400 uppercase tracking-wider">
              Researched
            </span>
          )}
        </div>

        <div className="flex gap-4 mb-4 text-[10px]">
          <span className="uppercase tracking-widest px-2 py-1 rounded" style={{ background: `${catColor}15`, color: catColor }}>
            {tech.category}
          </span>
          <span className="text-gray-500">Tier {tech.tier}</span>
          <span className="text-gray-500 font-mono">Cost: {tech.cost} RP</span>
        </div>

        <div
          className="p-4 rounded-lg mb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Description</div>
          <p className="text-sm text-gray-300 leading-relaxed">{tech.description}</p>
        </div>

        {tech.flavor && (
          <div
            className="p-4 rounded-lg mb-4 italic"
            style={{ background: `${catColor}08`, border: `1px solid ${catColor}15` }}
          >
            <p className="text-sm leading-relaxed" style={{ color: `${catColor}bb` }}>
              "{tech.flavor}"
            </p>
            {tech.quoteAuthor && (
              <p className="text-[10px] text-gray-600 mt-2 not-italic">-- {tech.quoteAuthor}</p>
            )}
          </div>
        )}

        {tech.prerequisites.length > 0 && (
          <div className="mb-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Prerequisites</div>
            <div className="flex flex-wrap gap-2">
              {tech.prerequisites.map((pId) => {
                const p = techs[pId];
                const pResearched = playerResearched.includes(pId);
                return (
                  <span
                    key={pId}
                    className="text-[10px] px-2 py-1 rounded font-mono"
                    style={{
                      background: pResearched ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${pResearched ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      color: pResearched ? '#4ade80' : '#666',
                    }}
                  >
                    {p?.name || pId}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {tech.unlocks.length > 0 && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Unlocks</div>
            <div className="flex flex-wrap gap-2">
              {tech.unlocks.map((u, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ background: `${catColor}11`, border: `1px solid ${catColor}22`, color: catColor }}
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'units') {
    const unit = UNIT_DATA[itemId as UnitType];
    if (!unit) return <div className="text-gray-600">Entry not found</div>;

    return (
      <div className="max-w-lg">
        <h3 className="text-2xl font-bold tracking-wide text-cyan-300 mb-4">{unit.name}</h3>

        <div
          className="p-4 rounded-lg mb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Description</div>
          <p className="text-sm text-gray-300 leading-relaxed">{unit.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Attack" value={unit.attack} color="#ef4444" />
          <StatCard label="Defense" value={unit.defense} color="#60a5fa" />
          <StatCard label="Movement" value={unit.movement} color="#4ade80" />
        </div>
      </div>
    );
  }

  if (tab === 'buildings') {
    const bldg = BUILDING_DATA.find((b) => b.id === itemId);
    if (!bldg) return <div className="text-gray-600">Entry not found</div>;

    return (
      <div className="max-w-lg">
        <h3 className="text-2xl font-bold tracking-wide text-cyan-300 mb-2">{bldg.name}</h3>
        <div className="flex gap-3 mb-4 text-[10px]">
          <span className="text-amber-400 font-mono">Cost: {bldg.cost} Minerals</span>
          <span className="text-gray-600 uppercase tracking-wider">{bldg.category}</span>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Description</div>
          <p className="text-sm text-gray-300 leading-relaxed">{bldg.description}</p>
        </div>
      </div>
    );
  }

  return null;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="p-3 rounded-lg text-center"
      style={{ background: `${color}08`, border: `1px solid ${color}22` }}
    >
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">{label}</div>
    </div>
  );
}
