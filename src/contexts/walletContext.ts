import { createContext } from 'react';
import type { WalletStore } from '../walletStore';

export const WalletContext = createContext<WalletStore | null>(null); 