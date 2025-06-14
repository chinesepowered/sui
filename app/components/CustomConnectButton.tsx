"use client";

import React, { useEffect } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useGameStore } from '../store/gameStore';
import { DEMO_USERS } from '../lib/constants';

export default function CustomConnectButton() {
  const currentAccount = useCurrentAccount();
  const { setCurrentPlayer, players } = useGameStore();

  // Hook into wallet connection attempts and simulate for demo
  useEffect(() => {
    const handleWalletClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
             // Check if the clicked element is a wallet option that contains "slush"
       const walletText = target.textContent?.toLowerCase() || '';
       const isSlushWallet = walletText.includes('slush');
      
      if (isSlushWallet) {
        event.preventDefault();
        event.stopPropagation();
        
                 // Simulate wallet connection
         setTimeout(() => {
           const demoUser = DEMO_USERS[0];
           setCurrentPlayer(demoUser);
           console.log(`Connected to wallet: ${demoUser.address}`);
           
           // Show authentic wallet connection notification
           if (typeof window !== 'undefined') {
             const notification = document.createElement('div');
             notification.innerHTML = `
               <div style="
                 position: fixed;
                 top: 20px;
                 right: 20px;
                 background: #1a1a2e;
                 color: white;
                 padding: 12px 16px;
                 border-radius: 8px;
                 border: 1px solid #00d4aa;
                 z-index: 9999;
                 font-size: 14px;
                 box-shadow: 0 4px 12px rgba(0,0,0,0.3);
               ">
                 ✅ Wallet Connected Successfully
               </div>
             `;
             document.body.appendChild(notification);
             
             setTimeout(() => {
               document.body.removeChild(notification);
             }, 3000);
           }
         }, 500);
      }
    };

    // Add click listener to document to catch wallet selection clicks
    document.addEventListener('click', handleWalletClick, true);
    
    return () => {
      document.removeEventListener('click', handleWalletClick, true);
    };
  }, [setCurrentPlayer]);

  // If we have a real wallet connected, show that
  if (currentAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs text-green-400">✓ Connected</div>
        <ConnectButton />
      </div>
    );
  }

  // If we have a simulated wallet connection, show connected state
  const currentPlayer = useGameStore.getState().currentPlayer;
  if (currentPlayer && !currentAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs text-green-400">✓ Connected</div>
        <button
          onClick={() => {
            setCurrentPlayer(null);
            console.log('Wallet disconnected');
          }}
          className="px-3 py-2 rounded-lg bg-red-600/50 text-white text-sm hover:bg-red-600/70 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Default connect button
  return <ConnectButton />;
} 