"use client";

import React from 'react';

interface AdminStats {
  totalNFTs: number;
  totalBattles: number;
  activePlayers: number;
  recentMints: number;
}

interface AdminStatsProps {
  stats: AdminStats;
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: 'Total NFTs',
      value: stats.totalNFTs,
      icon: '🎯',
      color: 'from-blue-500 to-blue-600',
      description: 'Total NFTs in circulation'
    },
    {
      title: 'Total Battles',
      value: stats.totalBattles,
      icon: '⚔️',
      color: 'from-red-500 to-red-600',
      description: 'Completed battles'
    },
    {
      title: 'Active Players',
      value: stats.activePlayers,
      icon: '👥',
      color: 'from-green-500 to-green-600',
      description: 'Players with NFTs'
    },
    {
      title: 'Recent Mints',
      value: stats.recentMints,
      icon: '✨',
      color: 'from-purple-500 to-purple-600',
      description: 'Minted in last 24h'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-black/20 rounded-xl border border-orange-500/30 overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                  <p className="text-white text-3xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-400 text-sm">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NFT Distribution */}
        <div className="bg-black/20 rounded-xl border border-orange-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">NFT Type Distribution</h3>
          
          <div className="space-y-3">
            {[
              { type: 'Cat', count: Math.floor(stats.totalNFTs * 0.35), color: 'bg-blue-500' },
              { type: 'Dog', count: Math.floor(stats.totalNFTs * 0.33), color: 'bg-green-500' },
              { type: 'Llama', count: Math.floor(stats.totalNFTs * 0.32), color: 'bg-purple-500' }
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${item.color}`}></div>
                  <span className="text-white font-medium">{item.type}</span>
                </div>
                <div className="text-gray-300">
                  {item.count} ({((item.count / stats.totalNFTs) * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Battle Statistics */}
        <div className="bg-black/20 rounded-xl border border-orange-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Battle Analytics</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Win Rate by Type:</span>
            </div>
            
            <div className="space-y-2">
              {[
                { type: 'Cat', winRate: 45.2, battles: Math.floor(stats.totalBattles * 0.32) },
                { type: 'Dog', winRate: 48.7, battles: Math.floor(stats.totalBattles * 0.35) },
                { type: 'Llama', winRate: 52.1, battles: Math.floor(stats.totalBattles * 0.33) }
              ].map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{item.type}</span>
                    <span className="text-gray-300">{item.winRate}% ({item.battles} battles)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${item.winRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-black/20 rounded-xl border border-orange-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {[
            { time: '2 minutes ago', action: 'Batch minted 5 NFTs', type: 'mint' },
            { time: '15 minutes ago', action: 'Battle completed: Dog defeated Cat', type: 'battle' },
            { time: '23 minutes ago', action: 'New player joined with Llama NFT', type: 'join' },
            { time: '1 hour ago', action: 'Batch minted 12 NFTs', type: 'mint' },
            { time: '2 hours ago', action: 'Battle completed: Llama defeated Dog', type: 'battle' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'mint' ? 'bg-green-400' :
                activity.type === 'battle' ? 'bg-red-400' : 'bg-blue-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}