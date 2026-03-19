import { GameState, Faction, Unit, Base, HexTile, GameMessage, UnitType, DiplomacyState, VictoryProgress } from './types';
import { generateMap, findStartPositions, hexDistance, hexNeighbors } from './mapgen';
import { FACTIONS } from './factions';
import { TECHNOLOGIES, getAvailableTechs } from './technologies';

let nextId = 1;
function genId(): string { return `id_${nextId++}`; }

const BASE_NAMES = [
  'New Dawn', 'Prometheus Landing', 'Stellar Haven', 'Chiron\'s Gate', 'Horizon Point',
  'Unity Base', 'Pioneer\'s Rest', 'Starfall', 'Nexus Prime', 'Ascension',
  'Frontier Post', 'Deep Root', 'Iron Reach', 'Crystal Spire', 'Quantum Field',
  'Mindfire', 'Solar Forge', 'Verdant Hope', 'Storm\'s Eye', 'The Citadel',
  'Twilight Station', 'Zenith Colony', 'Radiant Core', 'Obsidian Tower', 'Aether Point',
  'Chrysalis', 'Vanguard', 'Sanctuary', 'Apex Station', 'The Crucible'
];

let nameIndex = 0;
function getBaseName(): string {
  const name = BASE_NAMES[nameIndex % BASE_NAMES.length];
  nameIndex++;
  return name;
}

export function createNewGame(playerFactionId: string, mapSize: 'small' | 'medium' | 'large'): GameState {
  const sizes = { small: { w: 30, h: 24 }, medium: { w: 44, h: 34 }, large: { w: 60, h: 46 } };
  const { w, h } = sizes[mapSize];

  nameIndex = 0;
  nextId = 1;

  const map = generateMap(w, h);
  const activeFactions = FACTIONS.filter(f => f.id === playerFactionId)
    .concat(FACTIONS.filter(f => f.id !== playerFactionId).slice(0, 6));

  const startPositions = findStartPositions(map, activeFactions.length);
  const units: Unit[] = [];
  const bases: Base[] = [];
  const researchedTechs: Record<string, string[]> = {};
  const currentResearch: Record<string, string> = {};
  const researchProgress: Record<string, number> = {};
  const diplomacy: DiplomacyState[] = [];
  const victoryProgress: Record<string, VictoryProgress> = {};

  activeFactions.forEach((faction, i) => {
    const pos = startPositions[i] || { q: 5 + i * 6, r: 5 + i * 4 };

    // Give starting tech + planetfall
    researchedTechs[faction.id] = ['planetfall_protocols', faction.startingTech];

    // Set initial research
    const available = getAvailableTechs(researchedTechs[faction.id]);
    if (available.length > 0) {
      currentResearch[faction.id] = available[0].id;
    }
    researchProgress[faction.id] = 0;

    // Create starting colony pod
    units.push({
      id: genId(), name: 'Colony Pod', type: 'colony', factionId: faction.id,
      hp: 10, maxHp: 10, attack: 0, defense: 1, movement: 1, movementLeft: 1,
      q: pos.q, r: pos.r, veterancy: 0
    });

    // Create starting scout
    const neighbors = hexNeighbors(pos.q, pos.r);
    const scoutPos = neighbors.find(([nq, nr]) =>
      nq >= 0 && nq < w && nr >= 0 && nr < h &&
      map[nr]?.[nq]?.terrain !== 'ocean' && map[nr]?.[nq]?.terrain !== 'deepocean'
    ) || [pos.q + 1, pos.r];

    // Gaians get extra movement on scouts
    const scoutMovement = faction.personality.xenophilia > 8 ? 3 : 2;
    units.push({
      id: genId(), name: 'Scout Rover', type: 'scout', factionId: faction.id,
      hp: 10, maxHp: 10, attack: 1, defense: 1, movement: scoutMovement, movementLeft: scoutMovement,
      q: scoutPos[0], r: scoutPos[1], veterancy: 0
    });

    // Prometheans (aggression>7) start with an extra Infantry unit
    if (faction.personality.aggression > 7) {
      const infantryNeighbors = hexNeighbors(pos.q, pos.r);
      const infantryPos = infantryNeighbors.find(([nq, nr]) =>
        nq >= 0 && nq < w && nr >= 0 && nr < h &&
        map[nr]?.[nq]?.terrain !== 'ocean' && map[nr]?.[nq]?.terrain !== 'deepocean' &&
        !(nq === scoutPos[0] && nr === scoutPos[1])
      ) || [pos.q, pos.r];
      units.push({
        id: genId(), name: 'Infantry', type: 'infantry', factionId: faction.id,
        hp: 15, maxHp: 15, attack: 2, defense: 2, movement: 1, movementLeft: 1,
        q: infantryPos[0], r: infantryPos[1], veterancy: 0
      });
    }

    // Lucid (research>8) start with extra research progress
    if (faction.personality.research > 8) {
      researchProgress[faction.id] = 10;
    }

    // Explore area around start
    const exploreRadius = 3;
    for (let dr = -exploreRadius; dr <= exploreRadius; dr++) {
      for (let dq = -exploreRadius; dq <= exploreRadius; dq++) {
        const eq = pos.q + dq;
        const er = pos.r + dr;
        if (eq >= 0 && eq < w && er >= 0 && er < h) {
          if (hexDistance(pos.q, pos.r, eq, er) <= exploreRadius) {
            map[er][eq].explored[faction.id] = true;
          }
        }
      }
    }

    // Setup diplomacy with all other factions
    activeFactions.forEach(other => {
      if (other.id !== faction.id) {
        diplomacy.push({
          factionId: faction.id, targetFactionId: other.id,
          relationship: 'neutral', opinion: 0, trades: []
        });
      }
    });

    victoryProgress[faction.id] = {
      factionId: faction.id, transcendence: 0, diplomatic: 0, conquest: 0, economic: 0
    };
  });

  return {
    turn: 1,
    year: 2100,
    phase: 'playing',
    currentFactionIndex: 0,
    factions: activeFactions,
    playerFactionId,
    map, mapWidth: w, mapHeight: h,
    units, bases,
    technologies: TECHNOLOGIES,
    researchedTechs, currentResearch, researchProgress,
    diplomacy,
    selectedUnitId: null, selectedBaseId: null,
    messages: [{
      id: genId(), turn: 1, type: 'story',
      title: 'Planetfall',
      text: `Mission Year 2100. The Unity has reached Alpha Centauri. Your faction, the ${activeFactions[0].fullName}, led by ${activeFactions[0].leader}, has made planetfall on Chiron. A new chapter of human history begins.`
    }],
    councilCalled: false,
    victoryProgress
  };
}

