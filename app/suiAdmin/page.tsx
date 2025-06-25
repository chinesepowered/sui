"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const SuiAdminContainer = dynamic(
  () => import('./components/SuiAdminContainer'),
  { ssr: false }
);

export default function SuiAdminPage() {
  return <SuiAdminContainer />;
}