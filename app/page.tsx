"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to prevent hydration errors with wallet components
const GameContainer = dynamic(
  () => import('./components/GameContainer'),
  { ssr: false }
);

export default function Home() {
  return <GameContainer />;
}
