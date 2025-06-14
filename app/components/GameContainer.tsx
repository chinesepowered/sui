"use client";

import React, { useEffect } from 'react';
import { useGameStore, Player } from '../store/gameStore';
import GameHeader from './GameHeader';
import PlayerCard from './PlayerCard';
import BattleArena from './BattleArena';

export default function GameContainer() {
  const { 
    loadDemoData, 
    players, 
    currentPlayer, 
    selectedOpponent,
    selectOpponent,
    isBattling
  } = useGameStore();
  
  // Load demo data on initial render
  useEffect(() => {
    loadDemoData();
  }, []);
  
  // Filter out current player from opponents list and ensure they have NFTs for battle
  const opponents = players.filter((player: Player) => 
    currentPlayer && 
    player.address !== currentPlayer.address && 
    player.nft !== undefined
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Battle content */}
          <div>
            {/* Battle arena (when opponent is selected) */}
            {selectedOpponent && isBattling ? (
              <BattleArena />
            ) : (
              <div>
                {/* Current player */}
                {currentPlayer && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-center text-white">Your NFT</h2>
                    <div className="max-w-xs mx-auto">
                      <PlayerCard 
                        player={currentPlayer} 
                        isCurrentPlayer={true}
                        hasNft={currentPlayer.nft !== undefined}
                      />
                    </div>
                  </div>
                )}
                
                {/* Opponent selection */}
                <div className="mt-12">
                  <h2 className="text-xl font-bold mb-6 text-center text-white">
                    {selectedOpponent ? 'Ready to Battle!' : 'Remaining Opponents'}
                  </h2>
                  
                  {selectedOpponent ? (
                    <div className="flex flex-col items-center">
                      <div className="max-w-xs w-full">
                        <PlayerCard 
                          player={selectedOpponent} 
                          selected={true}
                          hasNft={selectedOpponent.nft !== undefined}
                        />
                      </div>
                      
                      <div className="mt-6 flex gap-4">
                        <button 
                          className="battle-button px-6 py-3 rounded-lg text-white font-bold"
                          onClick={() => useGameStore.getState().setIsBattling(true)}
                        >
                          Start Battle
                        </button>
                        <button 
                          className="px-6 py-3 rounded-lg text-white font-bold border border-gray-600 hover:bg-gray-700"
                          onClick={() => selectOpponent(null)}
                        >
                          Change Opponent
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {opponents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {opponents.map((player: Player) => (
                            <PlayerCard 
                              key={player.address}
                              player={player}
                              onClick={() => selectOpponent(player)}
                              hasNft={player.nft !== undefined}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-card-bg rounded-xl border border-purple-900/30">
                          <p className="text-gray-300 mb-4">No opponents with NFTs available for battle.</p>
                          <p className="text-sm text-gray-400">All players must have NFTs to participate in battles.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-card-bg border-t border-purple-900/30 py-4 px-8 text-center text-gray-400 text-sm">
        Sui Battle AR - A PvP NFT Battle Game for IRL Events
      </footer>
    </div>
  );
} 