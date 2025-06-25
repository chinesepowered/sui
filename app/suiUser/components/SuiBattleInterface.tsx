"use client";

import React, { useState } from 'react';

interface NFT {
  id: string;
  owner: string;
  nftType: number;
  kills: number;
  mutations: number;
}

interface SuiBattleInterfaceProps {
  selectedNFT: NFT;
  onProposeBattle: (opponentAddress: string) => void;
  onExecuteBattle: (opponentNFTId: string) => void;
  battleInProgress: boolean;
}

export default function SuiBattleInterface({ 
  selectedNFT, 
  onProposeBattle, 
  onExecuteBattle,
  battleInProgress 
}: SuiBattleInterfaceProps) {
  const [opponentAddress, setOpponentAddress] = useState('');
  const [opponentNFTId, setOpponentNFTId] = useState('');
  const [battleMode, setBattleMode] = useState<'propose' | 'execute'>('propose');

  const handlePropose = () => {
    if (opponentAddress.trim()) {
      onProposeBattle(opponentAddress.trim());
      setOpponentAddress('');
    }
  };

  const handleExecute = () => {
    if (opponentNFTId.trim()) {
      onExecuteBattle(opponentNFTId.trim());
      setOpponentNFTId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Selected NFT Display */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Fighting with:</h3>
        <div className="text-sm text-gray-300">
          <div>Type: {['Cat', 'Dog', 'Llama'][selectedNFT.nftType]}</div>
          <div>Kills: {selectedNFT.kills}</div>
          <div>Mutations: {selectedNFT.mutations}</div>
        </div>
      </div>

      {/* Battle Mode Toggle */}
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            battleMode === 'propose' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setBattleMode('propose')}
        >
          Propose Battle
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            battleMode === 'execute' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setBattleMode('execute')}
        >
          Execute Battle
        </button>
      </div>

      {/* Battle Interface */}
      {battleMode === 'propose' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Opponent Address
            </label>
            <input
              type="text"
              value={opponentAddress}
              onChange={(e) => setOpponentAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled={battleInProgress}
            />
          </div>
          
          <button
            onClick={handlePropose}
            disabled={!opponentAddress.trim() || battleInProgress}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            {battleInProgress ? 'Proposing...' : 'Propose Battle'}
          </button>
          
          <p className="text-xs text-gray-400">
            Send a battle proposal to another player. They will need to accept it using their NFT.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Opponent NFT ID
            </label>
            <input
              type="text"
              value={opponentNFTId}
              onChange={(e) => setOpponentNFTId(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled={battleInProgress}
            />
          </div>
          
          <button
            onClick={handleExecute}
            disabled={!opponentNFTId.trim() || battleInProgress}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            {battleInProgress ? 'Battling...' : 'Execute Battle'}
          </button>
          
          <p className="text-xs text-gray-400">
            Execute a battle against another player's NFT. Both NFTs must exist and be owned by their respective players.
          </p>
        </div>
      )}

      {/* Battle Rules */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-semibold mb-2">Battle Rules:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Cat beats Dog (75% chance)</li>
          <li>• Dog beats Llama (75% chance)</li>
          <li>• Llama beats Cat (75% chance)</li>
          <li>• Same types have 50% chance each</li>
          <li>• Winner gains kills and mutations</li>
          <li>• Loser's NFT is destroyed</li>
        </ul>
      </div>
    </div>
  );
}