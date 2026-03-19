import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { HexTile, Unit, Base, TerrainType } from '../game/types';

interface HexMapProps {
  onTileClick?: (q: number, r: number) => void;
  onUnitSelect?: (unitId: string) => void;
  viewportX?: number;
  viewportY?: number;
}

const HEX_SIZE = 36;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

const TERRAIN_COLORS: Record<TerrainType, string> = {
  fungus: '#8B4513',
  rocky: '#696969',
  arid: '#DAA520',
  fertile: '#228B22',
  ocean: '#1E3A5F',
  geothermal: '#FF4500',
  xenoforest: '#006400',
  crater: '#4A4A4A',
  mesa: '#CD853F',
  deepocean: '#0A1628',
};

function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_WIDTH * (q + r * 0.5);
  const y = HEX_HEIGHT * 0.75 * r;
  return { x, y };
}

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function TerrainPattern({ terrain, id }: { terrain: TerrainType; id: string }) {
  switch (terrain) {
    case 'fungus':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill="#8B4513" />
          <circle cx="3" cy="3" r="1.5" fill="#8B008B" opacity="0.6" />
          <circle cx="9" cy="8" r="1" fill="#9932CC" opacity="0.5" />
          <circle cx="6" cy="11" r="1.2" fill="#8B008B" opacity="0.4" />
        </pattern>
      );
    case 'rocky':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill="#696969" />
          <path d="M0 8 L4 4 L8 7 L12 3 L16 8" stroke="#555" strokeWidth="1" fill="none" />
          <path d="M2 14 L6 10 L10 13 L14 9" stroke="#5a5a5a" strokeWidth="0.8" fill="none" />
        </pattern>
      );
    case 'fertile':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="10" height="10">
          <rect width="10" height="10" fill="#228B22" />
          <line x1="0" y1="3" x2="10" y2="3" stroke="#1a7a1a" strokeWidth="0.5" />
          <line x1="0" y1="7" x2="10" y2="7" stroke="#1a7a1a" strokeWidth="0.5" />
        </pattern>
      );
    case 'ocean':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="20" height="8">
          <rect width="20" height="8" fill="#1E3A5F" />
          <path d="M0 4 Q5 1 10 4 Q15 7 20 4" stroke="#2a5a8f" strokeWidth="0.7" fill="none" opacity="0.5" />
        </pattern>
      );
    case 'geothermal':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="14" height="14">
          <rect width="14" height="14" fill="#FF4500" />
          <circle cx="7" cy="7" r="4" fill="#FF6600" opacity="0.4" />
          <circle cx="7" cy="7" r="2" fill="#FFAA00" opacity="0.3" />
        </pattern>
      );
    case 'xenoforest':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="14" height="14">
          <rect width="14" height="14" fill="#006400" />
          <path d="M7 2 L4 8 L10 8 Z" fill="#008800" opacity="0.5" />
          <circle cx="3" cy="12" r="2" fill="#00AA00" opacity="0.3" />
          <path d="M11 10 Q12 7 13 10" stroke="#00CC00" strokeWidth="0.8" fill="none" opacity="0.4" />
        </pattern>
      );
    case 'crater':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill="#4A4A4A" />
          <circle cx="8" cy="8" r="5" fill="none" stroke="#3a3a3a" strokeWidth="1" />
          <circle cx="8" cy="8" r="3" fill="#404040" opacity="0.5" />
        </pattern>
      );
    case 'mesa':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill="#CD853F" />
          <rect x="2" y="2" width="8" height="4" fill="#D4956A" opacity="0.4" rx="1" />
          <line x1="0" y1="8" x2="12" y2="8" stroke="#B8733A" strokeWidth="0.5" />
        </pattern>
      );
    case 'deepocean':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="20" height="10">
          <rect width="20" height="10" fill="#0A1628" />
          <path d="M0 5 Q5 2 10 5 Q15 8 20 5" stroke="#0f2040" strokeWidth="0.5" fill="none" opacity="0.4" />
        </pattern>
      );
    default:
      return null;
  }
}

