'use client';

import { useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';

export default function PrivyBridge() {
    const { wallets } = useWallets();

    useEffect(() => {
        const baseAccount = wallets.find((w: unknown) => (w as any).walletClientType === 'base_account');
        const embedded = wallets.find((w: unknown) => (w as any).walletClientType === 'embedded');
        const selected = (baseAccount as any) || (embedded as any) || (wallets[0] as any);
        if (selected) {
            (async () => {
                try {
                    if (selected.switchChain) {
                        await selected.switchChain(8453); // Base mainnet
                    }
                } catch {}
                (window as unknown as Record<string, unknown>).cbswPrivyProvider = selected.getEIP1193Provider();
                const addr = await selected.getAddress();
                localStorage.setItem('cbsw-demo-privy-signer', JSON.stringify({ address: addr }));
            })();
        }
    }, [wallets]);

    return null;
}