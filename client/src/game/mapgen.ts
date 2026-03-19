import { HexTile, TerrainType, ResourceType } from './types';

// Seeded pseudo-random number generator (Mulberry32)
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Simple 2D noise function using hash-based interpolation
function noise2D(x: number, y: number, seed: number): number {
  const hash = (a: number, b: number): number => {
    let h = seed + a * 374761393 + b * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h & 0x7fffffff) / 0x7fffffff;
  };

  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // Smoothstep interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);

  return nx0 + sy * (nx1 - nx0);
}

// Multi-octave noise for more natural terrain
function fbm(x: number, y: number, seed: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency, seed + i * 1000);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

function getTerrainFromNoise(elevation: number, moisture: number, temperature: number): TerrainType {
  // Deep ocean
  if (elevation < 0.25) return 'deepocean';
  // Ocean
  if (elevation < 0.38) return 'ocean';
  // Coastal / low areas
  if (elevation < 0.42) {
    if (moisture > 0.7) return 'xenoforest';
    return 'fertile';
  }
  // Mid elevation
  if (elevation < 0.6) {
    if (moisture > 0.75) return 'xenoforest';
    if (moisture > 0.55) return 'fertile';
    if (moisture > 0.35) return 'fungus';
    return 'arid';
  }
  // High elevation
  if (elevation < 0.75) {
    if (temperature > 0.7) return 'geothermal';
    if (moisture > 0.5) return 'fungus';
    return 'rocky';
  }
  // Mountain tops
  if (elevation < 0.85) return 'mesa';
  // Craters (rare high points)
  return 'crater';
}

function getResources(terrain: TerrainType): Record<ResourceType, number> {
  const resources: Record<TerrainType, Record<ResourceType, number>> = {
    fungus: { nutrients: 1, minerals: 0, energy: 1 },
    rocky: { nutrients: 0, minerals: 2, energy: 0 },
    arid: { nutrients: 0, minerals: 1, energy: 1 },
    fertile: { nutrients: 3, minerals: 0, energy: 1 },
    ocean: { nutrients: 1, minerals: 0, energy: 1 },
    geothermal: { nutrients: 0, minerals: 1, energy: 3 },
    xenoforest: { nutrients: 2, minerals: 1, energy: 0 },
    crater: { nutrients: 0, minerals: 3, energy: 1 },
    mesa: { nutrients: 0, minerals: 2, energy: 1 },
    deepocean: { nutrients: 1, minerals: 0, energy: 0 },
  };
  return resources[terrain];
}

export function generateMap(width: number, height: number, seed?: number): HexTile[][] {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000);
  const rng = seededRandom(actualSeed);
  const map: HexTile[][] = [];

  // Generate noise layers
  const elevationSeed = actualSeed;
  const moistureSeed = actualSeed + 5000;
  const temperatureSeed = actualSeed + 10000;
  const detailSeed = actualSeed + 15000;

  for (let r = 0; r < height; r++) {
    const row: HexTile[] = [];
    for (let q = 0; q < width; q++) {
      const nx = q / width;
      const ny = r / height;
      const scale = 6.0;

      // Generate multi-octave noise for each layer
      let elevation = fbm(nx * scale, ny * scale, elevationSeed, 5);
      const moisture = fbm(nx * scale * 0.8, ny * scale * 0.8, moistureSeed, 4);
      const temperature = fbm(nx * scale * 0.6, ny * scale * 0.6, temperatureSeed, 3);
      const detail = fbm(nx * scale * 2, ny * scale * 2, detailSeed, 3);

      // Add island-like falloff from edges (make edges more likely ocean)
      const dx = (nx - 0.5) * 2;
      const dy = (ny - 0.5) * 2;
      const edgeDist = 1 - Math.sqrt(dx * dx + dy * dy) * 0.7;
      elevation = elevation * 0.7 + edgeDist * 0.3;

      // Add some detail variation
      elevation += detail * 0.1;

      const terrain = getTerrainFromNoise(elevation, moisture, temperature);
      const resources = getResources(terrain);

      // Add bonus resources randomly
      if (rng() > 0.9) {
        const keys: ResourceType[] = ['nutrients', 'minerals', 'energy'];
        const bonus = keys[Math.floor(rng() * 3)];
        resources[bonus] += 1;
      }

      const xenoLife = terrain === 'fungus' ? Math.floor(rng() * 3) + 1 :
                       terrain === 'xenoforest' ? Math.floor(rng() * 2) + 1 :
                       rng() > 0.85 ? 1 : 0;

      row.push({
        id: `${q},${r}`,
        q, r,
        terrain,
        resources,
        explored: {},
        xenoLifeLevel: xenoLife,
      });
    }
    map.push(row);
  }

  // Post-processing: add fungus clusters
  for (let r = 1; r < height - 1; r++) {
    for (let q = 1; q < width - 1; q++) {
      if (map[r][q].terrain === 'fungus') {
        // Spread fungus to some neighbors
        const neighbors = hexNeighbors(q, r);
        for (const [nq, nr] of neighbors) {
          if (nq >= 0 && nq < width && nr >= 0 && nr < height) {
            if (map[nr][nq].terrain !== 'ocean' && map[nr][nq].terrain !== 'deepocean' && rng() > 0.65) {
              if (map[nr][nq].terrain === 'fertile' || map[nr][nq].terrain === 'arid') {
                // Only partially spread
                if (rng() > 0.5) {
                  map[nr][nq].xenoLifeLevel = Math.min(3, map[nr][nq].xenoLifeLevel + 1);
                }
              }
            }
          }
        }
      }
    }
  }

  return map;
}

