import { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  // Citizens login with phone + PIN only (no visible crypto)
  loginMethods: ["phone", "email"],
  appearance: {
    theme: "light",
    accentColor: "#003366", // Government blue
    logo: "https://your-domain.com/logo.png",
  },
  // Auto-create embedded wallet for every user - completely transparent
  embeddedWallets: {
    createOnLogin: "all-users",
  },
  // CRITICAL: Hide all external wallets from citizens
  // The Solana wallet is managed invisibly via embedded account
  externalWallets: {
    walletConnect: {
      enabled: false,
    },
    solana: {
      enabled: false,
    },
  },
  // Customize UI to remove crypto language
  customization: {
    walletConnectButtonText: undefined, // Remove wallet prompts
    signatureRequestButtonText: undefined,
  },
};

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;
