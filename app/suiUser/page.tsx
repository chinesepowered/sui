"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const SuiUserContainer = dynamic(
  () => import('./components/SuiUserContainer'),
  { ssr: false }
);

export default function SuiUserPage() {
  return <SuiUserContainer />;
}