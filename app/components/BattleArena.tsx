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

  useEffect(() => {
    if (isBattling && battlePhase === 'preparing') {
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
  }, [isBattling, battlePhase]);

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
                  <p className="text-white">
                    <span className="font-bold">{winner?.name}</span> won the battle!
                  </p>
                  {newType !== null && (
                    <p className="text-gray-300 mt-2">
                      Their NFT mutated to Type {newType === 0 ? 'A' : newType === 1 ? 'B' : 'C'}
                    </p>
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