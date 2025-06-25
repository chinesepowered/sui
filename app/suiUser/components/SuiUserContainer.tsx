"use client";

import React, { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import CustomConnectButton from '../../components/CustomConnectButton';
import SuiNFTCard from './SuiNFTCard';
import SuiBattleInterface from './SuiBattleInterface';
import { getUserNFTs, proposeBattle, executeBattle } from '../utils/suiRealUtils';

interface NFT {
  id: string;
  owner: string;
  nftType: number;
  kills: number;
  mutations: number;
}

export default function SuiUserContainer() {
  const currentAccount = useCurrentAccount();
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [battleInProgress, setBattleInProgress] = useState(false);

  useEffect(() => {
    if (currentAccount?.address) {
      loadUserNFTs();
    }
  }, [currentAccount]);

  const loadUserNFTs = async () => {
    if (!currentAccount?.address) return;
    
    setLoading(true);
    try {
      const nfts = await getUserNFTs(currentAccount.address);
      setUserNFTs(nfts);
      if (nfts.length > 0 && !selectedNFT) {
        setSelectedNFT(nfts[0]);
      }
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeBattle = async (opponentAddress: string) => {
    if (!selectedNFT || !currentAccount?.address) return;
    
    setBattleInProgress(true);
    try {
      await proposeBattle(selectedNFT.id, opponentAddress);
      alert('Battle proposal sent!');
    } catch (error) {
      console.error('Error proposing battle:', error);
      alert('Failed to propose battle');
    } finally {
      setBattleInProgress(false);
    }
  };

  const handleExecuteBattle = async (opponentNFTId: string) => {
    if (!selectedNFT || !currentAccount?.address) return;
    
    setBattleInProgress(true);
    try {
      const result = await executeBattle(selectedNFT.id, opponentNFTId);
      alert(`Battle completed! ${result.winner === currentAccount.address ? 'You won!' : 'You lost!'}`);
      await loadUserNFTs(); // Refresh NFTs
    } catch (error) {
      console.error('Error executing battle:', error);
      alert('Failed to execute battle');
    } finally {
      setBattleInProgress(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center p-8 bg-black/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-6">Sui Battle Player</h1>
          <p className="text-gray-300 mb-6">Connect your wallet to start playing</p>
          <CustomConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Sui Battle Player</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </span>
            <CustomConnectButton />
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              <p className="text-white mt-4">Loading your NFTs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - User's NFTs */}
              <div className="bg-black/20 rounded-xl border border-purple-500/30 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Your Battle NFTs</h2>
                
                {userNFTs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300 mb-4">You don't have any Battle NFTs yet.</p>
                    <p className="text-sm text-gray-400">Get some NFTs from an admin to start battling!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userNFTs.map((nft) => (
                      <SuiNFTCard
                        key={nft.id}
                        nft={nft}
                        selected={selectedNFT?.id === nft.id}
                        onClick={() => setSelectedNFT(nft)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right side - Battle Interface */}
              <div className="bg-black/20 rounded-xl border border-purple-500/30 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Battle Interface</h2>
                
                {selectedNFT ? (
                  <SuiBattleInterface
                    selectedNFT={selectedNFT}
                    onProposeBattle={handleProposeBattle}
                    onExecuteBattle={handleExecuteBattle}
                    battleInProgress={battleInProgress}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-300">Select an NFT to start battling</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}