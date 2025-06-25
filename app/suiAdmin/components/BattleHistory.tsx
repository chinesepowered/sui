"use client";

import React, { useState } from 'react';

interface BattleEvent {
  timestamp: string;
  type: 'battle' | 'proposal' | 'mint';
  winner?: string;
  loser?: string;
  winnerType?: number;
  details: string;
  txId: string;
}

interface BattleHistoryProps {
  events: any[];
}

const NFT_TYPES = ['Cat', 'Dog', 'Llama'];

export default function BattleHistory({ events }: BattleHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'battles' | 'proposals' | 'mints'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Convert raw events to display format
  const processedEvents: BattleEvent[] = events.map((event, index) => {
    const parsedJson = event.parsedJson || {};
    const timestamp = new Date(event.timestampMs || Date.now() - index * 60000).toLocaleString();
    
    if (event.type?.includes('BattleResult')) {
      return {
        timestamp,
        type: 'battle',
        winner: parsedJson.winner,
        loser: parsedJson.loser,
        winnerType: parsedJson.winner_new_type,
        details: `${NFT_TYPES[parsedJson.winner_new_type] || 'Unknown'} defeated opponent (Kills: ${parsedJson.winner_kills})`,
        txId: event.id?.txDigest || `sim_${index}`
      };
    } else if (event.type?.includes('BattleProposal')) {
      return {
        timestamp,
        type: 'proposal',
        details: `Battle proposed from ${parsedJson.from?.slice(0, 8)}... to ${parsedJson.to?.slice(0, 8)}...`,
        txId: event.id?.txDigest || `sim_${index}`
      };
    } else if (event.type?.includes('NFTMinted')) {
      return {
        timestamp,
        type: 'mint',
        details: `${NFT_TYPES[parsedJson.nft_type] || 'Unknown'} NFT minted for ${parsedJson.owner?.slice(0, 8)}...`,
        txId: event.id?.txDigest || `sim_${index}`
      };
    }
    
    // Fallback for unknown events
    return {
      timestamp,
      type: 'battle',
      details: 'Unknown event',
      txId: event.id?.txDigest || `sim_${index}`
    };
  });

  // Filter events
  const filteredEvents = processedEvents.filter(event => {
    const matchesFilter = filter === 'all' || 
      (filter === 'battles' && event.type === 'battle') ||
      (filter === 'proposals' && event.type === 'proposal') ||
      (filter === 'mints' && event.type === 'mint');
    
    const matchesSearch = searchTerm === '' || 
      event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.winner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.loser?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'battle': return '⚔️';
      case 'proposal': return '📤';
      case 'mint': return '✨';
      default: return '📋';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'battle': return 'border-red-500/50 bg-red-500/10';
      case 'proposal': return 'border-blue-500/50 bg-blue-500/10';
      case 'mint': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-black/20 rounded-xl border border-orange-500/30 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Battle History</h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 w-full md:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Events</option>
              <option value="battles">Battles Only</option>
              <option value="proposals">Proposals Only</option>
              <option value="mints">Mints Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-black/20 rounded-xl border border-orange-500/30 p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' ? 'No events match your criteria' : 'No events found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.slice(0, 50).map((event, index) => (
              <div 
                key={index}
                className={`rounded-lg border p-4 ${getEventColor(event.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getEventIcon(event.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white capitalize">{event.type}</span>
                      <span className="text-xs text-gray-400">{event.timestamp}</span>
                    </div>
                    
                    <p className="text-white text-sm mb-2">{event.details}</p>
                    
                    {event.winner && event.loser && (
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex gap-4">
                          <span>Winner: {event.winner.slice(0, 8)}...{event.winner.slice(-4)}</span>
                          <span>Loser: {event.loser.slice(0, 8)}...{event.loser.slice(-4)}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2 break-all">
                      Tx: {event.txId}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length > 50 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Showing first 50 events ({filteredEvents.length} total)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, color: 'bg-gray-600' },
          { label: 'Battles', value: processedEvents.filter(e => e.type === 'battle').length, color: 'bg-red-600' },
          { label: 'Proposals', value: processedEvents.filter(e => e.type === 'proposal').length, color: 'bg-blue-600' },
          { label: 'Mints', value: processedEvents.filter(e => e.type === 'mint').length, color: 'bg-green-600' }
        ].map((stat) => (
          <div key={stat.label} className="bg-black/20 rounded-lg border border-orange-500/30 p-4 text-center">
            <div className={`${stat.color} text-white text-2xl font-bold py-2 px-4 rounded-lg mb-2`}>
              {stat.value}
            </div>
            <p className="text-gray-300 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}