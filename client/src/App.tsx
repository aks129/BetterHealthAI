import React from 'react';
import { GameProvider, useGame } from './game/GameContext';
import { processTurn, moveUnit, foundBase, setResearch, buildInBase } from './game/engine';
import TitleScreen from './components/TitleScreen';
import FactionSelect from './components/FactionSelect';
import LandingSequence from './components/LandingSequence';
import HexMap from './components/HexMap';
import TopBar from './components/TopBar';
import UnitPanel from './components/UnitPanel';
import BasePanel from './components/BasePanel';
import MessageLog from './components/MessageLog';
import ResearchPanel from './components/ResearchPanel';
import DiplomacyPanel from './components/DiplomacyPanel';
import DatalinksPanel from './components/DatalinksPanel';
import VictoryScreen from './components/VictoryScreen';

function GameApp() {
  const { gameState, dispatch } = useGame();

  const handleTileClick = (q: number, r: number) => {
    const selectedUnit = gameState.units.find(u => u.id === gameState.selectedUnitId);

    if (selectedUnit && selectedUnit.factionId === gameState.playerFactionId && selectedUnit.movementLeft > 0) {
      const newState = moveUnit(gameState, selectedUnit.id, q, r);
      if (newState !== gameState) {
        dispatch({ type: 'UPDATE_STATE', payload: newState });
        return;
      }
    }

    // Check for unit on tile
    const unitOnTile = gameState.units.find(u => u.q === q && u.r === r && u.factionId === gameState.playerFactionId);
    if (unitOnTile) {
      dispatch({ type: 'SELECT_UNIT', payload: unitOnTile.id });
      return;
    }

    // Check for base on tile
    const baseOnTile = gameState.bases.find(b => b.q === q && b.r === r && b.factionId === gameState.playerFactionId);
    if (baseOnTile) {
      dispatch({ type: 'SELECT_BASE', payload: baseOnTile.id });
      return;
    }

    dispatch({ type: 'SELECT_UNIT', payload: null });
  };

  const handleUnitSelect = (unitId: string) => {
    dispatch({ type: 'SELECT_UNIT', payload: unitId });
  };

  const handleEndTurn = () => {
    const newState = processTurn(gameState);
    dispatch({ type: 'END_TURN', payload: newState });
  };

  const handleFoundBase = () => {
    if (gameState.selectedUnitId) {
      const newState = foundBase(gameState, gameState.selectedUnitId);
      if (newState !== gameState) {
        dispatch({ type: 'UPDATE_STATE', payload: newState });
      }
    }
  };

  const handleSetResearch = (techId: string) => {
    const newState = setResearch(gameState, gameState.playerFactionId, techId);
    dispatch({ type: 'UPDATE_STATE', payload: { ...newState, phase: 'playing' as const } });
  };

  const handleBuild = (baseId: string, item: string) => {
    const newState = buildInBase(gameState, baseId, item);
    dispatch({ type: 'UPDATE_STATE', payload: newState });
  };

  switch (gameState.phase) {
    case 'title':
      return <TitleScreen />;

    case 'faction_select':
      return <FactionSelect />;

    case 'landing':
      return <LandingSequence />;

    case 'playing':
      return (
        <div className="fixed inset-0 bg-black flex flex-col select-none">
          <TopBar />
          <div className="flex-1 relative overflow-hidden">
            <HexMap onTileClick={handleTileClick} onUnitSelect={handleUnitSelect} />
            <MessageLog />
          </div>
          <UnitPanel />
          <BasePanel />
        </div>
      );

    case 'research':
      return (
        <div className="fixed inset-0 bg-black flex flex-col select-none">
          <TopBar />
          <div className="flex-1 relative overflow-hidden">
            <HexMap onTileClick={handleTileClick} onUnitSelect={handleUnitSelect} />
          </div>
          <ResearchPanel />
        </div>
      );

    case 'diplomacy':
      return (
        <div className="fixed inset-0 bg-black flex flex-col select-none">
          <TopBar />
          <div className="flex-1 relative overflow-hidden">
            <HexMap onTileClick={handleTileClick} onUnitSelect={handleUnitSelect} />
          </div>
          <DiplomacyPanel />
        </div>
      );

    case 'base_management':
      return <BasePanel />;

    case 'victory':
      return <VictoryScreen />;

    case 'datalinks':
      return <DatalinksPanel />;

    default:
      return <TitleScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
