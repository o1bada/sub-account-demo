'use client'
import { baseSepolia } from "viem/chains";
import { useCoinbaseProvider } from "./CoinbaseProvider";
import PostCard from "./components/PostCard";
import Hero from "./components/Hero";
import { Post } from "./types";
import { useEffect, useMemo, useState } from "react";
import WalletFooter from "./components/WalletFooter";
import { Hex } from "viem";
import toast, { Toaster } from 'react-hot-toast';
import SettingsPanel from "./components/SettingsPanel";
import { useMediaQuery } from 'react-responsive';
import disperseFaucet from "./utils/faucet";
import { usePrivy } from '@privy-io/react-auth';
 
export default function Home() {
  const { address, subaccount, fetchAddressBalance, publicClient, createLinkedAccount, addressBalanceWei, currentChain, switchChain, spendPermissionSignature, signSpendPermission, spendPermissionRequestedAllowance, signerType } = useCoinbaseProvider();
  const { login, authenticated } = usePrivy();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isTipping, setIsTipping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
 
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);
 
  const isAddressFunded = useMemo(() => {
    return addressBalanceWei > BigInt(0);
  }, [addressBalanceWei]);
  
  const renderContent = () => {
    if (Number(spendPermissionRequestedAllowance) === 0 || spendPermissionRequestedAllowance === '') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <Hero />
          <div>
            Please set a valid daily spend amount in the settings panel.
          </div>
        </div>
      );
    }
 
    if (!address) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <Hero />
          {signerType === 'privy' && !authenticated && (
            <button 
              onClick={() => login()}
              className="px-6 py-3 text-white rounded-lg hover:bg-indigo-700 transition-colors mb-3"
              style={{ backgroundColor: '#111827' }}
            >
              Login with Privy
            </button>
          )}
          <button 
            onClick={() => createLinkedAccount()}
            className="px-6 py-3 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            style={{ backgroundColor: '#0052FF' }}
          >
            Connect
          </button>
        </div>
      );
    } else if (!isAddressFunded) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <Toaster position="top-right" />
          <Hero />
          <div className="text-lg text-gray-700 mb-4 text-center px-6">
            It doesn&apos;t seem like you have any Base Sepolia ETH 🤔... <br/> Let&apos;s get you funded!
          </div>
          <button 
            onClick={async () => {
              setIsFaucetLoading(true);
              try {
                const { hash } = await disperseFaucet({ to: address });
                await publicClient.waitForTransactionReceipt({ hash });
                await fetchAddressBalance();
              } catch (error) {
                console.error('error dispersing faucet', error);
                toast.error(
                  <div className="max-w-[280px] break-words">
                    <p>Error requesting funds. Please try again later. If issues continue to persist, please use the </p>
                    <a 
                      href="https://portal.cdp.coinbase.com/products/faucet" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Coinbase CDP Faucet
                    </a>
                    <p className="mt-2">Your wallet address:</p>
                    <code className="bg-gray-100 px-2 py-1 rounded block overflow-x-auto">{address}</code>
                  </div>
                , {
                  duration: 20000,
                });
              } finally {
                setIsFaucetLoading(false);
              }
            }}
            disabled={isFaucetLoading}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-lg transition-colors ${
              isFaucetLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {isFaucetLoading ? 'Requesting...' : 'Request funds'}
          </button>
          <div className="mt-4">
            <button className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors
            ${isFaucetLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`} 
              onClick={async () => {
                await fetchAddressBalance();
              }}
              disabled={isFaucetLoading}
              >
              Refresh my balance
            </button>
          </div>
        </div>
      );
    }
 
    if (currentChain?.id !== baseSepolia.id) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <Hero />
          <button 
            onClick={() => switchChain()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Switch to Base Sepolia
          </button>
        </div>
      );
    }
 
    if (!spendPermissionSignature) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <Hero />
          <div className="text-lg text-gray-700 mb-4 text-center px-6">
          {`Granting permission for Coinbase Smart wallet demo to spend ${spendPermissionRequestedAllowance} ETH per day...`}
          </div>
          <button 
            onClick={() => signSpendPermission({
              allowance: '0x71afd498d0000',// 0.002 ETH per day (~$5)
              period: 86400, // seconds in a day
              start: Math.floor(Date.now() / 1000), // unix timestamp
              end: Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60), // one month from now
              salt: '0x1',
              extraData: "0x" as Hex,
            })}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Grant permission
          </button>
        </div>
      );
    }
 
    return (
      <div>
        <Toaster position="top-right" />
        <Hero />
        <div className="max-w-2xl mx-auto py-8 px-4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              isTipping={isTipping}
              setIsTipping={setIsTipping}
            />
          ))}
        </div>
        <WalletFooter />
      </div>
    );
  };
 
  return (
    <div className="flex flex-col">
      {!bannerDismissed && (
        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
          <div className="flex-1 text-center">
            Interested in building with Sub Accounts? 
            <a 
              href="https://docs.base.org/identity/smart-wallet/guides/sub-accounts/overview" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline ml-1 font-medium"
            >
              Check out our docs here
            </a>
          </div>
          <button 
            onClick={() => setBannerDismissed(true)}
            className="text-white flex-shrink-0 hover:bg-blue-700 rounded-full p-1"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex flex-1">
        {(!isMobile || isSettingsOpen) && (
          <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : 'sticky top-0 h-screen'}`}>
            <SettingsPanel 
              isLoggedIn={!!(address || subaccount)}
              isMobile={isMobile}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>
        )}
        
        <div className="flex-1">
          {isMobile && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="fixed top-4 right-4 z-40 p-2 bg-white rounded-full shadow-lg"
            >
              ⚙️
            </button>
          )}
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-600">
          <a 
            href="https://github.com/base/sub-account-demo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            View code on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
