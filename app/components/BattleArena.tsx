"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NFTCard from './NFTCard';
import { useGameStore, Player, NFT } from '../store/gameStore';
import { NFT_TYPE, BATTLE_PROBABILITIES } from '../lib/constants';

export default function BattleArena() {
  const { 
    currentPlayer, 
    selectedOpponent,
    isBattling,
    isAnimating,
    setIsBattling,
    setIsAnimating,
    setBattleResult,
    resetBattleState
  } = useGameStore();

  const [battlePhase, setBattlePhase] = useState<'preparing' | 'animation' | 'result'>('preparing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [loser, setLoser] = useState<Player | null>(null);
  const [newType, setNewType] = useState<number | null>(null);
  const [battleInfo, setBattleInfo] = useState<string>('');

  useEffect(() => {
    if (isBattling && battlePhase === 'preparing') {
      if (currentPlayer?.nft && selectedOpponent?.nft) {
        // Set battle info based on NFT types
        setBattleInfo(getBattleInfo(currentPlayer.nft.type, selectedOpponent.nft.type));
      }
      
      setTimeout(() => {
        setIsAnimating(true);
        setBattlePhase('animation');
        
        // Simulate battle animation for 3 seconds
        setTimeout(() => {
          determineWinner();
          setIsAnimating(false);
          setBattlePhase('result');
        }, 3000);
      }, 1000);
    }
  }, [isBattling, battlePhase, currentPlayer, selectedOpponent]);

  // Generate battle info text based on NFT types
  const getBattleInfo = (playerType: number, opponentType: number) => {
    const getTypeName = (type: number) => type === 0 ? 'A' : type === 1 ? 'B' : 'C';
    const playerTypeName = getTypeName(playerType);
    const opponentTypeName = getTypeName(opponentType);
    
    if (playerType === opponentType) {
      return `Both players have Type ${playerTypeName} NFTs - 50/50 chance!`;
    }
    
    let advantagePlayer = '';
    let winChance = '';
    
    if (
      (playerType === NFT_TYPE.A && opponentType === NFT_TYPE.B) ||
      (playerType === NFT_TYPE.B && opponentType === NFT_TYPE.C) ||
      (playerType === NFT_TYPE.C && opponentType === NFT_TYPE.A)
    ) {
      advantagePlayer = 'You have';
      winChance = '75%';
    } else {
      advantagePlayer = 'Opponent has';
      winChance = '25%';
    }
    
    return `You: Type ${playerTypeName} vs Opponent: Type ${opponentTypeName} - ${advantagePlayer} ${winChance} chance to win!`;
  };

  const determineWinner = () => {
    if (!currentPlayer || !selectedOpponent || !currentPlayer.nft || !selectedOpponent.nft) return;
    
    const responderType = currentPlayer.nft.type;
    const requesterType = selectedOpponent.nft.type;
    
    // Calculate win probability for responder (current player)
    let responderWinProbability = BATTLE_PROBABILITIES.EQUAL; // Default 50%
    
    if (responderType !== requesterType) {
      if (
        (responderType === NFT_TYPE.A && requesterType === NFT_TYPE.B) ||
        (responderType === NFT_TYPE.B && requesterType === NFT_TYPE.C) ||
        (responderType === NFT_TYPE.C && requesterType === NFT_TYPE.A)
      ) {
        // Advantageous matchup: 75% chance
        responderWinProbability = BATTLE_PROBABILITIES.ADVANTAGE;
      } else {
        // Disadvantageous matchup: 25% chance
        responderWinProbability = BATTLE_PROBABILITIES.MAX - BATTLE_PROBABILITIES.ADVANTAGE;
      }
    }
    
    // Determine winner (demo is mostly deterministic but with slight randomization)
    // In a real app this would come from the blockchain event
    const randomValue = Math.floor(Math.random() * BATTLE_PROBABILITIES.MAX);
    const currentPlayerWins = randomValue < responderWinProbability;
    
    // Calculate new NFT type based on the battle outcome
    const determineMutation = (winnerType: number, loserType: number) => {
      if (winnerType === loserType) {
        // Same type: choose next type
        return (winnerType + 1) % 3;
      } else {
        // Different types: use the remaining type
        return (3 - winnerType - loserType) % 3;
      }
    };
    
    if (currentPlayerWins) {
      // Current player wins
      const newNftType = determineMutation(currentPlayer.nft.type, selectedOpponent.nft.type);
      setWinner(currentPlayer);
      setLoser(selectedOpponent);
      setNewType(newNftType);
      
      // Update game state
      setBattleResult({
        winner: currentPlayer,
        loser: selectedOpponent,
        winnerNftId: currentPlayer.nft.id,
        winnerNewType: newNftType,
        winnerKills: currentPlayer.nft.kills + 1,
        winnerMutations: currentPlayer.nft.mutations + 1
      });
    } else {
      // Opponent wins
      const newNftType = determineMutation(selectedOpponent.nft.type, currentPlayer.nft.type);
      setWinner(selectedOpponent);
      setLoser(currentPlayer);
      setNewType(newNftType);
      
      // Update game state
      setBattleResult({
        winner: selectedOpponent,
        loser: currentPlayer,
        winnerNftId: selectedOpponent.nft.id,
        winnerNewType: newNftType,
        winnerKills: selectedOpponent.nft.kills + 1,
        winnerMutations: selectedOpponent.nft.mutations + 1
      });
    }
  };

  const handleFinishBattle = () => {
    resetBattleState();
    setBattlePhase('preparing');
    setWinner(null);
    setLoser(null);
    setNewType(null);
  };

  const getTypeText = (type: number) => {
    return type === 0 ? 'A' : type === 1 ? 'B' : 'C';
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

  if (!currentPlayer || !selectedOpponent || !currentPlayer.nft || !selectedOpponent.nft) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-card-bg rounded-xl p-6 border border-purple-900/30 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 z-0"
        />
        
        <div className="relative z-10">
          <h2 className="text-center text-2xl font-bold mb-8 text-white">Battle Arena</h2>
          
          {/* Battle info text */}
          {battleInfo && (
            <div className="text-center mb-8 p-2 bg-purple-900/30 rounded-lg">
              <p className="text-white">{battleInfo}</p>
            </div>
          )}
          
          {battlePhase === 'preparing' && (
            <div className="text-center mb-8">
              <p className="text-lg text-gray-300">The battle is about to begin!</p>
              <button 
                className="battle-button mt-4 px-6 py-3 rounded-lg text-white font-bold"
                onClick={() => setIsBattling(true)}
              >
                Start Battle
              </button>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-around items-center gap-8">
            <div className="text-center">
              <h3 className="text-white font-bold mb-2">{currentPlayer.name}</h3>
              
              {/* Player Character Image */}
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-purple-500">
                  <img 
                    src={getCharacterImage(currentPlayer.nft.type)}
                    alt={`Your Type ${getTypeText(currentPlayer.nft.type)} Character`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <span className="bg-purple-900/50 px-3 py-1 rounded-full text-xs text-white">
                  Type {getTypeText(currentPlayer.nft.type)}
                </span>
              </div>
              <NFTCard 
                nft={currentPlayer.nft} 
                className="w-64 h-80"
                animate={isAnimating}
              />
            </div>
            
            <div className="flex flex-col items-center">
              {battlePhase === 'animation' && (
                <motion.div 
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-bold text-purple-500"
                >
                  VS
                </motion.div>
              )}
              
              {battlePhase === 'result' && (
                <div className="text-center p-4 bg-black/30 rounded-lg">
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Battle Result</h3>
                  
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 rounded-lg">
                    <p className="text-white text-lg">
                      <span className="font-bold">{winner?.name}</span> wins!
                    </p>
                    <p className="text-gray-300 mt-1">
                      <span className="font-bold">{loser?.name}</span>'s NFT was burned
                    </p>
                  </div>
                  
                  {newType !== null && winner && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-600/30 to-teal-600/30 rounded-lg">
                      <p className="text-white">
                        <span className="font-bold">{winner.name}'s NFT</span> mutated:
                      </p>
                      <p className="text-gray-300 mt-1">
                        Type {winner === currentPlayer ? getTypeText(currentPlayer.nft.type) : getTypeText(selectedOpponent.nft.type)} → 
                        <span className="font-bold text-white"> Type {getTypeText(newType)}</span>
                      </p>
                    </div>
                  )}
                  
                  <button 
                    className="battle-button mt-4 px-4 py-2 rounded-lg text-white text-sm font-bold"
                    onClick={handleFinishBattle}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className="text-white font-bold mb-2">{selectedOpponent.name}</h3>
              
              {/* Opponent Character Image */}
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-orange-500">
                  <img 
                    src={getCharacterImage(selectedOpponent.nft.type)}
                    alt={`${selectedOpponent.name}'s Type ${getTypeText(selectedOpponent.nft.type)} Character`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <span className="bg-purple-900/50 px-3 py-1 rounded-full text-xs text-white">
                  Type {getTypeText(selectedOpponent.nft.type)}
                </span>
              </div>
              <NFTCard 
                nft={selectedOpponent.nft} 
                className="w-64 h-80"
                animate={isAnimating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 