function UnitIcon({ unit, cx, cy }: { unit: Unit; cx: number; cy: number }) {
  const faction = unit.factionId;
  const color = '#00ffcc'; // fallback, will be overridden
  return (
    <g>
      <circle cx={cx} cy={cy} r="10" fill="rgba(0,0,0,0.6)" stroke={color} strokeWidth="1.5" />
      {unit.type === 'scout' && (
        <path d={`M${cx - 4} ${cy + 3} L${cx} ${cy - 5} L${cx + 4} ${cy + 3} Z`} fill={color} />
      )}
      {unit.type === 'colony' && (
        <>
          <rect x={cx - 4} y={cy - 4} width="8" height="8" fill={color} rx="1" />
          <circle cx={cx} cy={cy} r="2" fill="rgba(0,0,0,0.5)" />
        </>
      )}
      {unit.type === 'infantry' && (
        <>
          <line x1={cx - 4} y1={cy + 4} x2={cx} y2={cy - 5} stroke={color} strokeWidth="2" />
          <line x1={cx} y1={cy - 5} x2={cx + 4} y2={cy + 4} stroke={color} strokeWidth="2" />
          <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke={color} strokeWidth="1.5" />
        </>
      )}
      {unit.type === 'rover' && (
        <>
          <rect x={cx - 5} y={cy - 3} width="10" height="6" fill={color} rx="2" />
          <circle cx={cx - 3} cy={cy + 4} r="2" fill={color} />
          <circle cx={cx + 3} cy={cy + 4} r="2" fill={color} />
        </>
      )}
      {unit.type === 'artillery' && (
        <>
          <rect x={cx - 5} y={cy - 1} width="10" height="5" fill={color} rx="1" />
          <line x1={cx - 2} y1={cy - 1} x2={cx + 4} y2={cy - 6} stroke={color} strokeWidth="2" />
        </>
      )}
      {unit.type === 'needlejet' && (
        <path d={`M${cx} ${cy - 6} L${cx + 5} ${cy + 4} L${cx} ${cy + 1} L${cx - 5} ${cy + 4} Z`} fill={color} />
      )}
      {unit.type === 'speeder' && (
        <path d={`M${cx - 5} ${cy} L${cx} ${cy - 4} L${cx + 5} ${cy} L${cx} ${cy + 4} Z`} fill={color} />
      )}
      {unit.type === 'mindworm' && (
        <path d={`M${cx - 4} ${cy} Q${cx - 2} ${cy - 4} ${cx} ${cy} Q${cx + 2} ${cy + 4} ${cx + 4} ${cy}`} stroke="#ff00ff" strokeWidth="2" fill="none" />
      )}
    </g>
  );
}

function BaseIcon({ base, cx, cy }: { base: Base; cx: number; cy: number }) {
  return (
    <g>
      {/* Glow effect */}
      <circle cx={cx} cy={cy} r="14" fill="none" stroke="#00ffcc" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Diamond shape */}
      <polygon
        points={`${cx},${cy - 12} ${cx + 10},${cy} ${cx},${cy + 12} ${cx - 10},${cy}`}
        fill="rgba(0,255,200,0.15)"
        stroke="#00ffcc"
        strokeWidth="2"
      />
      {/* Inner diamond */}
      <polygon
        points={`${cx},${cy - 6} ${cx + 5},${cy} ${cx},${cy + 6} ${cx - 5},${cy}`}
        fill="#00ffcc"
        opacity="0.4"
      />
      {/* Population number */}
      <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
        {base.population}
      </text>
      {/* Base name */}
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#ccffee" fontSize="7" fontFamily="monospace">
        {base.name}
      </text>
    </g>
  );
}

