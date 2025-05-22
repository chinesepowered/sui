"use client";

import { create } from 'zustand';
import { NFT_TYPE, DEMO_USERS } from '../lib/constants';

export type NFT = {
  id: string;
  owner: string;
  type: number;
  kills: number;
  mutations: number;
};

export type Player = {
  address: string;
  name: string;
  nft?: NFT;
};

export type BattleProposal = {
  from: Player;
  to: Player;
  fromNftId: string;
};

export type BattleResult = {
  winner: Player;
  loser: Player;
  winnerNftId: string;
  winnerNewType: number;
  winnerKills: number;
  winnerMutations: number;
};

type GameState = {
  players: Player[];
  nfts: NFT[];
  currentPlayer: Player | null;
  battleProposals: BattleProposal[];
  battleResults: BattleResult[];
  selectedOpponent: Player | null;
  isBattling: boolean;
  isAnimating: boolean;
  // Actions
  setCurrentPlayer: (player: Player) => void;
  addNFT: (nft: NFT) => void;
  removeNFT: (nftId: string) => void;
  proposeBattle: (from: Player, to: Player, fromNftId: string) => void;
  setBattleResult: (result: BattleResult) => void;
  selectOpponent: (player: Player | null) => void;
  setIsBattling: (value: boolean) => void;
  setIsAnimating: (value: boolean) => void;
  resetBattleState: () => void;
  // Demo data helpers
  loadDemoData: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  players: [],
  nfts: [],
  currentPlayer: null,
  battleProposals: [],
  battleResults: [],
  selectedOpponent: null,
  isBattling: false,
  isAnimating: false,
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  addNFT: (nft) => set((state) => ({
    nfts: [...state.nfts, nft]
  })),
  
  removeNFT: (nftId) => set((state) => ({
    nfts: state.nfts.filter(nft => nft.id !== nftId)
  })),
  
  proposeBattle: (from, to, fromNftId) => set((state) => ({
    battleProposals: [...state.battleProposals, { from, to, fromNftId }]
  })),
  
  setBattleResult: (result) => set((state) => ({
    battleResults: [...state.battleResults, result],
    // Update NFT data
    nfts: state.nfts.map(nft => {
      if (nft.id === result.winnerNftId) {
        return {
          ...nft,
          type: result.winnerNewType,
          kills: result.winnerKills,
          mutations: result.winnerMutations
        };
      }
      return nft;
    }).filter(nft => nft.owner !== result.loser.address), // Remove loser's NFT

    // Update players list to reflect NFT changes
    players: state.players.map(player => {
      if (player.address === result.winner.address) {
        // Update winner's NFT
        return {
          ...player,
          nft: {
            ...result.winner.nft!,
            type: result.winnerNewType,
            kills: result.winnerKills,
            mutations: result.winnerMutations
          }
        };
      } else if (player.address === result.loser.address) {
        // Remove loser's NFT
        return {
          ...player,
          nft: undefined
        };
      }
      return player;
    })
  })),
  
  selectOpponent: (player) => set({ selectedOpponent: player }),
  
  setIsBattling: (value) => set({ isBattling: value }),
  
  setIsAnimating: (value) => set({ isAnimating: value }),
  
  resetBattleState: () => set({ 
    selectedOpponent: null, 
    isBattling: false,
    isAnimating: false 
  }),
  
  loadDemoData: () => set(() => {
    // Create NFTs from demo data
    const demoNfts = DEMO_USERS.map(user => ({
      id: user.nftId,
      owner: user.address,
      type: user.nftType,
      kills: user.kills,
      mutations: user.mutations
    }));
    
    // Create players with associated NFTs
    const demoPlayers = DEMO_USERS.map((user, index) => ({
      address: user.address,
      name: user.name,
      nft: demoNfts[index] // Associate NFT with player
    }));
    
    // Set the first player as current player
    const currentPlayer = demoPlayers[0];
    
    return {
      players: demoPlayers,
      nfts: demoNfts,
      currentPlayer
    };
  })
})); 