export function processTurn(state: GameState): GameState {
  let newState = { ...state };
  newState.messages = [...state.messages];
  newState.units = state.units.map(u => ({ ...u }));
  newState.bases = state.bases.map(b => ({ ...b }));

  // Reset movement for all units
  newState.units = newState.units.map(u => ({ ...u, movementLeft: u.movement }));

  // Process each faction
  for (const faction of newState.factions) {
    // Process bases - growth, production, energy
    for (let i = 0; i < newState.bases.length; i++) {
      const base = newState.bases[i];
      if (base.factionId !== faction.id) continue;

      const updatedBase = { ...base };

      // Collect resources from surrounding tiles
      let totalNutrients = 0, totalMinerals = 0, totalEnergy = 0;
      const neighbors = hexNeighbors(base.q, base.r);
      const tilesToCheck = [[base.q, base.r] as [number, number], ...neighbors];

      for (const [tq, tr] of tilesToCheck) {
        if (tq >= 0 && tq < newState.mapWidth && tr >= 0 && tr < newState.mapHeight) {
          const tile = newState.map[tr][tq];
          totalNutrients += tile.resources.nutrients;
          totalMinerals += tile.resources.minerals;
          totalEnergy += tile.resources.energy;
        }
      }

      // Apply faction bonuses
      if (faction.id === 'collective') totalNutrients = Math.ceil(totalNutrients * 1.25);
      if (faction.id === 'drones') totalEnergy = Math.ceil(totalEnergy * 1.25);
      if (faction.id === 'nexus') totalMinerals = Math.ceil(totalMinerals * 1.25);

      updatedBase.nutrients += totalNutrients;
      updatedBase.minerals += totalMinerals;
      updatedBase.energy += totalEnergy;

      // Population growth
      const growthThreshold = 20 + updatedBase.population * 10;
      if (updatedBase.nutrients >= growthThreshold) {
        updatedBase.population++;
        updatedBase.nutrients -= growthThreshold;
        if (faction.id === newState.playerFactionId) {
          newState.messages.push({
            id: genId(), turn: newState.turn, type: 'base',
            title: `${updatedBase.name} grows!`,
            text: `${updatedBase.name} has grown to size ${updatedBase.population}.`,
            factionId: faction.id
          });
        }
      }

      // Production
      if (updatedBase.productionQueue.length > 0) {
        updatedBase.productionProgress += totalMinerals;
        const productionCost = getProductionCost(updatedBase.productionQueue[0]);
        if (updatedBase.productionProgress >= productionCost) {
          const item = updatedBase.productionQueue.shift()!;
          updatedBase.productionProgress = 0;
          completeProduction(newState, updatedBase, item, faction);
        }
      }

      newState.bases[i] = updatedBase;
    }

    // Process research
    const factionBases = newState.bases.filter(b => b.factionId === faction.id);
    const researchPoints = factionBases.reduce((sum, b) => sum + b.energy, 0) + 5; // base 5 research
    let adjustedResearch = researchPoints;
    if (faction.id === 'lucid') adjustedResearch = Math.ceil(adjustedResearch * 1.25);
    if (faction.id === 'collective') adjustedResearch = Math.ceil(adjustedResearch * 0.9);
    if (faction.id === 'harmony') adjustedResearch = Math.ceil(adjustedResearch * 0.8);

    if (newState.currentResearch[faction.id]) {
      newState.researchProgress[faction.id] = (newState.researchProgress[faction.id] || 0) + adjustedResearch;
      const techId = newState.currentResearch[faction.id];
      const tech = TECHNOLOGIES[techId];
      if (tech && newState.researchProgress[faction.id] >= tech.cost) {
        // Tech completed
        newState.researchedTechs[faction.id] = [...(newState.researchedTechs[faction.id] || []), techId];
        newState.researchProgress[faction.id] = 0;

        if (faction.id === newState.playerFactionId) {
          newState.messages.push({
            id: genId(), turn: newState.turn, type: 'research',
            title: `${tech.name} Discovered!`,
            text: `${tech.flavor}\n— ${tech.quoteAuthor}\n\nUnlocks: ${tech.unlocks.join(', ')}`,
            factionId: faction.id
          });
        }

        // Auto-select next research for AI
        if (faction.id !== newState.playerFactionId) {
          const available = getAvailableTechs(newState.researchedTechs[faction.id] || []);
          if (available.length > 0) {
            // AI picks based on personality
            const sorted = available.sort((a, b) => {
              let scoreA = 0, scoreB = 0;
              if (a.category === 'conquer') { scoreA += faction.personality.aggression; }
              if (a.category === 'discover') { scoreA += faction.personality.research; }
              if (a.category === 'build') { scoreA += faction.personality.expansion; }
              if (a.category === 'explore') { scoreA += faction.personality.xenophilia; }
              if (b.category === 'conquer') { scoreB += faction.personality.aggression; }
              if (b.category === 'discover') { scoreB += faction.personality.research; }
              if (b.category === 'build') { scoreB += faction.personality.expansion; }
              if (b.category === 'explore') { scoreB += faction.personality.xenophilia; }
              return scoreB - scoreA;
            });
            newState.currentResearch[faction.id] = sorted[0].id;
          }
        } else {
          // Player needs to choose - set phase
          delete newState.currentResearch[faction.id];
        }
      }
    }

    // AI turn processing
    if (faction.id !== newState.playerFactionId) {
      newState = processAI(newState, faction);
    }
  }

  // Advance turn
  newState.turn++;
  newState.year = 2100 + newState.turn - 1;

  // Random events
  if (Math.random() < 0.08) {
    const playerBases = newState.bases.filter(b => b.factionId === newState.playerFactionId);
    const events: { title: string; text: string; effect?: () => void }[] = [
      { title: 'Solar Flare', text: 'A massive solar flare from Alpha Centauri A disrupts communications. Research slowed this turn.',
        effect: () => { newState.researchProgress[newState.playerFactionId] = Math.max(0, (newState.researchProgress[newState.playerFactionId] || 0) - 5); }
      },
      { title: 'Xenofungal Bloom', text: 'A massive bloom of xenofungus spreads across the continent. Fungal tiles nearby grow richer with nutrients.' },
      { title: 'Seismic Activity', text: 'Tectonic shifts beneath the fungal networks shake your settlements. Minor structural damage reported.',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.minerals = Math.max(0, b.minerals - 5); } }
      },
      { title: 'Mindworm Migration', text: 'Large boils of mindworms migrate across the plains. Scouts report heightened psi activity in the region.' },
      { title: 'Orbital Debris', text: 'Fragments of the Unity enter the atmosphere. Salvage teams recover useful materials!',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.minerals += 15; } }
      },
      { title: 'Psi Anomaly', text: 'Strange dreams plague the colony. Sensitive individuals report visions of Planet\'s deep past. Research insights gained!',
        effect: () => { newState.researchProgress[newState.playerFactionId] = (newState.researchProgress[newState.playerFactionId] || 0) + 8; }
      },
      { title: 'Geothermal Vent', text: 'A new geothermal vent erupts near your territory! Energy output surges.',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.energy += 10; } }
      },
      { title: 'Nutrient Bonus', text: 'Unusual rainfall triggers explosive growth in local flora. Nutrient yields increase temporarily.',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.nutrients += 10; } }
      },
      { title: 'Planetquake', text: 'A violent planetquake rocks the continent! Buildings are damaged but the ground reveals rich mineral deposits.',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.minerals += 8; b.morale = Math.max(30, b.morale - 5); } }
      },
      { title: 'Alien Artifact', text: 'Scouts uncover a strange artifact of non-human origin buried in the xenofungus. Analysis yields a research breakthrough!',
        effect: () => { newState.researchProgress[newState.playerFactionId] = (newState.researchProgress[newState.playerFactionId] || 0) + 15; }
      },
      { title: 'Fungal Tower Sighting', text: 'A massive fungal tower has been spotted on the horizon, pulsing with bioluminescent light. Planet is watching.' },
      { title: 'Unity Supply Cache', text: 'Colonists discover a supply pod from the Unity that survived reentry. Energy reserves boosted!',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.energy += 20; } }
      },
      { title: 'Morale Surge', text: 'A beautiful aurora dances across the alien sky. Citizens are inspired by the beauty of their new home.',
        effect: () => { playerBases.forEach(b => { b.morale = Math.min(100, b.morale + 5); }); }
      },
      { title: 'Electromagnetic Storm', text: 'An electromagnetic storm sweeps across the region, disrupting electronics and draining energy reserves.',
        effect: () => { if (playerBases.length > 0) { const b = playerBases[Math.floor(Math.random() * playerBases.length)]; b.energy = Math.max(0, b.energy - 8); } }
      },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    if (event.effect) { event.effect(); }
    newState.messages.push({
      id: genId(), turn: newState.turn, type: 'event', title: event.title, text: event.text
    });
  }

  // Mindworm spawning near high xenolife tiles
  if (Math.random() < 0.05) {
    // Find a fungus tile with high xenolife not near a base
    const candidates: {q:number, r:number}[] = [];
    for (let r = 0; r < newState.mapHeight; r++) {
      for (let q = 0; q < newState.mapWidth; q++) {
        const tile = newState.map[r][q];
        if (tile.xenoLifeLevel >= 2 && !tile.base) {
          const nearBase = newState.bases.some(b => hexDistance(b.q, b.r, q, r) < 3);
          if (!nearBase && !newState.units.some(u => u.q === q && u.r === r)) {
            candidates.push({q, r});
          }
        }
      }
    }
    if (candidates.length > 0) {
      const spot = candidates[Math.floor(Math.random() * candidates.length)];
      newState.units.push({
        id: genId(), name: 'Mind Worm', type: 'mindworm', factionId: 'native',
        hp: 8, maxHp: 8, attack: 3, defense: 2, movement: 1, movementLeft: 1,
        q: spot.q, r: spot.r, veterancy: 0
      });
      newState.messages.push({
        id: genId(), turn: newState.turn, type: 'event',
        title: 'Mindworm Sighting!',
        text: 'A boil of native mindworms has emerged from the xenofungus. Planet stirs in its sleep...'
      });
    }
  }

  // Update victory progress
  for (const faction of newState.factions) {
    const fBases = newState.bases.filter(b => b.factionId === faction.id);
    const fUnits = newState.units.filter(u => u.factionId === faction.id);
    const fTechs = newState.researchedTechs[faction.id] || [];
    const totalBases = newState.bases.length || 1;

    newState.victoryProgress[faction.id] = {
      factionId: faction.id,
      transcendence: fTechs.includes('transcendence') ? 50 : fTechs.includes('voice_of_planet') ? 30 : fTechs.length * 2,
      diplomatic: Math.min(100, newState.diplomacy.filter(d => d.factionId === faction.id && (d.relationship === 'allied' || d.relationship === 'pact')).length * 20),
      conquest: Math.min(100, (fBases.length / totalBases) * 100),
      economic: Math.min(100, fBases.reduce((s, b) => s + b.energy, 0) * 2),
    };
  }

  return newState;
}

