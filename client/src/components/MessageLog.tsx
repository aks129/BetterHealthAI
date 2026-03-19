import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { GameMessage } from '../game/types';

const TYPE_COLORS: Record<GameMessage['type'], string> = {
  event: '#e5e7eb',
  combat: '#ef4444',
  diplomacy: '#eab308',
  research: '#60a5fa',
  base: '#4ade80',
  story: '#a855f6',
};

const TYPE_LABELS: Record<GameMessage['type'], string> = {
  event: 'EVT',
  combat: 'CMB',
  diplomacy: 'DIP',
  research: 'RES',
  base: 'BSE',
  story: 'STR',
};

export default function MessageLog() {
  const { gameState } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<GameMessage['type'] | 'all'>('all');
  const [isMinimized, setIsMinimized] = useState(false);

  const filteredMessages = useMemo(() => {
    const msgs = gameState.messages || [];
    if (filterType === 'all') return msgs;
    return msgs.filter((m) => m.type === filterType);
  }, [gameState.messages, filterType]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages.length]);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-30 px-3 py-2 text-[10px] uppercase tracking-wider text-cyan-500 cursor-pointer transition-all duration-200"
        style={{
          background: 'rgba(5,10,20,0.9)',
          border: '1px solid rgba(0,188,212,0.3)',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        }}
      >
        Messages ({gameState.messages.length})
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-30 w-80 flex flex-col"
      style={{
        maxHeight: '320px',
        background: 'linear-gradient(180deg, rgba(5,10,22,0.96) 0%, rgba(3,6,14,0.98) 100%)',
        border: '1px solid rgba(0,188,212,0.15)',
        borderRadius: '6px',
        boxShadow: '0 4px 30px rgba(0,0,0,0.6), 0 0 15px rgba(0,188,212,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-800/50">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-medium">
          Message Log
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-cyan-400 cursor-pointer text-[10px]"
          >
            _
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex-shrink-0 flex items-center gap-0.5 px-2 py-1 border-b border-gray-800/30 overflow-x-auto">
        <FilterTab label="All" active={filterType === 'all'} onClick={() => setFilterType('all')} color="#888" />
        {(Object.keys(TYPE_COLORS) as GameMessage['type'][]).map((type) => (
          <FilterTab
            key={type}
            label={TYPE_LABELS[type]}
            active={filterType === type}
            onClick={() => setFilterType(type)}
            color={TYPE_COLORS[type]}
          />
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-2 py-1" style={{ maxHeight: '230px' }}>
        {filteredMessages.length === 0 ? (
          <div className="text-gray-700 text-xs text-center py-8 italic">No messages</div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const typeColor = TYPE_COLORS[msg.type];

            return (
              <div
                key={msg.id}
                onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                className="py-1.5 border-b border-gray-800/20 cursor-pointer transition-all duration-150 hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-2">
                  {/* Turn number */}
                  <span className="text-[9px] font-mono text-gray-700 flex-shrink-0 mt-0.5 w-6 text-right">
                    T{msg.turn}
                  </span>

                  {/* Type indicator */}
                  <div
                    className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: typeColor, boxShadow: `0 0 4px ${typeColor}66` }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium" style={{ color: typeColor }}>
                      {msg.title}
                    </div>
                    {isExpanded && (
                      <div
                        className="text-[10px] text-gray-400 mt-1 leading-relaxed"
                        style={{ animation: 'expandMsg 0.2s ease-out' }}
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer scanline */}
      <div className="flex-shrink-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,188,212,0.1), transparent)' }} />

      <style>{`
        @keyframes expandMsg {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
      `}</style>
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-medium rounded transition-all cursor-pointer"
      style={{
        background: active ? `${color}22` : 'transparent',
        color: active ? color : '#555',
        border: active ? `1px solid ${color}44` : '1px solid transparent',
      }}
    >
      {label}
    </button>
  );
}
