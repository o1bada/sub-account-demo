/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		optimizePackageImports: ['@coinbase/onchainkit'],
	},
	env: {
		NEXT_PUBLIC_PAYMASTER_SERVICE_URL: process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL,
		NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
	},
};

export default nextConfig;