function getProductionCost(item: string): number {
  const costs: Record<string, number> = {
    'Scout Rover': 20, 'Colony Pod': 40, 'Infantry': 25, 'Laser Infantry': 35,
    'Rover': 35, 'Artillery': 50, 'Needlejet': 60, 'Speeder': 40,
    'Recreation Commons': 30, 'Network Node': 30, 'Command Center': 35,
    'Recycling Tanks': 25, 'Energy Bank': 35, 'Biology Lab': 40,
    'Cybernetics Lab': 50, 'Fusion Lab': 60, 'Quantum Lab': 70,
    'Perimeter Defense': 25, 'Aerospace Complex': 60, 'Genejack Factory': 45,
    'Children\'s Creche': 35, 'Hologram Theatre': 30, 'Mining Platform': 30,
  };
  return costs[item] || 30;
}

function completeProduction(state: GameState, base: Base, item: string, faction: Faction): void {
  const unitTypes: Record<string, Partial<Unit>> = {
    'Scout Rover': { type: 'scout', hp: 10, maxHp: 10, attack: 1, defense: 1, movement: 2 },
    'Colony Pod': { type: 'colony', hp: 10, maxHp: 10, attack: 0, defense: 1, movement: 1 },
    'Infantry': { type: 'infantry', hp: 15, maxHp: 15, attack: 2, defense: 2, movement: 1 },
    'Laser Infantry': { type: 'infantry', hp: 15, maxHp: 15, attack: 4, defense: 2, movement: 1 },
    'Rover': { type: 'rover', hp: 15, maxHp: 15, attack: 3, defense: 1, movement: 3 },
    'Artillery': { type: 'artillery', hp: 10, maxHp: 10, attack: 6, defense: 1, movement: 1 },
    'Needlejet': { type: 'needlejet', hp: 12, maxHp: 12, attack: 5, defense: 2, movement: 6 },
    'Speeder': { type: 'speeder', hp: 12, maxHp: 12, attack: 3, defense: 2, movement: 4 },
  };

  if (unitTypes[item]) {
    const template = unitTypes[item];
    state.units.push({
      id: genId(), name: item, factionId: faction.id,
      q: base.q, r: base.r, movementLeft: template.movement || 1,
      veterancy: 0, ...template
    } as Unit);
  } else {
    // It's a facility
    base.facilities.push(item);
  }

  if (faction.id === state.playerFactionId) {
    state.messages.push({
      id: genId(), turn: state.turn, type: 'base',
      title: `Production Complete`,
      text: `${base.name} has completed ${item}.`,
      factionId: faction.id
    });
  }
}

