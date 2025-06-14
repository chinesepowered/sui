"use client";

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MobileBattle = dynamic(
  () => import('../components/MobileBattle'),
  { ssr: false }
);

export default function MobilePage() {
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
      {/* Mobile App-like Header */}
      <header className="bg-card-bg py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center">
            <span className="text-white font-bold">{currentPlayer.name.charAt(0)}</span>
          </div>
          <div className="ml-3">
            <p className="text-white font-bold">{currentPlayer.name}</p>
            <p className="text-xs text-gray-400">
              {currentPlayer.address.slice(0, 6)}...{currentPlayer.address.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link 
            href="/leaderboard"
            className="px-3 py-2 rounded-lg bg-black/30 text-white text-xs"
          >
            Leaderboard
          </Link>
          <Link 
            href="/"
            className="px-3 py-2 rounded-lg bg-black/30 text-white text-xs"
          >
            Battle Arena
          </Link>
        </div>
      </header>
      
      {/* Mobile Battle Interface */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <MobileBattle />
      </main>
      
      {/* Mobile App-like Footer */}
      <footer className="bg-card-bg py-3 px-6 text-center">
        <p className="text-sm text-gray-400">Sui Battle AR • IRL Convention Mode</p>
      </footer>
    </div>
  );
} 