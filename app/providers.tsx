'use client';
 
import type { ReactNode } from 'react';
import { CoinbaseProvider } from './CoinbaseProvider';
import { PrivyProvider } from '@privy-io/react-auth';
import PrivyBridge from './privy/PrivyBridge';
 
export function Providers(props: { children: ReactNode }) {
  return (
      <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}>
        <PrivyBridge />
        <CoinbaseProvider>
            {props.children}
        </CoinbaseProvider>
      </PrivyProvider>
  );
}