export default function HexMap({ onTileClick, onUnitSelect, viewportX = 0, viewportY = 0 }: HexMapProps) {
  const { gameState, dispatch } = useGame();
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: viewportX, y: viewportY });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<HexTile | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ q: number; r: number } | null>(null);
  const [selectionPulse, setSelectionPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectionPulse((p) => (p + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
  }, []);

  // Touch event handlers for mobile panning and pinch-to-zoom
  const touchStartRef = useRef<{ x: number; y: number; dist: number | null }>({ x: 0, y: 0, dist: null });

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: null };
    } else if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      touchStartRef.current = { ...touchStartRef.current, dist };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
    } else if (e.touches.length === 2) {
      const newDist = getTouchDistance(e.touches);
      const oldDist = touchStartRef.current.dist;
      if (newDist && oldDist) {
        const scale = newDist / oldDist;
        setZoom((z) => Math.max(0.3, Math.min(3, z * scale)));
        touchStartRef.current.dist = newDist;
      }
    }
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    touchStartRef.current = { x: 0, y: 0, dist: null };
  }, []);

  const handleTileClick = useCallback((tile: HexTile) => {
    setSelectedTile({ q: tile.q, r: tile.r });
    if (tile.unit) {
      dispatch({ type: 'SELECT_UNIT', payload: tile.unit.id });
      onUnitSelect?.(tile.unit.id);
    } else if (tile.base) {
      dispatch({ type: 'SELECT_BASE', payload: tile.base.id });
    }
    onTileClick?.(tile.q, tile.r);
  }, [dispatch, onTileClick, onUnitSelect]);

  const allTiles = useMemo(() => {
    const tiles: HexTile[] = [];
    for (const row of gameState.map) {
      for (const tile of row) {
        if (tile) tiles.push(tile);
      }
    }
    return tiles;
  }, [gameState.map]);

  const units = gameState.units;
  const bases = gameState.bases;
  const playerFactionId = gameState.playerFactionId;

  const patternIds = useMemo(() => {
    const terrainTypes: TerrainType[] = [
      'fungus', 'rocky', 'arid', 'fertile', 'ocean', 'geothermal',
      'xenoforest', 'crater', 'mesa', 'deepocean',
    ];
    return terrainTypes;
  }, []);

  return (
    <div
      className="w-full h-full bg-gray-950 overflow-hidden relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        onWheel={handleWheel}
        style={{ userSelect: 'none' }}
      >
        <defs>
          {/* Fog of war gradient */}
          <radialGradient id="fogGrad">
            <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.9)" />
          </radialGradient>
          {/* Selection glow filter */}
          <filter id="selectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Geothermal glow */}
          <filter id="thermalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Terrain patterns */}
          {patternIds.map((t) => (
            <TerrainPattern key={t} terrain={t} id={`pattern-${t}`} />
          ))}
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render hex tiles */}
          {allTiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r);
            const isExplored = tile.explored[playerFactionId];
            const isSelected = selectedTile?.q === tile.q && selectedTile?.r === tile.r;
            const isHovered = hoveredTile?.q === tile.q && hoveredTile?.r === tile.r;
            const points = hexPoints(x, y, HEX_SIZE);
            const hasFill = ['fungus', 'rocky', 'fertile', 'ocean', 'geothermal', 'xenoforest', 'crater', 'mesa', 'deepocean'].includes(tile.terrain);

            return (
              <g key={tile.id}>
                {/* Hex fill */}
                <polygon
                  points={points}
                  fill={hasFill ? `url(#pattern-${tile.terrain})` : TERRAIN_COLORS[tile.terrain]}
                  stroke={isSelected ? '#00ffcc' : isHovered ? '#00bcd4' : '#1a2a3a'}
                  strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                  opacity={isExplored ? 1 : 0.2}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => handleTileClick(tile)}
                  onMouseEnter={() => setHoveredTile(tile)}
                  onMouseLeave={() => setHoveredTile(null)}
                  filter={tile.terrain === 'geothermal' ? 'url(#thermalGlow)' : undefined}
                />

                {/* Xenolife indicators */}
                {isExplored && tile.xenoLifeLevel === 1 && (
                  <circle cx={x} cy={y + HEX_SIZE * 0.3} r="2" fill="#9932CC" opacity="0.7" />
                )}
                {isExplored && tile.xenoLifeLevel === 2 && (
                  <g>
                    <circle cx={x - 4} cy={y + HEX_SIZE * 0.25} r="1.8" fill="#9932CC" opacity="0.7" />
                    <circle cx={x + 4} cy={y + HEX_SIZE * 0.3} r="1.5" fill="#8B008B" opacity="0.6" />
                    <circle cx={x} cy={y + HEX_SIZE * 0.38} r="1.3" fill="#BA55D3" opacity="0.5" />
                  </g>
                )}
                {isExplored && tile.xenoLifeLevel >= 3 && (
                  <g>
                    <circle cx={x} cy={y} r="10" fill="#9932CC" opacity="0.08">
                      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.06;0.15;0.06" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x - 5} cy={y + HEX_SIZE * 0.2} r="1.8" fill="#9932CC" opacity="0.8" />
                    <circle cx={x + 5} cy={y + HEX_SIZE * 0.25} r="1.5" fill="#8B008B" opacity="0.7" />
                    <circle cx={x} cy={y + HEX_SIZE * 0.35} r="2" fill="#BA55D3" opacity="0.7" />
                    <circle cx={x + 2} cy={y + HEX_SIZE * 0.15} r="1.2" fill="#DA70D6" opacity="0.5" />
                  </g>
                )}

                {/* Selection animation */}
                {isSelected && (
                  <polygon
                    points={hexPoints(x, y, HEX_SIZE + 2)}
                    fill="none"
                    stroke="#00ffcc"
                    strokeWidth="1.5"
                    opacity={0.3 + 0.3 * Math.sin(selectionPulse * Math.PI / 180)}
                    filter="url(#selectionGlow)"
                  />
                )}

                {/* Fog of war overlay */}
                {!isExplored && (
                  <polygon
                    points={points}
                    fill="url(#fogGrad)"
                    pointerEvents="none"
                  />
                )}

                {/* Improvement indicator */}
                {tile.improvement && isExplored && (
                  <text
                    x={x}
                    y={y + HEX_SIZE * 0.55}
                    textAnchor="middle"
                    fill="#aaffcc"
                    fontSize="6"
                    fontFamily="monospace"
                    opacity="0.7"
                  >
                    {tile.improvement}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render bases */}
          {bases.map((base) => {
            const { x, y } = hexToPixel(base.q, base.r);
            const tile = allTiles.find((t) => t.q === base.q && t.r === base.r);
            if (tile && !tile.explored[playerFactionId]) return null;
            return <BaseIcon key={base.id} base={base} cx={x} cy={y} />;
          })}

          {/* Render units */}
          {units.map((unit) => {
            const { x, y } = hexToPixel(unit.q, unit.r);
            const tile = allTiles.find((t) => t.q === unit.q && t.r === unit.r);
            if (tile && !tile.explored[playerFactionId]) return null;
            const isUnitSelected = gameState.selectedUnitId === unit.id;
            return (
              <g key={unit.id}>
                {isUnitSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="none"
                    stroke="#00ffcc"
                    strokeWidth="1"
                    opacity={0.4 + 0.3 * Math.sin(selectionPulse * Math.PI / 180)}
                  >
                    <animate attributeName="r" values="16;20;16" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <UnitIcon unit={unit} cx={x} cy={y} />
                {/* HP bar */}
                {unit.hp < unit.maxHp && (
                  <g>
                    <rect x={x - 8} y={y + 12} width="16" height="2" fill="#333" rx="1" />
                    <rect
                      x={x - 8}
                      y={y + 12}
                      width={16 * (unit.hp / unit.maxHp)}
                      height="2"
                      fill={unit.hp / unit.maxHp > 0.5 ? '#00ff88' : unit.hp / unit.maxHp > 0.25 ? '#ffaa00' : '#ff3333'}
                      rx="1"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Resource tooltip on hover */}
      {hoveredTile && (
        <div
          className="absolute pointer-events-none z-50 bg-gray-900/95 border border-cyan-700/50 rounded px-3 py-2 text-xs font-mono"
          style={{
            left: '16px',
            bottom: '16px',
            boxShadow: '0 0 15px rgba(0,188,212,0.15)',
          }}
        >
          <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
            {hoveredTile.terrain} ({hoveredTile.q}, {hoveredTile.r})
          </div>
          <div className="flex gap-3 text-[11px]">
            <span className="text-green-400">
              N: {hoveredTile.resources.nutrients}
            </span>
            <span className="text-amber-400">
              M: {hoveredTile.resources.minerals}
            </span>
            <span className="text-yellow-300">
              E: {hoveredTile.resources.energy}
            </span>
          </div>
          {hoveredTile.xenoLifeLevel > 0 && (
            <div className="text-purple-400 mt-1 text-[10px]">
              Xeno Life: {'*'.repeat(hoveredTile.xenoLifeLevel)}
            </div>
          )}
        </div>
      )}

      {/* Minimap coordinates */}
      <div className="absolute top-2 right-2 bg-gray-900/80 border border-cyan-800/30 rounded px-2 py-1 text-[10px] font-mono text-cyan-500">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>

      <style>{`
        @keyframes hexPulse {
          0%, 100% { stroke-opacity: 0.3; }
          50% { stroke-opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
