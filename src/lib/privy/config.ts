import { PrivyClientConfig } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["wallet", "email"],
  appearance: {
    theme: "light",
    accentColor: "#6A6CF4",
    logo: "https://your-domain.com/logo.png",
    walletChainType: "ethereum-and-solana",
    // Prioritize detected Solana wallets and show Solflare explicitly to avoid WC redirect
    walletList: ["detected_solana_wallets", "solflare", "phantom", "backpack"],
  },
  // embeddedWallets: {
  //   createOnLogin: "users-without-wallets",
  // },
  // Note: embeddedWallets/solana cluster config shapes vary by version; omit to satisfy current types
  // Configure external wallets; disable WalletConnect to prevent web redirects, prefer injected extensions
  externalWallets: {
    walletConnect: {
      enabled: false,
    },
    solana: {
      // Avoid auto-connecting loudly; rely on injected extension if present
      connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }),
    },
  },
};

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;
