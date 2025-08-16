import { Hex, toHex } from 'viem';
import { toAccount } from 'viem/accounts';
import { Signer } from '../types';
 
export async function getPrivyAccount(): Promise<Signer> {
    try {
        const data = typeof window !== 'undefined' ? localStorage.getItem('cbsw-demo-privy-signer') : null;
        if (!data) return { account: null };
        const { address } = JSON.parse(data);
        const provider: any = (typeof window !== 'undefined' ? (window as any).cbswPrivyProvider : null);
        if (!provider || !address) return { account: null };
        const account = toAccount({
            address: address as Hex,
            type: 'local',
            sign: async ({ hash }): Promise<Hex> => {
                const signature = await provider.request({
                    method: 'eth_sign',
                    params: [address, hash]
                });
                return signature as Hex;
            },
            signMessage: async ({ message }): Promise<Hex> => {
                const raw = typeof message === 'string' ? message : toHex(message.raw as Uint8Array);
                const signature = await provider.request({
                    method: 'personal_sign',
                    params: [raw, address]
                });
                return signature as Hex;
            },
            signTransaction: async (): Promise<Hex> => {
                throw new Error('Not implemented');
            },
            signTypedData: async (): Promise<Hex> => {
                throw new Error('Not implemented');
            }
        });
        return { account };
    } catch (e) {
        console.error('getPrivyAccount error', e);
        return { account: null };
    }
}