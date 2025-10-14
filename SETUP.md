# Setup Instructions

## Environment Variables

1. Copy the `env.template` file to `.env.local`:
```bash
cp env.template .env.local
```

2. Fill in the required environment variables:

### Privy Configuration
- `NEXT_PUBLIC_PRIVY_APP_ID`: Get this from [Privy Dashboard](https://dashboard.privy.io/)
- `PRIVY_APP_SECRET`: Your Privy app secret (keep this secure)

### Solana Configuration
- `NEXT_PUBLIC_SOLANA_RPC_URL`: 
  - Development: `https://api.devnet.solana.com`
  - Production: `https://api.mainnet-beta.solana.com`
  - Or use a custom RPC like Helius, QuickNode, etc.

### Database
- `DATABASE_URL`: Your PostgreSQL connection string

### JWT
- `JWT_SECRET`: A secure random string (minimum 32 characters)

## Wallet Connection Setup

### Solflare Wallet Extension

If you're experiencing issues with Solflare wallet detection:

1. **Ensure Solflare is Installed**
   - Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic)
   - Verify the extension is enabled in Chrome (chrome://extensions)

2. **Clear Browser Cache**
   ```
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear storage"
   - Reload the page
   ```

3. **Check Console Logs**
   - Open DevTools Console (F12 → Console)
   - Look for `[Wallet Detection]` and `[PrivyProvider]` logs
   - Verify that `window.solflare` exists and `isSolflare: true`

4. **Wallet Detection Flow**
   The app now includes enhanced wallet detection:
   - Automatically detects installed Solana wallets on page load
   - Shows "✓ Wallet detected" indicator when wallets are found
   - Logs detailed debug information in the console
   - Uses `detected_wallets` connector for better compatibility

### Debugging Wallet Issues

If Solflare still redirects to download page:

1. **Check Browser Console** for these logs:
   ```
   [PrivyProvider] Wallet detection results: { solflare: true, solflareIsSolflare: true, ... }
   [Wallet Detection] Detected wallets: ['Solflare']
   [LoginButton] Wallet detection complete: { detected: ['Solflare'], count: 1 }
   ```

2. **Verify Privy Configuration**:
   - Open `src/lib/privy/config.ts`
   - Confirm `externalWallets.solana.connectors` includes `'detected_wallets'`

3. **Test Direct Wallet Access**:
   Open browser console and run:
   ```javascript
   window.solflare
   window.solflare?.isSolflare
   ```
   Both should return valid values.

4. **Common Issues**:
   - **Extension disabled**: Enable in chrome://extensions
   - **Multiple wallets conflict**: Disable other Solana wallets temporarily
   - **Extension not loaded**: Refresh the page and wait a few seconds
   - **Privy version mismatch**: Ensure you have the latest `@privy-io/react-auth`

## Database Setup

1. **Create PostgreSQL Database**:
```bash
createdb nddv_db
```

2. **Run Prisma Migrations**:
```bash
npx prisma migrate dev --name init
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

## Running the Application

1. **Install Dependencies**:
```bash
npm install
```

2. **Start Development Server**:
```bash
npm run dev
```

3. **Open Browser**:
- Navigate to http://localhost:3000
- Open DevTools Console to see wallet detection logs
- Click "Connect Wallet" and select Solflare

## Troubleshooting

### Solflare Not Detected

**Symptoms**: Clicking Solflare redirects to download page

**Solutions**:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache completely
4. Disable and re-enable the Solflare extension
5. Try a different browser or incognito mode
6. Check if Solflare is up-to-date

### Wallet Detection Logs

The app provides detailed logging for debugging:
- `[PrivyProvider]` - Initial wallet detection on app load
- `[Wallet Detection]` - Detailed wallet provider checks
- `[LoginButton]` - Login flow and wallet status

### Additional Help

- Privy Docs: https://docs.privy.io/wallets/connectors/solana/web3-integrations
- Solflare Support: https://solflare.com/support
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

