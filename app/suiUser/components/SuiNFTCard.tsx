"use client";

import React from 'react';

interface NFT {
  id: string;
  owner: string;
  nftType: number;
  kills: number;
  mutations: number;
}

interface SuiNFTCardProps {
  nft: NFT;
  selected?: boolean;
  onClick?: () => void;
}

const NFT_TYPES = ['Cat', 'Dog', 'Llama'];
const NFT_IMAGES = ['/cat.jpg', '/dog.jpg', '/llama.jpg'];

export default function SuiNFTCard({ nft, selected = false, onClick }: SuiNFTCardProps) {
  const typeName = NFT_TYPES[nft.nftType] || 'Unknown';
  const imageUrl = NFT_IMAGES[nft.nftType] || '/cat.jpg';

  return (
    <div 
      className={`relative bg-card-bg rounded-xl border transition-all duration-200 cursor-pointer ${
        selected 
          ? 'border-purple-400 shadow-lg shadow-purple-500/25 scale-105' 
          : 'border-purple-900/30 hover:border-purple-500/50'
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
          <img 
            src={imageUrl} 
            alt={typeName}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold text-white text-lg">{typeName}</h3>
          
          <div className="text-sm text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Kills:</span>
              <span className="text-red-400 font-semibold">{nft.kills}</span>
            </div>
            <div className="flex justify-between">
              <span>Mutations:</span>
              <span className="text-blue-400 font-semibold">{nft.mutations}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 break-all mt-2">
            ID: {nft.id.slice(0, 8)}...{nft.id.slice(-4)}
          </div>
        </div>
      </div>
      
      {selected && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
          Selected
        </div>
      )}
    </div>
  );
}