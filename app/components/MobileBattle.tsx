"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, Player, NFT } from '../store/gameStore';
import { NFT_TYPE } from '../lib/constants';
import QRCodeDisplay from './QRCodeDisplay';

type MobileBattleProps = {
  onBattleComplete?: () => void;
};

export default function MobileBattle({ onBattleComplete }: MobileBattleProps) {
  const { currentPlayer, players, nfts, setBattleResult } = useGameStore();
  
  const [opponentAddress, setOpponentAddress] = useState('');
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [battleStage, setBattleStage] = useState<'scan' | 'confirm' | 'battle' | 'result'>('scan');
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [newNftType, setNewNftType] = useState<number | null>(null);
  
  // For demo, prefill with Player 2 address
  useEffect(() => {
    if (players.length > 1) {
      setOpponentAddress(players[1].address);
    }
  }, [players]);
  
  // Find opponent when address is entered
  useEffect(() => {
    if (opponentAddress && players.length > 0) {
      const foundOpponent = players.find(p => p.address === opponentAddress);
      setOpponent(foundOpponent || null);
    } else {
      setOpponent(null);
    }
  }, [opponentAddress, players]);
  
  const handleConfirmBattle = () => {
    setBattleStage('battle');
    
    // Simulate battle animation
    setTimeout(() => {
      handleBattleResult();
    }, 3000);
  };
  
  const handleBattleResult = () => {
    if (!currentPlayer || !opponent || !currentPlayer.nft || !opponent.nft) return;
    
    // For demo, create deterministic but interesting outcome
    // In a real app, this would be determined by the smart contract
    const playerWins = currentPlayer.nft.type === (opponent.nft.type + 1) % 3;
    
    let newType = 0;
    if (playerWins) {
      // Player wins, determine new NFT type
      newType = (3 - currentPlayer.nft.type - opponent.nft.type) % 3;
      setResult('win');
      setNewNftType(newType);
      
      // Update game state
      setBattleResult({
        winner: currentPlayer,
        loser: opponent,
        winnerNftId: currentPlayer.nft.id,
        winnerNewType: newType,
        winnerKills: currentPlayer.nft.kills + 1,
        winnerMutations: currentPlayer.nft.mutations + 1
      });
    } else {
      // Opponent wins, determine new NFT type
      newType = (3 - opponent.nft.type - currentPlayer.nft.type) % 3;
      setResult('lose');
      
      // Update game state
      setBattleResult({
        winner: opponent,
        loser: currentPlayer,
        winnerNftId: opponent.nft.id,
        winnerNewType: newType,
        winnerKills: opponent.nft.kills + 1,
        winnerMutations: opponent.nft.mutations + 1
      });
    }
    
    setBattleStage('result');
  };
  
  const getTypeText = (type: number) => {
    return type === 0 ? 'A' : type === 1 ? 'B' : 'C';
  };
  
  const getTypeColorClass = (type: number) => {
    return type === 0 ? 'bg-pink-600' : type === 1 ? 'bg-blue-600' : 'bg-green-600';
  };

  // Get character image based on NFT type
  const getCharacterImage = (type: number) => {
    switch (type) {
      case 0: return '/cat.jpg';      // Type A
      case 1: return '/llama.jpg';    // Type B
      case 2: return '/dog.jpg';      // Type C
      default: return '/cat.jpg';
    }
  };
  
  const handleReset = () => {
    setBattleStage('scan');
    setResult(null);
    setNewNftType(null);
    if (onBattleComplete) onBattleComplete();
  };
  
  // Render battle scan screen
  if (battleStage === 'scan') {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-card-bg rounded-xl p-6 border border-purple-900/30">
          <h2 className="text-xl font-bold text-center mb-6 text-white">IRL Battle</h2>
          
          {currentPlayer && currentPlayer.nft && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-center mb-4 text-white">Your Character</h3>
              
              {/* Character Image */}
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-purple-500">
                  <img 
                    src={getCharacterImage(currentPlayer.nft.type)}
                    alt={`Type ${getTypeText(currentPlayer.nft.type)} Character`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex justify-center mb-4">
                <span className={`${getTypeColorClass(currentPlayer.nft.type)} px-3 py-1 rounded-full text-white text-sm`}>
                  Type {getTypeText(currentPlayer.nft.type)} NFT
                </span>
              </div>
              
              <h3 className="text-lg font-medium text-center mb-4 text-white">Your QR Code</h3>
              <div className="flex justify-center">
                <QRCodeDisplay address={currentPlayer.address} size="md" />
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 text-white text-center">Scan Opponent</h3>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Opponent Wallet Address</label>
              <input 
                type="text" 
                value={opponentAddress}
                onChange={(e) => setOpponentAddress(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/30 border border-purple-900/30 text-white font-mono text-sm"
                placeholder="0x..."
              />
            </div>
            
            <button 
              className={`w-full battle-button py-3 px-4 rounded-lg text-white font-bold mt-4 ${!opponent || !opponent.nft ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!opponent || !opponent.nft}
              onClick={() => setBattleStage('confirm')}
            >
              {!opponent ? 'Enter Valid Address' : !opponent.nft ? 'Opponent Has No NFT' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render battle confirmation screen
  if (battleStage === 'confirm') {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-card-bg rounded-xl p-6 border border-purple-900/30">
          <h2 className="text-xl font-bold text-center mb-6 text-white">Confirm Battle</h2>
          
          <div className="mb-6 p-4 bg-black/30 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">You</p>
                <div className="relative w-24 h-18 rounded-lg overflow-hidden border-2 border-purple-500 mb-2">
                  <img 
                    src={getCharacterImage(currentPlayer?.nft?.type || 0)}
                    alt={`Your Type ${getTypeText(currentPlayer?.nft?.type || 0)} Character`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white font-bold text-sm">{currentPlayer?.name}</p>
                <span className={`${getTypeColorClass(currentPlayer?.nft?.type || 0)} px-2 py-1 rounded-full text-white text-xs mt-1 inline-block`}>
                  Type {getTypeText(currentPlayer?.nft?.type || 0)}
                </span>
              </div>
              <div className="text-xl font-bold text-purple-500">VS</div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Opponent</p>
                <div className="relative w-24 h-18 rounded-lg overflow-hidden border-2 border-gray-600 mb-2 bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">?</div>
                </div>
                <p className="text-white font-bold text-sm">{opponent?.name}</p>
                <span className="bg-gray-600 px-2 py-1 rounded-full text-white text-xs mt-1 inline-block">
                  Hidden
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 p-4 rounded-lg mb-6">
            <p className="text-center text-yellow-300 mb-2">⚠️ Battle Warning</p>
            <p className="text-gray-300 text-sm text-center">
              You're about to battle with your NFT. The loser's NFT will be burned!
            </p>
            
            <div className="mt-4 p-3 bg-black/30 rounded-lg">
              <p className="text-center text-white text-sm">Your opponent's NFT type is hidden</p>
              <p className="text-center text-gray-400 text-xs mt-1">
                Type matchups: A beats B, B beats C, C beats A (75% probability)
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-white font-medium"
              onClick={() => setBattleStage('scan')}
            >
              Cancel
            </button>
            <button 
              className="flex-1 battle-button py-3 px-4 rounded-lg text-white font-bold"
              onClick={handleConfirmBattle}
            >
              Start Battle
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render battle animation screen
  if (battleStage === 'battle') {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-card-bg rounded-xl p-6 border border-purple-900/30">
          <h2 className="text-xl font-bold text-center mb-6 text-white">Battle in Progress</h2>
          
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center justify-between w-full max-w-xs relative">
              {/* Player Character */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: [-20, 0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-center"
              >
                <div className="relative w-20 h-15 rounded-lg overflow-hidden border-2 border-purple-500 mb-2">
                  <img 
                    src={getCharacterImage(currentPlayer?.nft?.type || 0)}
                    alt="Your Character"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`${getTypeColorClass(currentPlayer?.nft?.type || 0)} px-2 py-1 rounded-full text-white text-xs`}>
                  You
                </span>
              </motion.div>
              
              {/* VS Animation */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  rotate: [0, 5, -5, 3, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mx-4"
              >
                <div className="bg-purple-600 rounded-full w-16 h-16 opacity-20 animate-ping absolute" />
                <div className="bg-purple-700 rounded-full w-12 h-12 opacity-40 animate-pulse absolute top-2 left-2" />
                <div className="bg-purple-800 rounded-full w-8 h-8 opacity-60 flex items-center justify-center absolute top-4 left-4">
                  <span className="text-white font-bold text-xs">VS</span>
                </div>
              </motion.div>
              
              {/* Opponent Character - Hidden during battle */}
              <motion.div
                initial={{ x: 20 }}
                animate={{ x: [20, 0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-center"
              >
                <div className="relative w-20 h-15 rounded-lg overflow-hidden border-2 border-gray-600 mb-2 bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">?</div>
                </div>
                <span className="bg-gray-600 px-2 py-1 rounded-full text-white text-xs">
                  Hidden
                </span>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-300">Resolving battle on-chain...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render battle result screen
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-card-bg rounded-xl p-6 border border-purple-900/30">
        <h2 className="text-xl font-bold text-center mb-6 text-white">Battle Result</h2>
        
        {/* Show both characters now that battle is complete */}
        <div className="mb-6 p-4 bg-black/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">You</p>
              <div className="relative w-24 h-18 rounded-lg overflow-hidden border-2 border-purple-500 mb-2">
                <img 
                  src={getCharacterImage(currentPlayer?.nft?.type || 0)}
                  alt={`Your Type ${getTypeText(currentPlayer?.nft?.type || 0)} Character`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white font-bold text-sm">{currentPlayer?.name}</p>
              <span className={`${getTypeColorClass(currentPlayer?.nft?.type || 0)} px-2 py-1 rounded-full text-white text-xs mt-1 inline-block`}>
                Type {getTypeText(currentPlayer?.nft?.type || 0)}
              </span>
            </div>
            <div className="text-xl font-bold text-purple-500">VS</div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Opponent</p>
              <div className="relative w-24 h-18 rounded-lg overflow-hidden border-2 border-orange-500 mb-2">
                <img 
                  src={getCharacterImage(opponent?.nft?.type || 0)}
                  alt={`Opponent's Type ${getTypeText(opponent?.nft?.type || 0)} Character`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white font-bold text-sm">{opponent?.name}</p>
              <span className={`${getTypeColorClass(opponent?.nft?.type || 0)} px-2 py-1 rounded-full text-white text-xs mt-1 inline-block`}>
                Type {getTypeText(opponent?.nft?.type || 0)}
              </span>
            </div>
          </div>
        </div>

        {result === 'win' ? (
          <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 mb-6">
            <h3 className="text-center text-white font-bold text-lg mb-2">Victory!</h3>
            <p className="text-center text-gray-300">
              Your NFT defeated {opponent?.name}'s Type {opponent?.nft ? getTypeText(opponent.nft.type) : '?'} NFT!
            </p>
          </div>
        ) : (
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6">
            <h3 className="text-center text-white font-bold text-lg mb-2">Defeat!</h3>
            <p className="text-center text-gray-300">
              Your NFT was defeated by {opponent?.name}'s Type {opponent?.nft ? getTypeText(opponent.nft.type) : '?'} NFT!
            </p>
          </div>
        )}
        
        {result === 'win' && newNftType !== null && (
          <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-6">
            <h3 className="text-center text-white font-bold mb-2">NFT Evolved!</h3>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-purple-400 mb-1">
                  <img 
                    src={getCharacterImage(currentPlayer?.nft?.type || 0)}
                    alt={`Old Type ${getTypeText(currentPlayer?.nft?.type || 0)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`${getTypeColorClass(currentPlayer?.nft?.type || 0)} px-2 py-1 rounded-full text-white text-xs`}>
                  Type {getTypeText(currentPlayer?.nft?.type || 0)}
                </div>
              </div>
              <div className="text-white text-xl">→</div>
              <div className="text-center">
                <div className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-gold-400 mb-1 animate-pulse">
                  <img 
                    src={getCharacterImage(newNftType)}
                    alt={`New Type ${getTypeText(newNftType)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`${getTypeColorClass(newNftType)} px-2 py-1 rounded-full text-white text-xs`}>
                  Type {getTypeText(newNftType)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {result === 'lose' && (
          <div className="bg-gray-600/20 border border-gray-600/30 rounded-lg p-4 mb-6">
            <h3 className="text-center text-white font-bold mb-2">NFT Burned</h3>
            <p className="text-center text-gray-300">
              Your NFT has been burned. You'll need to get a new one to play again.
            </p>
          </div>
        )}
        
        <button 
          className="w-full battle-button py-3 px-4 rounded-lg text-white font-bold"
          onClick={handleReset}
        >
          Return to Scan
        </button>
      </div>
    </div>
  );
} 