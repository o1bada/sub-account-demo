'use client';

import { useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';

export default function PrivyBridge() {
    const { wallets } = useWallets();

    useEffect(() => {
        const embeddedOrExternal = wallets.find(w => w.walletClientType === 'embedded' || w.walletClientType === 'base_account' || w.walletClientType === 'coinbase_wallet');
        if (embeddedOrExternal) {
            (window as any).cbswPrivyProvider = embeddedOrExternal.getEIP1193Provider();
            embeddedOrExternal.getAddress().then((addr) => {
                localStorage.setItem('cbsw-demo-privy-signer', JSON.stringify({ address: addr }));
            });
        }
    }, [wallets]);

    return null;
}