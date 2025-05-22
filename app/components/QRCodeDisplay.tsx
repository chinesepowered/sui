"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Simple QR code generator for demo purposes
const generateQRSVG = (data: string): string => {
  // This is a simplified QR code for demo purposes
  // In a real app, use a proper QR code library
  const size = 20;
  const cellSize = 10;
  
  let svg = `<svg width="${size * cellSize}" height="${size * cellSize}" viewBox="0 0 ${size * cellSize} ${size * cellSize}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add fixed QR code pattern corners
  svg += `<rect x="0" y="0" width="${3 * cellSize}" height="${3 * cellSize}" fill="black"/>`;
  svg += `<rect x="${(size-3) * cellSize}" y="0" width="${3 * cellSize}" height="${3 * cellSize}" fill="black"/>`;
  svg += `<rect x="0" y="${(size-3) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="black"/>`;
  
  // Add inner white squares for corners
  svg += `<rect x="${cellSize}" y="${cellSize}" width="${cellSize}" height="${cellSize}" fill="white"/>`;
  svg += `<rect x="${(size-2) * cellSize}" y="${cellSize}" width="${cellSize}" height="${cellSize}" fill="white"/>`;
  svg += `<rect x="${cellSize}" y="${(size-2) * cellSize}" width="${cellSize}" height="${cellSize}" fill="white"/>`;
  
  // Deterministic pattern based on address
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    const x = (i % (size-8) + 4) * cellSize;
    const y = (Math.floor(i / (size-8)) + 4) * cellSize;
    
    if (charCode % 3 === 0) {
      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
    }
  }
  
  svg += '</svg>';
  return svg;
};

type QRCodeDisplayProps = {
  address: string;
  size?: 'sm' | 'md' | 'lg';
  showAddress?: boolean;
};

export default function QRCodeDisplay({ 
  address, 
  size = 'md',
  showAddress = true 
}: QRCodeDisplayProps) {
  const [qrSvg, setQrSvg] = useState<string>('');
  
  // Generate QR code SVG when address changes
  useEffect(() => {
    if (address) {
      setQrSvg(generateQRSVG(address));
    }
  }, [address]);
  
  const truncateAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  const containerSizes = {
    sm: 'w-32 h-32',
    md: 'w-56 h-56',
    lg: 'w-72 h-72'
  };
  
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className={`${containerSizes[size]} bg-white p-3 rounded-xl overflow-hidden flex items-center justify-center`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {qrSvg ? (
          <div 
            className="w-full h-full" 
            dangerouslySetInnerHTML={{ __html: qrSvg }} 
          />
        ) : (
          <div className="animate-pulse bg-gray-300 w-full h-full rounded-lg" />
        )}
      </motion.div>
      
      {showAddress && (
        <div className="mt-4 bg-card-bg py-2 px-4 rounded-full text-sm text-center">
          <span className="font-mono text-gray-300">{truncateAddress(address)}</span>
        </div>
      )}
    </div>
  );
} 