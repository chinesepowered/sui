"use client";

import React, { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import CustomConnectButton from '../../components/CustomConnectButton';
import NFTMintInterface from './NFTMintInterface';
import AdminStats from './AdminStats';
import BattleHistory from './BattleHistory';
import { batchMintNFTs, getAdminStats, getAllBattleEvents } from '../utils/suiAdminUtils';

interface AdminStats {
  totalNFTs: number;
  totalBattles: number;
  activePlayers: number;
  recentMints: number;
}

export default function SuiAdminContainer() {
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<'mint' | 'stats' | 'history'>('mint');
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalNFTs: 0,
    totalBattles: 0,
    activePlayers: 0,
    recentMints: 0
  });
  const [battleEvents, setBattleEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAccount?.address) {
      loadAdminData();
    }
  }, [currentAccount]);

  const loadAdminData = async () => {
    if (!currentAccount?.address) return;
    
    setLoading(true);
    try {
      const [stats, events] = await Promise.all([
        getAdminStats(),
        getAllBattleEvents()
      ]);
      
      setAdminStats(stats);
      setBattleEvents(events);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchMint = async (addresses: string[]) => {
    if (!currentAccount?.address) return;
    
    try {
      await batchMintNFTs(addresses);
      alert(`Successfully minted NFTs for ${addresses.length} addresses!`);
      await loadAdminData(); // Refresh stats
    } catch (error) {
      console.error('Error minting NFTs:', error);
      alert('Failed to mint NFTs');
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900">
        <div className="text-center p-8 bg-black/20 rounded-xl border border-orange-500/30 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-6">Sui Battle Admin</h1>
          <p className="text-gray-300 mb-6">Connect your admin wallet to manage the game</p>
          <CustomConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-orange-500/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Sui Battle Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Admin: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </span>
            <CustomConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-black/10 border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'mint', label: 'Mint NFTs', icon: '🎯' },
              { id: 'stats', label: 'Statistics', icon: '📊' },
              { id: 'history', label: 'Battle History', icon: '⚔️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-400 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
              <p className="text-white mt-4">Loading admin data...</p>
            </div>
          ) : (
            <div>
              {activeTab === 'mint' && (
                <NFTMintInterface onBatchMint={handleBatchMint} />
              )}
              
              {activeTab === 'stats' && (
                <AdminStats stats={adminStats} />
              )}
              
              {activeTab === 'history' && (
                <BattleHistory events={battleEvents} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}