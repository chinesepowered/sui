// Contract and package information from deployment in wallet_build.txt
// Transaction Digest: yKR9uTGvNuRXfukQb9w9cBUWbAex33HWGj4K1Ev7S5T
export const PACKAGE_ID = "0x757b3cc8c5d97c431e0299408414ccf09046583c59e26e9cf3b2e7a0b77376ce";
export const ADMIN_CAP_ID = "0xe63d7628af1381d2592878e9e840fdbb7fb3dcf16c129fecfe16daf2cba9bca0";
export const ADMIN_ADDRESS = "0x5a508e23daf5aa33196da69d8c4161fb84851f4ec2cfcc8db1618369205ddcb2";
export const MODULE_NAME = "game";

// NFT Types
export const NFT_TYPE = {
  A: 0,
  B: 1,
  C: 2
};

// Network configuration
export const NETWORK = "testnet";
export const NETWORK_RPC_URL = "https://fullnode.testnet.sui.io";

// Demo users
export const DEMO_USERS = [
  {
    name: "Player 1",
    address: "0xc1cdc0da8efc173ee3742274ba0174a944f2170cb9955642a1f0c9c91c255b8f",
    nftId: "demo-nft-1",
    nftType: NFT_TYPE.A,
    kills: 3,
    mutations: 2
  },
  {
    name: "Player 2",
    address: "0x5a508e23daf5aa33196da69d8c4161fb84851f4ec2cfcc8db1618369205ddcb2",
    nftId: "demo-nft-2",
    nftType: NFT_TYPE.B,
    kills: 1,
    mutations: 1
  },
  {
    name: "Player 3",
    address: "0xdemo3",
    nftId: "demo-nft-3",
    nftType: NFT_TYPE.C,
    kills: 2,
    mutations: 2
  },
  {
    name: "Player 4",
    address: "0xdemo4",
    nftId: "demo-nft-4",
    nftType: NFT_TYPE.A,
    kills: 0,
    mutations: 0
  },
  {
    name: "Player 5",
    address: "0xdemo5",
    nftId: "demo-nft-5",
    nftType: NFT_TYPE.B,
    kills: 5,
    mutations: 3
  }
];

// Battle outcome probabilities
export const BATTLE_PROBABILITIES = {
  ADVANTAGE: 75,
  EQUAL: 50,
  MAX: 100
}; 