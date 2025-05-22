import { SuiClient } from "@mysten/sui.js/client";
import { NETWORK_RPC_URL, PACKAGE_ID, MODULE_NAME } from './constants';

// Initialize SUI client
export const suiClient = new SuiClient({ url: NETWORK_RPC_URL });

// For the demo, we'll simulate blockchain calls
export const simulateBattleProposal = async (
  fromAddress: string, 
  toAddress: string, 
  nftId: string
) => {
  console.log(`Proposing battle from ${fromAddress} to ${toAddress} with NFT ${nftId}`);
  // In a real implementation, this would call the blockchain
  return {
    success: true,
    txId: `sim_tx_${Math.random().toString(36).substring(2, 10)}`
  };
};

export const simulateBattle = async (
  responderAddress: string,
  responderNftId: string,
  requesterAddress: string,
  requesterNftId: string
) => {
  console.log(`Battle between ${responderAddress} (${responderNftId}) and ${requesterAddress} (${requesterNftId})`);
  // In a real implementation, this would call the blockchain
  return {
    success: true,
    txId: `sim_tx_${Math.random().toString(36).substring(2, 10)}`
  };
};

// Format a Sui address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Parse battle outcome from a transaction
export const parseBattleResult = (txData: any) => {
  // In a real implementation, this would parse blockchain event data
  // For the demo, we'll return simulated data
  return {
    winner: 'demo-winner',
    loser: 'demo-loser',
    winnerNftId: 'demo-nft-id',
    winnerNewType: 1,
    winnerKills: 1,
    winnerMutations: 1
  };
}; 