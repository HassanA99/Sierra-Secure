"use client";

/**
 * Wallet Detection Utilities
 * Helps detect and verify Solana wallet extensions before connection
 */

export interface WalletProvider {
  isSolflare?: boolean;
  isPhantom?: boolean;
  isBackpack?: boolean;
  isGlow?: boolean;
  publicKey?: any;
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
}

export interface DetectedWallet {
  name: string;
  provider: WalletProvider;
  isInstalled: boolean;
}

/**
 * Check if Solflare wallet is installed
 */
export function isSolflareInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const solflare = (window as any).solflare;
  const isSolflare = solflare?.isSolflare === true;

  console.log("[Wallet Detection] Solflare check:", {
    exists: !!solflare,
    isSolflare,
    provider: solflare,
  });

  return isSolflare;
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const phantom = (window as any).phantom?.solana;
  return phantom?.isPhantom === true;
}

/**
 * Check if Backpack wallet is installed
 */
export function isBackpackInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const backpack = (window as any).backpack;
  return backpack?.isBackpack === true;
}

/**
 * Check if Glow wallet is installed
 */
export function isGlowInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const glow = (window as any).glow;
  return glow?.isGlow === true;
}

/**
 * Get all detected Solana wallets
 */
export function getDetectedWallets(): DetectedWallet[] {
  const wallets: DetectedWallet[] = [];

  if (isSolflareInstalled()) {
    wallets.push({
      name: "Solflare",
      provider: (window as any).solflare,
      isInstalled: true,
    });
  }

  if (isPhantomInstalled()) {
    wallets.push({
      name: "Phantom",
      provider: (window as any).phantom.solana,
      isInstalled: true,
    });
  }

  if (isBackpackInstalled()) {
    wallets.push({
      name: "Backpack",
      provider: (window as any).backpack,
      isInstalled: true,
    });
  }

  if (isGlowInstalled()) {
    wallets.push({
      name: "Glow",
      provider: (window as any).glow,
      isInstalled: true,
    });
  }

  console.log(
    "[Wallet Detection] Detected wallets:",
    wallets.map((w) => w.name)
  );

  return wallets;
}

/**
 * Wait for wallet to be injected into window
 * Useful for handling race conditions where wallet loads after app
 */
export function waitForWallet(
  walletName: "solflare" | "phantom" | "backpack" | "glow",
  timeout: number = 3000
): Promise<WalletProvider | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const checkWallet = () => {
      let wallet: WalletProvider | null = null;

      switch (walletName) {
        case "solflare":
          wallet = (window as any).solflare;
          if (wallet?.isSolflare) return wallet;
          break;
        case "phantom":
          wallet = (window as any).phantom?.solana;
          if (wallet?.isPhantom) return wallet;
          break;
        case "backpack":
          wallet = (window as any).backpack;
          if (wallet?.isBackpack) return wallet;
          break;
        case "glow":
          wallet = (window as any).glow;
          if (wallet?.isGlow) return wallet;
          break;
      }

      return null;
    };

    // Check immediately
    const wallet = checkWallet();
    if (wallet) {
      console.log(`[Wallet Detection] ${walletName} found immediately`);
      resolve(wallet);
      return;
    }

    // Poll for wallet
    const startTime = Date.now();
    const interval = setInterval(() => {
      const wallet = checkWallet();

      if (wallet) {
        console.log(
          `[Wallet Detection] ${walletName} found after ${
            Date.now() - startTime
          }ms`
        );
        clearInterval(interval);
        resolve(wallet);
      } else if (Date.now() - startTime >= timeout) {
        console.log(
          `[Wallet Detection] ${walletName} not found after ${timeout}ms timeout`
        );
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

/**
 * Log all wallet providers in the window object
 * Useful for debugging
 */
export function debugWalletProviders(): void {
  if (typeof window === "undefined") {
    console.log("[Wallet Detection] Window not available (SSR)");
    return;
  }

  console.log("[Wallet Detection] Debug Info:", {
    solflare: {
      exists: !!(window as any).solflare,
      isSolflare: (window as any).solflare?.isSolflare,
      provider: (window as any).solflare,
    },
    phantom: {
      exists: !!(window as any).phantom?.solana,
      isPhantom: (window as any).phantom?.solana?.isPhantom,
      provider: (window as any).phantom?.solana,
    },
    backpack: {
      exists: !!(window as any).backpack,
      isBackpack: (window as any).backpack?.isBackpack,
      provider: (window as any).backpack,
    },
    glow: {
      exists: !!(window as any).glow,
      isGlow: (window as any).glow?.isGlow,
      provider: (window as any).glow,
    },
    solana: (window as any).solana,
    allKeys: Object.keys(window).filter(
      (key) =>
        key.toLowerCase().includes("solana") ||
        key.toLowerCase().includes("phantom") ||
        key.toLowerCase().includes("solflare") ||
        key.toLowerCase().includes("backpack") ||
        key.toLowerCase().includes("glow")
    ),
  });
}
