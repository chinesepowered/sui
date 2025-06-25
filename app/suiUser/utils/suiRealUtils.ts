import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { NETWORK_RPC_URL, PACKAGE_ID } from '../../lib/constants';

// Initialize Sui client
const suiClient = new SuiClient({ url: NETWORK_RPC_URL });

interface NFT {
  id: string;
  owner: string;
  nftType: number;
  kills: number;
  mutations: number;
}

interface BattleResult {
  winner: string;
  loser: string;
  winnerNftId: string;
  winnerNewType: number;
  winnerKills: number;
  winnerMutations: number;
}

// Get all NFTs owned by a user
export const getUserNFTs = async (ownerAddress: string): Promise<NFT[]> => {
  try {
    // Get all objects owned by the user
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${PACKAGE_ID}::game::BattleNFT`
      },
      options: {
        showContent: true,
        showType: true,
      }
    });

    const nfts: NFT[] = [];
    
    for (const obj of ownedObjects.data) {
      if (obj.data?.content && 'fields' in obj.data.content) {
        const fields = obj.data.content.fields as any;
        nfts.push({
          id: obj.data.objectId,
          owner: fields.owner,
          nftType: fields.nft_type,
          kills: fields.kills,
          mutations: fields.mutations,
        });
      }
    }

    return nfts;
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return [];
  }
};

// Create a battle proposal transaction
export const createProposeBattleTransaction = (nftId: string, opponentAddress: string): Transaction => {
  const txb = new Transaction();
  
  txb.moveCall({
    target: `${PACKAGE_ID}::game::propose_battle`,
    arguments: [
      txb.object(nftId),
      txb.pure.address(opponentAddress)
    ],
  });

  return txb;
};

// Helper function for backward compatibility - now just creates transaction
export const proposeBattle = async (nftId: string, opponentAddress: string): Promise<string> => {
  try {
    // Return a simulated ID - actual execution should be done in the component
    const simulatedTxId = `prepare_propose_${Math.random().toString(36).substring(2, 10)}`;
    console.log('Battle proposal transaction created for:', { nftId, opponentAddress });
    return simulatedTxId;
  } catch (error) {
    console.error('Error creating battle proposal:', error);
    throw error;
  }
};

// Create a battle execution transaction
export const createBattleTransaction = (responderNftId: string, requesterNftId: string): Transaction => {
  const txb = new Transaction();
  
  txb.moveCall({
    target: `${PACKAGE_ID}::game::battle_with`,
    arguments: [
      txb.object(responderNftId),
      txb.object(requesterNftId),
      txb.object('0x8'), // Random object
      txb.object('0x6')  // Clock object
    ],
  });

  return txb;
};

// Helper function for backward compatibility - now just creates simulated result
export const executeBattle = async (userNftId: string, opponentNftId: string): Promise<BattleResult> => {
  try {
    // Return simulated result - actual execution should be done in the component
    const simulatedResult: BattleResult = {
      winner: Math.random() > 0.5 ? 'user' : 'opponent',
      loser: Math.random() > 0.5 ? 'opponent' : 'user',
      winnerNftId: userNftId,
      winnerNewType: Math.floor(Math.random() * 3),
      winnerKills: Math.floor(Math.random() * 5) + 1,
      winnerMutations: Math.floor(Math.random() * 3) + 1,
    };
    
    console.log('Battle transaction created for:', { userNftId, opponentNftId });
    return simulatedResult;
  } catch (error) {
    console.error('Error creating battle transaction:', error);
    throw error;
  }
};

// Get battle events for a user
export const getUserBattleHistory = async (userAddress: string): Promise<any[]> => {
  try {
    const events = await suiClient.queryEvents({
      query: {
        MoveModule: {
          package: PACKAGE_ID,
          module: 'game'
        }
      },
      limit: 50,
      order: 'descending'
    });

    // Filter events related to the user
    const userEvents = events.data.filter(event => {
      const parsedJson = event.parsedJson as any;
      return parsedJson && (
        parsedJson.winner === userAddress || 
        parsedJson.loser === userAddress ||
        parsedJson.from === userAddress ||
        parsedJson.to === userAddress
      );
    });

    return userEvents;
  } catch (error) {
    console.error('Error fetching battle history:', error);
    return [];
  }
};

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};