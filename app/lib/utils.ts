import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to combine Tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to delay execution
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to generate random values
export function getRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Helper to generate a random NFT type (0-2)
export function generateRandomNftType(): number {
  return Math.floor(Math.random() * 3);
}

// Helper to format date/time
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
} 