export function moveUnit(state: GameState, unitId: string, targetQ: number, targetR: number): GameState {
  const newState = { ...state, units: state.units.map(u => ({ ...u })), map: state.map.map(row => row.map(t => ({ ...t, explored: { ...t.explored } }))) };
  const unit = newState.units.find(u => u.id === unitId);
  if (!unit) return state;

  const dist = hexDistance(unit.q, unit.r, targetQ, targetR);
  if (dist > unit.movementLeft) return state;
  if (targetQ < 0 || targetQ >= state.mapWidth || targetR < 0 || targetR >= state.mapHeight) return state;

  const targetTile = newState.map[targetR][targetQ];

  // Check for enemy unit on target
  const enemyUnit = newState.units.find(u => u.q === targetQ && u.r === targetR && u.factionId !== unit.factionId);
  if (enemyUnit) {
    // Calculate terrain defense bonus for defender
    let terrainDefenseBonus = 0;
    const defenderTile = newState.map[targetR]?.[targetQ];
    if (defenderTile) {
      // Rocky and mesa terrain provide +25% defense
      if (defenderTile.terrain === 'rocky' || defenderTile.terrain === 'mesa') {
        terrainDefenseBonus += 0.25;
      }
      // Xenoforest provides +25% defense
      if (defenderTile.terrain === 'xenoforest') {
        terrainDefenseBonus += 0.25;
      }
      // Fungus provides +50% defense for native mindworms, +10% for others
      if (defenderTile.terrain === 'fungus') {
        terrainDefenseBonus += enemyUnit.factionId === 'native' ? 0.5 : 0.1;
      }
    }
    // Defending in a base provides +50% defense
    const defenderBase = newState.bases.find(b => b.q === targetQ && b.r === targetR);
    if (defenderBase) {
      terrainDefenseBonus += 0.5;
      // Perimeter Defense facility adds another +25%
      if (defenderBase.facilities.includes('Perimeter Defense')) {
        terrainDefenseBonus += 0.25;
      }
    }
    const result = resolveCombat(unit, enemyUnit, terrainDefenseBonus);
    unit.hp -= result.attackerDamage;
    enemyUnit.hp -= result.defenderDamage;

    newState.messages.push({
      id: genId(), turn: state.turn, type: 'combat',
      title: 'Combat!',
      text: `${unit.name} (${unit.factionId}) attacks ${enemyUnit.name} (${enemyUnit.factionId}). Damage dealt: ${result.defenderDamage}, received: ${result.attackerDamage}`,
      factionId: unit.factionId
    });

    if (enemyUnit.hp <= 0) {
      newState.units = newState.units.filter(u => u.id !== enemyUnit.id);
      newState.messages.push({
        id: genId(), turn: state.turn, type: 'combat',
        title: 'Unit Destroyed',
        text: `${enemyUnit.name} has been destroyed!`,
        factionId: unit.factionId
      });
    }
    if (unit.hp <= 0) {
      newState.units = newState.units.filter(u => u.id !== unit.id);
      return newState;
    }
  }

  if (!enemyUnit || enemyUnit.hp <= 0) {
    unit.q = targetQ;
    unit.r = targetR;
  }
  unit.movementLeft -= dist;

  // Explore tiles around unit
  const exploreRadius = 2;
  for (let dr = -exploreRadius; dr <= exploreRadius; dr++) {
    for (let dq = -exploreRadius; dq <= exploreRadius; dq++) {
      const eq = targetQ + dq;
      const er = targetR + dr;
      if (eq >= 0 && eq < newState.mapWidth && er >= 0 && er < newState.mapHeight) {
        if (hexDistance(targetQ, targetR, eq, er) <= exploreRadius) {
          newState.map[er][eq].explored[unit.factionId] = true;
        }
      }
    }
  }

  return newState;
}