// Find suitable starting positions for factions (spread out on land)
export function findStartPositions(map: HexTile[][], count: number): { q: number; r: number }[] {
  const height = map.length;
  const width = map[0].length;
  const landTiles: { q: number; r: number }[] = [];

  for (let r = 2; r < height - 2; r++) {
    for (let q = 2; q < width - 2; q++) {
      const terrain = map[r][q].terrain;
      if (terrain !== 'ocean' && terrain !== 'deepocean' && terrain !== 'crater') {
        // Prefer fertile/xenoforest for starting
        landTiles.push({ q, r });
      }
    }
  }

  // Greedy placement: maximize minimum distance between starts
  const positions: { q: number; r: number }[] = [];
  if (landTiles.length === 0) return positions;

  // Place first in a random-ish good spot
  const centerIdx = Math.floor(landTiles.length / 2);
  positions.push(landTiles[centerIdx]);

  while (positions.length < count && landTiles.length > 0) {
    let bestTile = landTiles[0];
    let bestMinDist = -1;

    for (const tile of landTiles) {
      const minDist = Math.min(...positions.map(p => hexDistance(tile.q, tile.r, p.q, p.r)));
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestTile = tile;
      }
    }

    positions.push(bestTile);
    // Remove nearby tiles from candidates
    const idx = landTiles.indexOf(bestTile);
    if (idx > -1) landTiles.splice(idx, 1);
  }

  return positions;
}

// Hex coordinate utilities
export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  // Convert axial (offset) to cube coordinates for distance
  const x1 = q1 - Math.floor(r1 / 2);
  const z1 = r1;
  const y1 = -x1 - z1;
  const x2 = q2 - Math.floor(r2 / 2);
  const z2 = r2;
  const y2 = -x2 - z2;
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), Math.abs(z1 - z2));
}

export function hexNeighbors(q: number, r: number): [number, number][] {
  // Offset coordinates (even-r)
  if (r % 2 === 0) {
    return [
      [q + 1, r], [q, r - 1], [q - 1, r - 1],
      [q - 1, r], [q - 1, r + 1], [q, r + 1]
    ];
  } else {
    return [
      [q + 1, r], [q + 1, r - 1], [q, r - 1],
      [q - 1, r], [q, r + 1], [q + 1, r + 1]
    ];
  }
}

export function hexToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * (r % 2));
  const y = size * (3 / 2 * r);
  return { x, y };
}

export function pixelToHex(px: number, py: number, size: number): { q: number; r: number } {
  const r = Math.round(py / (size * 3 / 2));
  const q = Math.round((px - (r % 2) * size * Math.sqrt(3) / 2) / (size * Math.sqrt(3)));
  return { q: Math.max(0, q), r: Math.max(0, r) };
}
