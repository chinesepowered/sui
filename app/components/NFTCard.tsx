"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { NFT } from '../store/gameStore';

type NFTCardProps = {
  nft: NFT;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
  animate?: boolean;
};

export default function NFTCard({
  nft,
  selected = false,
  onClick,
  className = '',
  showDetails = true,
  animate = false
}: NFTCardProps) {
  const getTypeClass = () => {
    switch (nft.type) {
      case 0: return 'type-a';
      case 1: return 'type-b';
      case 2: return 'type-c';
      default: return 'type-a';
    }
  };

  const getTypeName = () => {
    switch (nft.type) {
      case 0: return 'Type A';
      case 1: return 'Type B';
      case 2: return 'Type C';
      default: return 'Unknown';
    }
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

  const cardVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)" },
    selected: { scale: 1.05, boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.3)" },
    battle: { 
      scale: [1, 1.1, 1], 
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 0.5, 
        repeat: animate ? Infinity : 0, 
        repeatDelay: 1 
      } 
    }
  };

  return (
    <motion.div
      className={`card relative overflow-hidden rounded-xl ${className} ${selected ? 'ring-4 ring-purple-500' : ''}`}
      variants={cardVariants}
      initial="idle"
      animate={selected ? "selected" : animate ? "battle" : "idle"}
      whileHover={!selected && !animate ? "hover" : undefined}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Character Image Background */}
      <div className="absolute inset-0">
        <img 
          src={getCharacterImage(nft.type)}
          alt={`${getTypeName()} Character`}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${getTypeClass()} opacity-60`} />
      </div>
      
      <div className="relative p-4 h-full flex flex-col justify-between z-10">
        <div className="mb-4 text-center">
          <div className="text-white font-bold text-lg drop-shadow-lg">NFT {nft.id.slice(-4)}</div>
          <div className="text-white/90 text-sm drop-shadow-lg">{getTypeName()}</div>
        </div>
        
        {showDetails && (
          <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-white/20">
            <div className="text-white/90 flex justify-between">
              <span>Kills:</span>
              <span className="font-mono">{nft.kills}</span>
            </div>
            <div className="text-white/90 flex justify-between">
              <span>Mutations:</span>
              <span className="font-mono">{nft.mutations}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 