export function resolveCombat(attacker: Unit, defender: Unit, terrainDefenseBonus: number = 0): { attackerDamage: number; defenderDamage: number } {
  const attackPower = attacker.attack * (1 + attacker.veterancy * 0.25) * (attacker.hp / attacker.maxHp);
  const defensePower = defender.defense * (1 + defender.veterancy * 0.25) * (defender.hp / defender.maxHp) * (1 + terrainDefenseBonus);

  const attackRoll = attackPower * (0.7 + Math.random() * 0.6);
  const defenseRoll = defensePower * (0.7 + Math.random() * 0.6);

  const ratio = attackRoll / (defenseRoll + 0.01);

  const defenderDamage = Math.ceil(Math.min(defender.hp, attackPower * Math.min(ratio, 2) * 1.5));
  const attackerDamage = Math.ceil(Math.min(attacker.hp, defensePower * Math.min(1 / ratio, 2)));

  return { attackerDamage, defenderDamage };
}

export function foundBase(state: GameState, unitId: string, name?: string): GameState {
  const newState = { ...state, units: [...state.units], bases: [...state.bases] };
  const unit = newState.units.find(u => u.id === unitId);
  if (!unit || unit.type !== 'colony') return state;

  const baseName = name || getBaseName();
  const newBase: Base = {
    id: genId(), name: baseName, factionId: unit.factionId,
    q: unit.q, r: unit.r,
    population: 1, nutrients: 0, minerals: 0, energy: 0,
    facilities: [], productionQueue: ['Scout Rover'],
    productionProgress: 0, morale: 70
  };

  // Apply faction starting facilities
  const faction = FACTIONS.find(f => f.id === unit.factionId);
  if (faction) {
    if (faction.id === 'collective') newBase.facilities.push('Recreation Commons');
    if (faction.id === 'prometheans') newBase.facilities.push('Command Center');
    if (faction.id === 'lucid') newBase.facilities.push('Network Node');
    if (faction.id === 'nexus') newBase.facilities.push('Cybernetics Lab');
  }

  newState.bases.push(newBase);
  newState.units = newState.units.filter(u => u.id !== unitId);
  newState.map[unit.r][unit.q] = { ...newState.map[unit.r][unit.q], base: newBase };

  newState.messages = [...state.messages, {
    id: genId(), turn: state.turn, type: 'base',
    title: `${baseName} Founded!`,
    text: `${faction?.leader || 'Leader'} establishes ${baseName} at coordinates (${unit.q}, ${unit.r}).`,
    factionId: unit.factionId
  }];

  return newState;
}

