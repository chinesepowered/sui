"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../store/gameStore';
import NFTCard from './NFTCard';

type PlayerCardProps = {
  player: Player;
  isCurrentPlayer?: boolean;
  hasNft?: boolean;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export default function PlayerCard({ 
  player, 
  isCurrentPlayer = false,
  hasNft = true,
  onClick, 
  selected = false,
  disabled = false
}: PlayerCardProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div 
      className={`
        card p-4 rounded-xl text-white w-full max-w-xs mx-auto
        ${selected ? 'ring-2 ring-purple-500' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isCurrentPlayer ? 'border-2 border-accent-color' : ''}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white">
          {player.name.charAt(0)}
        </div>
        <div className="ml-3">
          <h3 className="font-bold">{player.name}</h3>
          <p className="text-xs text-gray-300">{truncateAddress(player.address)}</p>
        </div>
        {isCurrentPlayer && (
          <span className="ml-auto text-xs bg-purple-600 px-2 py-1 rounded-full">You</span>
        )}
      </div>

      {hasNft && player.nft ? (
        <div className="mt-4">
          <NFTCard 
            nft={player.nft} 
            showDetails={false}
            className="h-32"
          />
        </div>
      ) : (
        <div className="mt-4 border border-dashed border-gray-600 rounded-xl h-32 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No NFT</p>
        </div>
      )}
    </motion.div>
  );
} 