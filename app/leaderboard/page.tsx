"use client";

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Leaderboard = dynamic(
  () => import('../components/Leaderboard'),
  { ssr: false }
);

export default function LeaderboardPage() {
  const { loadDemoData, currentPlayer } = useGameStore();
  
  // Load demo data on initial render
  useEffect(() => {
    loadDemoData();
  }, []);
  
  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md p-6 bg-card-bg rounded-xl text-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card-bg py-4 px-6 flex items-center justify-between border-b border-purple-900/30">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center">
            <span className="text-white font-bold">🏆</span>
          </div>
          <div className="ml-3">
            <p className="text-white font-bold">Battle Leaderboard</p>
            <p className="text-xs text-gray-400">Top Players & NFTs</p>
          </div>
        </div>
        
        <Link 
          href="/"
          className="px-4 py-2 rounded-lg bg-purple-800/50 text-white text-sm hover:bg-purple-800/70 transition-colors"
        >
          Back to Battle
        </Link>
      </header>
      
      {/* Leaderboard Content */}
      <main className="flex-1 p-4 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl">
          <Leaderboard />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-card-bg py-3 px-6 text-center border-t border-purple-900/30">
        <p className="text-sm text-gray-400">Sui Battle AR • Leaderboard</p>
      </footer>
    </div>
  );
} 