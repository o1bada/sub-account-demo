'use client';
 
import type { ReactNode } from 'react';
import { CoinbaseProvider } from './CoinbaseProvider';
import { PrivyProvider } from '@privy-io/react-auth';
import PrivyBridge from './privy/PrivyBridge';
import { base } from 'viem/chains';
 
export function Providers(props: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cme01nr5q0113jy0b6wnbd10w';
  return (
    <PrivyProvider
      appId={appId}
      config={{
        embeddedWallets: { createOnLogin: 'all-users' },
        defaultChain: base,
        supportedChains: [base],
        loginMethods: ['farcaster', 'email', 'wallet'],
      }}
    >
      <PrivyBridge />
      <CoinbaseProvider>
        {props.children}
      </CoinbaseProvider>
    </PrivyProvider>
  );
}