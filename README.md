# Sui Battle AR

## IRL NFT Battle Game on Sui Blockchain

![Sui Battle AR](https://img.shields.io/badge/Sui-Hackathon-blue)

## About The Project

Sui Battle AR is an innovative on-chain PvP NFT battle game built on the Sui blockchain, designed specifically for in-person events like conferences and conventions. It creates engaging social interactions between attendees through NFT battles with real consequences - win and evolve, or lose and get burned!

## Deployed Contract

The Sui Battle AR smart contract has been successfully deployed to the Sui Testnet:

- **Package ID**: `0x757b3cc8c5d97c431e0299408414ccf09046583c59e26e9cf3b2e7a0b77376ce`
- **Published Modules**: `game`

## Core Game Mechanics

### NFT Distribution
- Event organizers mint and distribute NFTs to pre-approved wallet addresses
- Each attendee receives one NFT with a randomly assigned type (A, B, or C)

### Battle System
Battles follow a two-step process that ensures physical presence and consent:
1. **Player A** proposes a battle with Player B
2. **Player B** accepts the battle with Player A

This prevents battle-farming abuse and ensures authentic IRL interactions.

### Type Advantage System
Battles use a rock-paper-scissors style mechanic:
- Type A beats Type B (75% probability)
- Type B beats Type C (75% probability)
- Type C beats Type A (75% probability)
- Same types result in 50/50 odds

### Battle Outcomes
- **Winner**: NFT mutates to a new type based on deterministic rules (A+B → C, etc.)
- **Winner**: Kill count increases by 1
- **Loser**: NFT is permanently burned

## Features

### Mobile Experience
- Display your wallet QR code to potential opponents
- Scan opponent QR codes to initiate battles
- Battle without knowing your opponent's NFT type
- Witness battle outcomes and NFT mutations in real-time

### Battle Arena
- View all active players and their NFTs
- Track battle history and leaderboard rankings
- Monitor NFT mutations and evolution history

## Technical Implementation

The project consists of:

1. **Smart Contract** - Move package on Sui that handles:
   - NFT minting and distribution
   - Battle resolution with deterministic but probabilistic outcomes
   - NFT mutation and burning mechanics

2. **Frontend** - Next.js application that provides:
   - Wallet connection via @mysten/dapp-kit
   - QR code generation and scanning for IRL interactions
   - Battle animations and visualizations
   - Leaderboard tracking

## Future Improvements

- AR visualization of NFT battles in physical space
- Custom NFT visuals based on battle history and mutations
- Event-specific themes and special NFT types
- Tournament mode with bracketed competition

## Acknowledgments

Built for Sui Overflow 2025