export function setResearch(state: GameState, factionId: string, techId: string): GameState {
  const available = getAvailableTechs(state.researchedTechs[factionId] || []);
  if (!available.find(t => t.id === techId)) return state;

  return {
    ...state,
    currentResearch: { ...state.currentResearch, [factionId]: techId },
    researchProgress: { ...state.researchProgress, [factionId]: 0 }
  };
}

export function buildInBase(state: GameState, baseId: string, item: string): GameState {
  const newState = { ...state, bases: state.bases.map(b => ({ ...b, productionQueue: [...b.productionQueue] })) };
  const base = newState.bases.find(b => b.id === baseId);
  if (!base) return state;

  base.productionQueue.push(item);
  return newState;
}

// Basic AI processing
export function processAI(state: GameState, faction: Faction): GameState {
  let newState = { ...state };

  // AI moves its units
  const factionUnits = newState.units.filter(u => u.factionId === faction.id && u.movementLeft > 0);

  for (const unit of factionUnits) {
    if (unit.type === 'colony') {
      // Colony pods: found base if on good land and not too close to existing base
      const nearbyBase = newState.bases.find(b => hexDistance(b.q, b.r, unit.q, unit.r) < 4);
      const tile = newState.map[unit.r]?.[unit.q];
      if (!nearbyBase && tile && tile.terrain !== 'ocean' && tile.terrain !== 'deepocean') {
        newState = foundBase(newState, unit.id);
      } else {
        // Move toward a good spot
        newState = aiMoveUnit(newState, unit, faction);
      }
    } else if (unit.type === 'scout') {
      // Scouts explore
      newState = aiMoveUnit(newState, unit, faction);
    } else {
      // Military units - patrol or move toward enemy
      if (faction.personality.aggression > 6) {
        // Aggressive: move toward nearest enemy
        const enemyUnits = newState.units.filter(u => u.factionId !== faction.id);
        if (enemyUnits.length > 0) {
          const nearest = enemyUnits.reduce((best, u) => {
            const d = hexDistance(unit.q, unit.r, u.q, u.r);
            const bd = hexDistance(unit.q, unit.r, best.q, best.r);
            return d < bd ? u : best;
          });
          if (hexDistance(unit.q, unit.r, nearest.q, nearest.r) <= unit.movementLeft) {
            newState = moveUnit(newState, unit.id, nearest.q, nearest.r);
          }
        }
      }
      newState = aiMoveUnit(newState, unit, faction);
    }
  }

  // AI builds in bases
  const factionBases = newState.bases.filter(b => b.factionId === faction.id);
  for (const base of factionBases) {
    if (base.productionQueue.length === 0) {
      // Decide what to build
      const fUnits = newState.units.filter(u => u.factionId === faction.id);
      const scoutCount = fUnits.filter(u => u.type === 'scout').length;
      const colonyCount = fUnits.filter(u => u.type === 'colony').length;

      if (scoutCount < 2) {
        newState = buildInBase(newState, base.id, 'Scout Rover');
      } else if (colonyCount < 1 && factionBases.length < 4) {
        newState = buildInBase(newState, base.id, 'Colony Pod');
      } else if (faction.personality.aggression > 5) {
        newState = buildInBase(newState, base.id, 'Infantry');
      } else if (!base.facilities.includes('Network Node')) {
        newState = buildInBase(newState, base.id, 'Network Node');
      } else if (!base.facilities.includes('Recycling Tanks')) {
        newState = buildInBase(newState, base.id, 'Recycling Tanks');
      } else {
        newState = buildInBase(newState, base.id, 'Infantry');
      }
    }
  }

  return newState;
}

