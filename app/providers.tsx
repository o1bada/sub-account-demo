'use client';
 
import type { ReactNode } from 'react';
import { CoinbaseProvider } from './CoinbaseProvider';
import { PrivyProvider } from '@privy-io/react-auth';
import PrivyBridge from './privy/PrivyBridge';
 
export function Providers(props: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    return (
      <CoinbaseProvider>
        {props.children}
      </CoinbaseProvider>
    );
  }
  return (
    <PrivyProvider appId={appId}>
      <PrivyBridge />
      <CoinbaseProvider>
        {props.children}
      </CoinbaseProvider>
    </PrivyProvider>
  );
}