import React from 'react';
import { ConnectButton } from '@mysten/wallet-kit';
import { useGameStore } from '../store/gameStore';

export default function GameHeader() {
  const { currentPlayer } = useGameStore();
  
  return (
    <header className="w-full py-4 px-8 bg-card-bg border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
            Sui Battle AR
          </div>
          <div className="ml-4 hidden md:flex space-x-4">
            <span className="text-gray-300 text-sm px-3 py-1 bg-purple-900/30 rounded-full">
              IRL Battle Game
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {currentPlayer && (
            <div className="hidden md:block">
              <div className="text-gray-400 text-sm">Playing as</div>
              <div className="text-white font-bold">{currentPlayer.name}</div>
            </div>
          )}
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
} 