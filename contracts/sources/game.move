module 0x0::game {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::random::{Self, Random};
    // Removed unused aliases from imports
    use sui::clock::Clock;
    use std::vector;
    // Removed unused option import

    // Constants for NFT types
    const TYPE_A: u8 = 0;
    const TYPE_B: u8 = 1;
    const TYPE_C: u8 = 2;
    
    // Constants for battle probabilities
    const ADVANTAGE_PROBABILITY: u64 = 75; // 75% win rate for advantageous matchups
    const EQUAL_PROBABILITY: u64 = 50;     // 50% win rate for equal matchups
    const MAX_PROBABILITY: u64 = 100;      // Used for calculations
    
    // Error codes
    // Keep these for future use even if currently unused
    const ENotAdmin: u64 = 0;
    const EAlreadyOwnsNFT: u64 = 1;
    const ECannotBattleYourself: u64 = 2;
    const EBattlerNotFound: u64 = 3;
    const ERequesterNotFound: u64 = 4;
    const EInvalidNFTType: u64 = 5;

    // The Battle NFT
    struct BattleNFT has key, store {
        id: UID,
        owner: address,
        nft_type: u8,  // 0 = A, 1 = B, 2 = C
        kills: u8,
        mutations: u8,
    }
    
    // Game admin capability
    struct AdminCap has key {
        id: UID,
    }
    
    // Events
    struct BattleProposal has copy, drop {
        from: address,
        to: address,
        from_nft_id: ID,
    }
    
    struct BattleResult has copy, drop {
        winner: address,
        loser: address,
        winner_nft_id: ID,
        winner_new_type: u8,
        winner_kills: u8,
        winner_mutations: u8,
    }
    
    struct NFTMinted has copy, drop {
        owner: address,
        nft_id: ID,
        nft_type: u8,
    }
    
    // === Initialization ===
    
    fun init(ctx: &mut TxContext) {
        // Create and transfer the admin capability
        transfer::transfer(
            AdminCap {
                id: object::new(ctx),
            },
            tx_context::sender(ctx)
        );
    }
    
    // === Admin Functions ===
    
    // Fixed: Changed &mut Random to &Random for entry function
    public entry fun batch_mint(
        _: &AdminCap,
        addresses: vector<address>,
        random_obj: &Random, // Changed from &mut Random
        ctx: &mut TxContext
    ) {
        let i = 0;
        let len = vector::length(&addresses);
        
        while (i < len) {
            let addr = *vector::borrow(&addresses, i);
            // Fixed: Using correct function from random module
            let random_number = random::u64_with_max(random_obj, 3);
            let nft_type = (random_number as u8);
            
            let nft = BattleNFT {
                id: object::new(ctx),
                owner: addr,
                nft_type: nft_type,
                kills: 0,
                mutations: 0,
            };
            
            // Emit an event
            event::emit(NFTMinted {
                owner: addr,
                nft_id: object::id(&nft),
                nft_type: nft_type,
            });
            
            // Transfer NFT to the recipient
            transfer::transfer(nft, addr);
            
            i = i + 1;
        }
    }
    
    // === Player Functions ===
    
    // Propose a battle to another player
    public entry fun propose_battle(
        nft: &BattleNFT,
        opponent: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate that the player owns the NFT
        assert!(nft.owner == sender, ERequesterNotFound);
        
        // Validate that the player is not challenging themselves
        assert!(sender != opponent, ECannotBattleYourself);
        
        // Emit a battle proposal event
        event::emit(BattleProposal {
            from: sender,
            to: opponent,
            from_nft_id: object::id(nft),
        });
    }
    
    // Accept a battle from another player
    // Fixed: Changed &mut Random to &Random for entry function
    public entry fun battle_with(
        responder_nft: &mut BattleNFT,
        requester_nft: &mut BattleNFT,
        random_obj: &Random, // Changed from &mut Random
        clock: &Clock, // Kept for future use even if currently unused
        ctx: &mut TxContext
    ) {
        let responder = tx_context::sender(ctx);
        let requester = requester_nft.owner;
        
        // Validate players
        assert!(responder_nft.owner == responder, EBattlerNotFound);
        assert!(requester_nft.owner == requester, ERequesterNotFound);
        assert!(responder != requester, ECannotBattleYourself);
        
        // Validate NFT types
        assert!(responder_nft.nft_type <= TYPE_C, EInvalidNFTType);
        assert!(requester_nft.nft_type <= TYPE_C, EInvalidNFTType);
        
        // Determine battle outcome
        let responder_wins = determine_winner(
            responder_nft.nft_type,
            requester_nft.nft_type,
            random_obj
        );
        
        if (responder_wins) {
            // Responder wins
            let new_type = determine_mutation(responder_nft.nft_type, requester_nft.nft_type);
            responder_nft.nft_type = new_type;
            responder_nft.kills = responder_nft.kills + 1;
            responder_nft.mutations = responder_nft.mutations + 1;
            
            // Emit battle result
            event::emit(BattleResult {
                winner: responder,
                loser: requester,
                winner_nft_id: object::id(responder_nft),
                winner_new_type: new_type,
                winner_kills: responder_nft.kills,
                winner_mutations: responder_nft.mutations,
            });
            
            // Burn loser's NFT (transfer to @0x0)
            requester_nft.owner = @0x0;
        } else {
            // Requester wins
            let new_type = determine_mutation(requester_nft.nft_type, responder_nft.nft_type);
            requester_nft.nft_type = new_type;
            requester_nft.kills = requester_nft.kills + 1;
            requester_nft.mutations = requester_nft.mutations + 1;
            
            // Emit battle result
            event::emit(BattleResult {
                winner: requester,
                loser: responder,
                winner_nft_id: object::id(requester_nft),
                winner_new_type: new_type,
                winner_kills: requester_nft.kills,
                winner_mutations: requester_nft.mutations,
            });
            
            // Burn loser's NFT (transfer to @0x0)
            responder_nft.owner = @0x0;
        }
    }
    
    // === Helper Functions ===
    
    // Determine the winner based on NFT types and probability
    // Fixed: Changed &mut Random to &Random to match entry function signature
    fun determine_winner(
        responder_type: u8,
        requester_type: u8,
        random_obj: &Random // Changed from &mut Random
    ): bool {
        // Calculate win probability for responder
        let responder_win_probability = if (responder_type == requester_type) {
            // Equal types: 50% chance
            EQUAL_PROBABILITY
        } else if (
            (responder_type == TYPE_A && requester_type == TYPE_B) ||
            (responder_type == TYPE_B && requester_type == TYPE_C) ||
            (responder_type == TYPE_C && requester_type == TYPE_A)
        ) {
            // Advantageous matchup: 75% chance
            ADVANTAGE_PROBABILITY
        } else {
            // Disadvantageous matchup: 25% chance
            MAX_PROBABILITY - ADVANTAGE_PROBABILITY
        };
        
        // Generate random number between 0 and 99
        // Fixed: Using correct function from random module
        let random_value = random::u64_with_max(random_obj, MAX_PROBABILITY);
        
        // Return true if responder wins
        random_value < responder_win_probability
    }
    
    // Determine the new NFT type after mutation
    fun determine_mutation(winner_type: u8, loser_type: u8): u8 {
        // A + B -> C
        // B + C -> A
        // C + A -> B
        // Same type -> random other type
        
        if (winner_type == loser_type) {
            // If same type, choose a different type randomly
            // Simple deterministic approach: go to the next type in sequence
            (winner_type + 1) % 3
        } else {
            // Different types: use the remaining type that's neither winner nor loser
            (3 - winner_type - loser_type) % 3
        }
    }
    
    // === View Functions ===
    
    // Get NFT details
    public fun get_nft_details(nft: &BattleNFT): (address, u8, u8, u8) {
        (nft.owner, nft.nft_type, nft.kills, nft.mutations)
    }
    
    // Get NFT type name
    public fun get_nft_type_name(nft_type: u8): vector<u8> {
        if (nft_type == TYPE_A) {
            b"Type A"
        } else if (nft_type == TYPE_B) {
            b"Type B"
        } else if (nft_type == TYPE_C) {
            b"Type C"
        } else {
            b"Unknown"
        }
    }
}