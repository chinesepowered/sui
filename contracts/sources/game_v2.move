module 0x0::game_v2 {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::random::{Self, Random};
    use sui::clock::Clock;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::vector;

    // Constants for NFT types
    const TYPE_CAT: u8 = 0;
    const TYPE_DOG: u8 = 1;
    const TYPE_LLAMA: u8 = 2;
    
    // Constants for battle probabilities
    const ADVANTAGE_PROBABILITY: u64 = 75; // 75% win rate for advantageous matchups
    const EQUAL_PROBABILITY: u64 = 50;     // 50% win rate for equal matchups
    const MAX_PROBABILITY: u64 = 100;      // Used for calculations
    
    // Battle entry fee (in MIST - 1 SUI = 1_000_000_000 MIST)
    const BATTLE_FEE: u64 = 10_000_000; // 0.01 SUI
    
    // Error codes
    const ENotAdmin: u64 = 0;
    const EAlreadyOwnsNFT: u64 = 1;
    const ECannotBattleYourself: u64 = 2;
    const EBattlerNotFound: u64 = 3;
    const ERequesterNotFound: u64 = 4;
    const EInvalidNFTType: u64 = 5;
    const EInsufficientFee: u64 = 6;
    const EBattleProposalNotFound: u64 = 7;
    const EBattleProposalExpired: u64 = 8;

    // The Battle NFT with enhanced features
    struct BattleNFT has key, store {
        id: UID,
        owner: address,
        nft_type: u8,  // 0 = Cat, 1 = Dog, 2 = Llama
        kills: u64,
        mutations: u64,
        level: u8,     // Level based on experience
        experience: u64,
        created_at: u64,
    }
    
    // Game admin capability
    struct AdminCap has key {
        id: UID,
    }
    
    // Game treasury for collecting fees
    struct GameTreasury has key {
        id: UID,
        balance: Coin<SUI>,
    }
    
    // Battle proposal with expiration
    struct BattleProposal has key, store {
        id: UID,
        challenger: address,
        challenger_nft_id: ID,
        target: address,
        expires_at: u64,
        fee_paid: bool,
    }
    
    // Events
    struct BattleProposalCreated has copy, drop {
        proposal_id: ID,
        from: address,
        to: address,
        from_nft_id: ID,
        expires_at: u64,
    }
    
    struct BattleCompleted has copy, drop {
        winner: address,
        loser: address,
        winner_nft_id: ID,
        loser_nft_id: ID,
        winner_new_type: u8,
        winner_kills: u64,
        winner_mutations: u64,
        winner_experience: u64,
        winner_level: u8,
    }
    
    struct NFTMinted has copy, drop {
        owner: address,
        nft_id: ID,
        nft_type: u8,
    }
    
    struct LevelUp has copy, drop {
        nft_id: ID,
        owner: address,
        old_level: u8,
        new_level: u8,
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
        
        // Create game treasury
        transfer::share_object(
            GameTreasury {
                id: object::new(ctx),
                balance: coin::zero<SUI>(ctx),
            }
        );
    }
    
    // === Admin Functions ===
    
    #[allow(lint(public_random))]
    public entry fun batch_mint(
        _admin_cap: &AdminCap,
        addresses: vector<address>,
        random_obj: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let i = 0;
        let len = vector::length(&addresses);
        let current_time = sui::clock::timestamp_ms(clock);
        
        while (i < len) {
            let addr = *vector::borrow(&addresses, i);
            
            // Use proper random generation
            let random_gen = &mut random::new_generator(random_obj, ctx);
            let random_number = random::generate_u8_in_range(random_gen, 0, 3);
            let nft_type = random_number;
            
            let nft = BattleNFT {
                id: object::new(ctx),
                owner: addr,
                nft_type: nft_type,
                kills: 0,
                mutations: 0,
                level: 1,
                experience: 0,
                created_at: current_time,
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
    
    // Admin can withdraw fees from treasury
    public entry fun withdraw_fees(
        _admin_cap: &AdminCap,
        treasury: &mut GameTreasury,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let withdrawn = coin::split(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(withdrawn, tx_context::sender(ctx));
    }
    
    // === Player Functions ===
    
    // Propose a battle with fee payment
    public entry fun propose_battle(
        nft: &BattleNFT,
        opponent: address,
        fee: Coin<SUI>,
        treasury: &mut GameTreasury,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate that the player owns the NFT
        assert!(nft.owner == sender, ERequesterNotFound);
        
        // Validate that the player is not challenging themselves
        assert!(sender != opponent, ECannotBattleYourself);
        
        // Validate fee amount
        assert!(coin::value(&fee) >= BATTLE_FEE, EInsufficientFee);
        
        // Add fee to treasury
        coin::join(&mut treasury.balance, fee);
        
        // Create battle proposal with expiration (24 hours)
        let expires_at = sui::clock::timestamp_ms(clock) + 86400000; // 24 hours in ms
        
        let proposal = BattleProposal {
            id: object::new(ctx),
            challenger: sender,
            challenger_nft_id: object::id(nft),
            target: opponent,
            expires_at: expires_at,
            fee_paid: true,
        };
        
        let proposal_id = object::id(&proposal);
        
        // Emit event
        event::emit(BattleProposalCreated {
            proposal_id: proposal_id,
            from: sender,
            to: opponent,
            from_nft_id: object::id(nft),
            expires_at: expires_at,
        });
        
        // Make proposal discoverable
        transfer::share_object(proposal);
    }
    
    // Accept a battle from another player
    #[allow(lint(public_random))]
    public entry fun accept_battle(
        proposal: BattleProposal,
        responder_nft: &mut BattleNFT,
        challenger_nft: &mut BattleNFT,
        random_obj: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let responder = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate proposal hasn't expired
        assert!(current_time <= proposal.expires_at, EBattleProposalExpired);
        
        // Validate responder
        assert!(responder_nft.owner == responder, EBattlerNotFound);
        assert!(proposal.target == responder, EBattlerNotFound);
        
        // Validate challenger NFT matches proposal
        assert!(object::id(challenger_nft) == proposal.challenger_nft_id, ERequesterNotFound);
        assert!(challenger_nft.owner == proposal.challenger, ERequesterNotFound);
        
        // Validate different players
        assert!(responder != proposal.challenger, ECannotBattleYourself);
        
        // Validate NFT types
        assert!(responder_nft.nft_type <= TYPE_LLAMA, EInvalidNFTType);
        assert!(challenger_nft.nft_type <= TYPE_LLAMA, EInvalidNFTType);
        
        // Determine battle outcome
        let responder_wins = determine_winner(
            responder_nft.nft_type,
            challenger_nft.nft_type,
            random_obj,
            ctx
        );
        
        if (responder_wins) {
            // Responder wins
            process_victory(responder_nft, challenger_nft.nft_type);
            let winner_nft_id = object::id(responder_nft);
            let loser_nft_id = object::id(challenger_nft);
            
            // Emit battle result
            event::emit(BattleCompleted {
                winner: responder,
                loser: proposal.challenger,
                winner_nft_id: winner_nft_id,
                loser_nft_id: loser_nft_id,
                winner_new_type: responder_nft.nft_type,
                winner_kills: responder_nft.kills,
                winner_mutations: responder_nft.mutations,
                winner_experience: responder_nft.experience,
                winner_level: responder_nft.level,
            });
            
            // Destroy loser's NFT
            destroy_nft(challenger_nft);
        } else {
            // Challenger wins
            process_victory(challenger_nft, responder_nft.nft_type);
            let winner_nft_id = object::id(challenger_nft);
            let loser_nft_id = object::id(responder_nft);
            
            // Emit battle result
            event::emit(BattleCompleted {
                winner: proposal.challenger,
                loser: responder,
                winner_nft_id: winner_nft_id,
                loser_nft_id: loser_nft_id,
                winner_new_type: challenger_nft.nft_type,
                winner_kills: challenger_nft.kills,
                winner_mutations: challenger_nft.mutations,
                winner_experience: challenger_nft.experience,
                winner_level: challenger_nft.level,
            });
            
            // Destroy loser's NFT
            destroy_nft(responder_nft);
        }
        
        // Clean up proposal
        let BattleProposal { id, challenger: _, challenger_nft_id: _, target: _, expires_at: _, fee_paid: _ } = proposal;
        object::delete(id);
    }
    
    // === Helper Functions ===
    
    // Process victory rewards
    fun process_victory(winner_nft: &mut BattleNFT, loser_type: u8) {
        // Gain kills
        winner_nft.kills = winner_nft.kills + 1;
        
        // Mutate type based on opponent
        let new_type = determine_mutation(winner_nft.nft_type, loser_type);
        if (new_type != winner_nft.nft_type) {
            winner_nft.nft_type = new_type;
            winner_nft.mutations = winner_nft.mutations + 1;
        }
        
        // Gain experience
        winner_nft.experience = winner_nft.experience + 100;
        
        // Check for level up
        let new_level = calculate_level(winner_nft.experience);
        if (new_level > winner_nft.level) {
            let old_level = winner_nft.level;
            winner_nft.level = new_level;
            
            event::emit(LevelUp {
                nft_id: object::id(winner_nft),
                owner: winner_nft.owner,
                old_level: old_level,
                new_level: new_level,
            });
        }
    }
    
    // Calculate level based on experience
    fun calculate_level(experience: u64): u8 {
        // Simple level calculation: level = 1 + (experience / 1000)
        // Max level 255 due to u8 constraint
        let level = 1 + (experience / 1000);
        if (level > 255) {
            255
        } else {
            (level as u8)
        }
    }
    
    // Destroy an NFT safely
    fun destroy_nft(nft: &mut BattleNFT) {
        // Set owner to null address to indicate destruction
        nft.owner = @0x0;
        // In a real implementation, you might want to actually delete the object
        // but for tracking purposes, we'll just mark it as destroyed
    }
    
    // Determine the winner based on NFT types and probability
    fun determine_winner(
        responder_type: u8,
        challenger_type: u8,
        random_obj: &Random,
        ctx: &mut TxContext
    ): bool {
        // Calculate win probability for responder
        let responder_win_probability = if (responder_type == challenger_type) {
            // Equal types: 50% chance
            EQUAL_PROBABILITY
        } else if (
            (responder_type == TYPE_CAT && challenger_type == TYPE_DOG) ||
            (responder_type == TYPE_DOG && challenger_type == TYPE_LLAMA) ||
            (responder_type == TYPE_LLAMA && challenger_type == TYPE_CAT)
        ) {
            // Advantageous matchup: 75% chance
            ADVANTAGE_PROBABILITY
        } else {
            // Disadvantageous matchup: 25% chance
            MAX_PROBABILITY - ADVANTAGE_PROBABILITY
        };
        
        // Generate random number between 0 and 99
        let random_gen = &mut random::new_generator(random_obj, ctx);
        let random_value = random::generate_u64_in_range(random_gen, 0, MAX_PROBABILITY);
        
        // Return true if responder wins
        random_value < responder_win_probability
    }
    
    // Determine the new NFT type after mutation
    fun determine_mutation(winner_type: u8, loser_type: u8): u8 {
        if (winner_type == loser_type) {
            // Same type: no mutation
            winner_type
        } else {
            // Different types: 20% chance to mutate to the "fusion" type
            // For simplicity, we'll use a deterministic approach here
            // In a real game, you might want to add randomness
            
            // Cat + Dog = Llama, Dog + Llama = Cat, Llama + Cat = Dog
            if ((winner_type == TYPE_CAT && loser_type == TYPE_DOG) ||
                (winner_type == TYPE_DOG && loser_type == TYPE_CAT)) {
                TYPE_LLAMA
            } else if ((winner_type == TYPE_DOG && loser_type == TYPE_LLAMA) ||
                       (winner_type == TYPE_LLAMA && loser_type == TYPE_DOG)) {
                TYPE_CAT
            } else if ((winner_type == TYPE_LLAMA && loser_type == TYPE_CAT) ||
                       (winner_type == TYPE_CAT && loser_type == TYPE_LLAMA)) {
                TYPE_DOG
            } else {
                // Fallback: no mutation
                winner_type
            }
        }
    }
    
    // === View Functions ===
    
    // Get NFT details
    public fun get_nft_details(nft: &BattleNFT): (address, u8, u64, u64, u8, u64, u64) {
        (nft.owner, nft.nft_type, nft.kills, nft.mutations, nft.level, nft.experience, nft.created_at)
    }
    
    // Get NFT type name
    public fun get_nft_type_name(nft_type: u8): vector<u8> {
        if (nft_type == TYPE_CAT) {
            b"Cat"
        } else if (nft_type == TYPE_DOG) {
            b"Dog"
        } else if (nft_type == TYPE_LLAMA) {
            b"Llama"
        } else {
            b"Unknown"
        }
    }
    
    // Get battle fee
    public fun get_battle_fee(): u64 {
        BATTLE_FEE
    }
    
    // Get proposal details
    public fun get_proposal_details(proposal: &BattleProposal): (address, address, ID, u64, bool) {
        (proposal.challenger, proposal.target, proposal.challenger_nft_id, proposal.expires_at, proposal.fee_paid)
    }
}