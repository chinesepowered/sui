"use client";

import React from 'react';
import { useGameStore, NFT, Player } from '../store/gameStore';

export default function Leaderboard() {
  const { nfts, players } = useGameStore();
  
  // Sort NFTs by kills in descending order
  const sortedNfts = [...nfts].sort((a, b) => b.kills - a.kills);
  
  // Get owner name from player address
  const getPlayerName = (address: string) => {
    const player = players.find((p: Player) => p.address === address);
    return player ? player.name : 'Unknown Player';
  };
  
  // Determine NFT type name
  const getNftTypeName = (type: number) => {
    switch (type) {
      case 0: return 'Type A';
      case 1: return 'Type B';
      case 2: return 'Type C';
      default: return 'Unknown';
    }
  };
  
  // Get type color class
  const getTypeColorClass = (type: number) => {
    switch (type) {
      case 0: return 'bg-pink-600';
      case 1: return 'bg-blue-600';
      case 2: return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-card-bg rounded-xl p-6 border border-purple-900/30">
        <h2 className="text-xl font-bold mb-6 text-white text-center">Battle Leaderboard</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-2 text-gray-400 font-normal text-sm">Rank</th>
                <th className="pb-2 text-gray-400 font-normal text-sm">Player</th>
                <th className="pb-2 text-gray-400 font-normal text-sm">NFT</th>
                <th className="pb-2 text-gray-400 font-normal text-sm">Type</th>
                <th className="pb-2 text-gray-400 font-normal text-sm text-right">Kills</th>
                <th className="pb-2 text-gray-400 font-normal text-sm text-right">Mutations</th>
              </tr>
            </thead>
            <tbody>
              {sortedNfts.map((nft, index) => (
                <tr key={nft.id} className="border-b border-gray-800 hover:bg-black/20">
                  <td className="py-3 font-bold text-gray-300">{index + 1}</td>
                  <td className="py-3">{getPlayerName(nft.owner)}</td>
                  <td className="py-3 font-mono text-xs text-gray-400">
                    {nft.id.slice(-4)}
                  </td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${getTypeColorClass(nft.type)}`}>
                      {getNftTypeName(nft.type)}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold">{nft.kills}</td>
                  <td className="py-3 text-right text-gray-300">{nft.mutations}</td>
                </tr>
              ))}
              
              {sortedNfts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    No battle data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 