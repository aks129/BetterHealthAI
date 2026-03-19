export type TerrainType = 'fungus' | 'rocky' | 'arid' | 'fertile' | 'ocean' | 'geothermal' | 'xenoforest' | 'crater' | 'mesa' | 'deepocean';

export type ResourceType = 'nutrients' | 'minerals' | 'energy';

export interface HexTile {
  id: string;
  q: number;
  r: number;
  terrain: TerrainType;
  resources: Record<ResourceType, number>;
  improvement?: string;
  unit?: Unit;
  base?: Base;
  explored: Record<string, boolean>;
  xenoLifeLevel: number;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  factionId: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  movementLeft: number;
  q: number;
  r: number;
  veterancy: number;
}

export type UnitType = 'scout' | 'colony' | 'infantry' | 'rover' | 'artillery' | 'needlejet' | 'speeder' | 'mindworm';

export interface Base {
  id: string;
  name: string;
  factionId: string;
  q: number;
  r: number;
  population: number;
  nutrients: number;
  minerals: number;
  energy: number;
  facilities: string[];
  productionQueue: string[];
  productionProgress: number;
  morale: number;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  flavor: string;
  quoteAuthor: string;
  cost: number;
  prerequisites: string[];
  category: TechCategory;
  unlocks: string[];
  tier: number;
}

export type TechCategory = 'explore' | 'discover' | 'build' | 'conquer';

export interface Faction {
  id: string;
  name: string;
  fullName: string;
  leader: string;
  leaderTitle: string;
  ideology: string;
  color: string;
  bgColor: string;
  textColor: string;
  portrait: string;
  bonuses: string[];
  penalties: string[];
  agenda: string;
  personality: FactionPersonality;
  backstory: string;
  quotes: string[];
  startingTech: string;
}

export interface FactionPersonality {
  aggression: number;
  diplomacy: number;
  research: number;
  expansion: number;
  xenophilia: number;
}

export interface DiplomacyState {
  factionId: string;
  targetFactionId: string;
  relationship: 'allied' | 'pact' | 'treaty' | 'neutral' | 'vendetta';
  opinion: number;
  trades: string[];
}

export interface GameState {
  turn: number;
  year: number;
  phase: GamePhase;
  currentFactionIndex: number;
  factions: Faction[];
  playerFactionId: string;
  map: HexTile[][];
  mapWidth: number;
  mapHeight: number;
  units: Unit[];
  bases: Base[];
  technologies: Record<string, Technology>;
  researchedTechs: Record<string, string[]>;
  currentResearch: Record<string, string>;
  researchProgress: Record<string, number>;
  diplomacy: DiplomacyState[];
  selectedUnitId: string | null;
  selectedBaseId: string | null;
  messages: GameMessage[];
  councilCalled: boolean;
  victoryProgress: Record<string, VictoryProgress>;
}

export type GamePhase = 'title' | 'faction_select' | 'landing' | 'playing' | 'research' | 'diplomacy' | 'base_management' | 'victory' | 'datalinks';

export interface GameMessage {
  id: string;
  turn: number;
  type: 'event' | 'combat' | 'diplomacy' | 'research' | 'base' | 'story';
  title: string;
  text: string;
  factionId?: string;
}

export interface VictoryProgress {
  factionId: string;
  transcendence: number;
  diplomatic: number;
  conquest: number;
  economic: number;
}
