import { PrivyClientConfig } from "@privy-io/react-auth";

/**
 * PRIVY CONFIGURATION FOR WEB3 GOVERNMENT SYSTEM
 * 
 * Key Strategy:
 * - Auto-create embedded Solana wallets for every citizen
 * - Citizens never see crypto complexity
 * - Government master wallet pays all fees
 * - Citizens own NFTs and attestations cryptographically
 */

export const privyConfig: PrivyClientConfig = {
  // Citizens login with email + OTP (custom auth, not Privy)
  // Privy only handles embedded wallet creation
  loginMethods: ["email"],
  
  appearance: {
    theme: "dark",
    accentColor: "#00d9ff", // Cyan - government digital identity color
    logo: "https://your-domain.com/logo.png",
  },
  
  // CRITICAL: Auto-create embedded wallets for ALL users
  // Citizens never see or interact with this - completely transparent
  embeddedWallets: {
    createOnLogin: "all-users", // Create on first authentication
  },
  
  // CRITICAL: Hide all external wallets
  // Citizens can't "connect" wallets or see Solana/Phantom
  // This prevents confusion and security risks
  externalWallets: {
    walletConnect: {
      enabled: false,
    },
    solana: {
      enabled: false,
    },
    evm: {
      enabled: false,
    },
  },
  
  // Customize UI to hide all crypto terminology
  customization: {
    walletConnectButtonText: undefined,
    signatureRequestButtonText: undefined,
  },
  
  // Solana network configuration
  solanaCluster: "devnet", // Use devnet for testing, mainnet for production
  
  // Required environment variables:
  // NEXT_PUBLIC_PRIVY_APP_ID - Your Privy app ID
  // PRIVY_APP_SECRET - Your Privy secret (backend only)
};

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!
