"use client";

import React, { useState } from 'react';

interface NFTMintInterfaceProps {
  onBatchMint: (addresses: string[]) => void;
}

export default function NFTMintInterface({ onBatchMint }: NFTMintInterfaceProps) {
  const [addresses, setAddresses] = useState('');
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    const addressList = addresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);

    if (addressList.length === 0) {
      alert('Please enter at least one address');
      return;
    }

    // Basic validation
    const invalidAddresses = addressList.filter(addr => !addr.startsWith('0x') || addr.length < 10);
    if (invalidAddresses.length > 0) {
      alert(`Invalid addresses found: ${invalidAddresses.join(', ')}`);
      return;
    }

    setMinting(true);
    try {
      await onBatchMint(addressList);
      setAddresses(''); // Clear the form
    } finally {
      setMinting(false);
    }
  };

  const addSampleAddresses = () => {
    const samples = [
      '0x1234567890abcdef1234567890abcdef12345678',
      '0xabcdef1234567890abcdef1234567890abcdef12',
      '0x567890abcdef1234567890abcdef1234567890ab'
    ];
    setAddresses(samples.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/20 rounded-xl border border-orange-500/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Batch Mint Battle NFTs</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Addresses (one per line)
            </label>
            <textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              placeholder="0x1234567890abcdef1234567890abcdef12345678&#10;0xabcdef1234567890abcdef1234567890abcdef12&#10;..."
              className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
              disabled={minting}
            />
            <p className="text-xs text-gray-400 mt-1">
              Each address will receive one randomly assigned Battle NFT (Cat, Dog, or Llama)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleMint}
              disabled={minting || !addresses.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              {minting ? 'Minting...' : 'Batch Mint NFTs'}
            </button>
            
            <button
              onClick={addSampleAddresses}
              disabled={minting}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Add Sample Addresses
            </button>
          </div>
        </div>
      </div>

      {/* Minting Instructions */}
      <div className="bg-black/10 rounded-xl border border-orange-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Minting Instructions</h3>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-orange-400 font-bold">1.</span>
            <div>
              <strong>Enter Addresses:</strong> Add one Sui address per line. Each address should start with "0x" and be properly formatted.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-orange-400 font-bold">2.</span>
            <div>
              <strong>Random Assignment:</strong> Each address will receive one Battle NFT with a randomly assigned type (Cat, Dog, or Llama).
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-orange-400 font-bold">3.</span>
            <div>
              <strong>Initial Stats:</strong> All new NFTs start with 0 kills and 0 mutations. Players earn these through battles.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-orange-400 font-bold">4.</span>
            <div>
              <strong>Admin Only:</strong> Only accounts with admin capabilities can mint NFTs. Make sure your wallet has the required permissions.
            </div>
          </div>
        </div>
      </div>

      {/* NFT Types Reference */}
      <div className="bg-black/10 rounded-xl border border-orange-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">NFT Types & Battle Rules</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'Cat', image: '/cat.jpg', beats: 'Dog', weakness: 'Llama' },
            { type: 'Dog', image: '/dog.jpg', beats: 'Llama', weakness: 'Cat' },
            { type: 'Llama', image: '/llama.jpg', beats: 'Cat', weakness: 'Dog' }
          ].map((nft) => (
            <div key={nft.type} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <img 
                src={nft.image} 
                alt={nft.type}
                className="w-16 h-16 rounded-lg mx-auto mb-3 object-cover"
              />
              <h4 className="text-white font-semibold mb-2">{nft.type}</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="text-green-400">Beats: {nft.beats}</div>
                <div className="text-red-400">Weak to: {nft.weakness}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}