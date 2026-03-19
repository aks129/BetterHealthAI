import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GamePhase, GameMessage } from './types';

export type GameAction =
  | { type: 'NEW_GAME'; payload: GameState }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SELECT_UNIT'; payload: string | null }
  | { type: 'SELECT_BASE'; payload: string | null }
  | { type: 'UPDATE_STATE'; payload: Partial<GameState> }
  | { type: 'END_TURN'; payload: GameState }
  | { type: 'MOVE_UNIT'; payload: { unitId: string; q: number; r: number } }
  | { type: 'ADD_MESSAGE'; payload: GameMessage }
  | { type: 'SET_RESEARCH'; payload: { factionId: string; techId: string } }
  | { type: 'SELECT_TILE'; payload: { q: number; r: number } | null };

const initialState: GameState = {
  turn: 1,
  year: 2100,
  phase: 'title',
  currentFactionIndex: 0,
  factions: [],
  playerFactionId: '',
  map: [],
  mapWidth: 0,
  mapHeight: 0,
  units: [],
  bases: [],
  technologies: {},
  researchedTechs: {},
  currentResearch: {},
  researchProgress: {},
  diplomacy: [],
  selectedUnitId: null,
  selectedBaseId: null,
  messages: [],
  councilCalled: false,
  victoryProgress: {},
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...action.payload };

    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'SELECT_UNIT':
      return { ...state, selectedUnitId: action.payload, selectedBaseId: null };

    case 'SELECT_BASE':
      return { ...state, selectedBaseId: action.payload, selectedUnitId: null };

    case 'UPDATE_STATE':
      return { ...state, ...action.payload };

    case 'END_TURN':
      return { ...action.payload };

    case 'MOVE_UNIT': {
      const { unitId, q, r } = action.payload;
      const updatedUnits = state.units.map((u) =>
        u.id === unitId
          ? { ...u, q, r, movementLeft: Math.max(0, u.movementLeft - 1) }
          : u
      );
      return { ...state, units: updatedUnits };
    }

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'SET_RESEARCH': {
      const { factionId, techId } = action.payload;
      return {
        ...state,
        currentResearch: { ...state.currentResearch, [factionId]: techId },
        researchProgress: { ...state.researchProgress, [factionId]: 0 },
      };
    }

    case 'SELECT_TILE':
      return { ...state } as GameState;

    default:
      return state;
  }
}

interface GameContextValue {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
