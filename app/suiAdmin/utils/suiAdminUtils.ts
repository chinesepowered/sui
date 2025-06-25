import { SuiClient } from "@mysten/sui/client";
import { TransactionBlock } from "@mysten/sui/transactions";
import { NETWORK_RPC_URL, PACKAGE_ID } from '../../lib/constants';

// Initialize Sui client
const suiClient = new SuiClient({ url: NETWORK_RPC_URL });

interface AdminStats {
  totalNFTs: number;
  totalBattles: number;
  activePlayers: number;
  recentMints: number;
}

// Batch mint NFTs to multiple addresses
export const batchMintNFTs = async (addresses: string[]): Promise<string> => {
  try {
    const txb = new TransactionBlock();
    
    // Get random object (required for minting)
    const randomObj = '0x8'; // System random object
    
    txb.moveCall({
      target: `${PACKAGE_ID}::game::batch_mint`,
      arguments: [
        // Note: This would need the AdminCap object in a real implementation
        txb.object('ADMIN_CAP_OBJECT_ID'), // Admin capability object
        txb.pure(addresses), // Array of addresses
        txb.object(randomObj) // Random object
      ],
    });

    // Note: In a real implementation, you would need to sign and execute this transaction
    // For now, we'll return a simulated transaction ID
    const simulatedTxId = `sim_batch_mint_${Math.random().toString(36).substring(2, 10)}`;
    
    console.log('Batch mint transaction prepared for addresses:', addresses);
    console.log('Simulated TX ID:', simulatedTxId);
    
    return simulatedTxId;
  } catch (error) {
    console.error('Error batch minting NFTs:', error);
    throw error;
  }
};

// Get admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // In a real implementation, this would query the blockchain for actual data
    // For now, we'll return simulated stats
    const simulatedStats: AdminStats = {
      totalNFTs: Math.floor(Math.random() * 1000) + 500,
      totalBattles: Math.floor(Math.random() * 500) + 100,
      activePlayers: Math.floor(Math.random() * 200) + 50,
      recentMints: Math.floor(Math.random() * 50) + 5
    };

    console.log('Admin stats loaded:', simulatedStats);
    return simulatedStats;
  } catch (error) {
    console.error('Error loading admin stats:', error);
    return {
      totalNFTs: 0,
      totalBattles: 0,
      activePlayers: 0,
      recentMints: 0
    };
  }
};

// Get all battle-related events
export const getAllBattleEvents = async (): Promise<any[]> => {
  try {
    const events = await suiClient.queryEvents({
      query: {
        MoveModule: {
          package: PACKAGE_ID,
          module: 'game'
        }
      },
      limit: 100,
      order: 'descending'
    });

    console.log('Battle events loaded:', events.data.length);
    return events.data;
  } catch (error) {
    console.error('Error fetching battle events:', error);
    
    // Return simulated events for demo purposes
    const simulatedEvents = Array.from({ length: 20 }, (_, i) => ({
      id: { txDigest: `sim_tx_${i}_${Math.random().toString(36).substring(2, 8)}` },
      timestampMs: Date.now() - (i * 300000), // Events every 5 minutes
      type: ['BattleResult', 'BattleProposal', 'NFTMinted'][Math.floor(Math.random() * 3)],
      parsedJson: {
        winner: `0x${Math.random().toString(16).substring(2, 10)}...`,
        loser: `0x${Math.random().toString(16).substring(2, 10)}...`,
        winner_new_type: Math.floor(Math.random() * 3),
        winner_kills: Math.floor(Math.random() * 10) + 1,
        winner_mutations: Math.floor(Math.random() * 5) + 1,
        from: `0x${Math.random().toString(16).substring(2, 10)}...`,
        to: `0x${Math.random().toString(16).substring(2, 10)}...`,
        owner: `0x${Math.random().toString(16).substring(2, 10)}...`,
        nft_type: Math.floor(Math.random() * 3)
      }
    }));
    
    return simulatedEvents;
  }
};

// Get all NFTs in the system
export const getAllNFTs = async (): Promise<any[]> => {
  try {
    // This would be a complex query in a real implementation
    // We'd need to query all BattleNFT objects across all addresses
    console.log('Fetching all NFTs...');
    
    // For demo purposes, return empty array
    // In a real implementation, you'd use suiClient.multiGetObjects or similar
    return [];
  } catch (error) {
    console.error('Error fetching all NFTs:', error);
    return [];
  }
};

// Get player statistics
export const getPlayerStats = async (playerAddress: string): Promise<any> => {
  try {
    // Get player's NFTs
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: playerAddress,
      filter: {
        StructType: `${PACKAGE_ID}::game::BattleNFT`
      },
      options: {
        showContent: true
      }
    });

    // Get player's battle history
    const events = await suiClient.queryEvents({
      query: {
        MoveModule: {
          package: PACKAGE_ID,
          module: 'game'
        }
      },
      limit: 100,
      order: 'descending'
    });

    const playerEvents = events.data.filter(event => {
      const parsedJson = event.parsedJson as any;
      return parsedJson && (
        parsedJson.winner === playerAddress || 
        parsedJson.loser === playerAddress ||
        parsedJson.from === playerAddress ||
        parsedJson.to === playerAddress ||
        parsedJson.owner === playerAddress
      );
    });

    return {
      nftCount: ownedObjects.data.length,
      battleCount: playerEvents.filter(e => e.type?.includes('BattleResult')).length,
      wins: playerEvents.filter(e => e.type?.includes('BattleResult') && (e.parsedJson as any)?.winner === playerAddress).length,
      lastActivity: playerEvents[0]?.timestampMs || null
    };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return {
      nftCount: 0,
      battleCount: 0,
      wins: 0,
      lastActivity: null
    };
  }
};

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};