function aiMoveUnit(state: GameState, unit: Unit, faction: Faction): GameState {
  if (unit.movementLeft <= 0) return state;

  const neighbors = hexNeighbors(unit.q, unit.r);
  const validMoves = neighbors.filter(([q, r]) =>
    q >= 0 && q < state.mapWidth && r >= 0 && r < state.mapHeight &&
    state.map[r]?.[q]?.terrain !== 'ocean' &&
    state.map[r]?.[q]?.terrain !== 'deepocean' &&
    !state.units.find(u => u.q === q && u.r === r && u.factionId === faction.id)
  );

  if (validMoves.length === 0) return state;

  // Prefer unexplored tiles
  const unexplored = validMoves.filter(([q, r]) => !state.map[r][q].explored[faction.id]);
  const target = unexplored.length > 0
    ? unexplored[Math.floor(Math.random() * unexplored.length)]
    : validMoves[Math.floor(Math.random() * validMoves.length)];

  return moveUnit(state, unit.id, target[0], target[1]);
}

export function getBuildableItems(state: GameState, base: Base): string[] {
  const techs = state.researchedTechs[base.factionId] || [];
  const items: string[] = ['Scout Rover', 'Colony Pod', 'Infantry'];

  if (techs.includes('applied_physics')) items.push('Laser Infantry', 'Perimeter Defense');
  if (techs.includes('doctrine_initiative')) items.push('Speeder');
  if (techs.includes('industrial_base')) items.push('Mining Platform');
  if (techs.includes('centauri_ecology')) items.push('Recycling Tanks');
  if (techs.includes('social_engineering')) items.push('Recreation Commons');
  if (techs.includes('information_networks')) items.push('Network Node');
  if (techs.includes('doctrine_loyalty')) items.push('Command Center');
  if (techs.includes('centauri_meditation')) items.push('Hologram Theatre');
  if (techs.includes('photon_optics')) items.push('Rover');
  if (techs.includes('gene_splicing')) items.push('Genejack Factory');
  if (techs.includes('neural_grafting')) items.push('Cybernetics Lab');
  if (techs.includes('ethical_calculus')) items.push('Children\'s Creche');
  if (techs.includes('xenobiology')) items.push('Biology Lab');
  if (techs.includes('planetary_networks')) items.push('Energy Bank');
  if (techs.includes('fusion_power')) items.push('Fusion Lab');
  if (techs.includes('advanced_military')) items.push('Needlejet', 'Aerospace Complex', 'Artillery');
  if (techs.includes('quantum_networking')) items.push('Quantum Lab');

  // Filter out already built facilities
  return items.filter(item => {
    const isUnit = ['Scout Rover', 'Colony Pod', 'Infantry', 'Laser Infantry', 'Rover', 'Speeder', 'Needlejet', 'Artillery'].includes(item);
    if (isUnit) return true;
    return !base.facilities.includes(item);
  });
}
