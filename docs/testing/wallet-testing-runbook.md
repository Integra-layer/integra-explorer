# Wallet Testing Runbook

This guide walks through testing wallet functionality on Integra Explorer.

**Explorer URL:** https://testnet.explorer.integralayer.com

---

## Prerequisites

- MetaMask wallet installed (or Keplr for Cosmos-side testing)
- Integra testnet configured in your wallet
- Test IRL tokens (request from faucet)
- Understanding of wallet connections and signing

---

## Quick Setup

### MetaMask Configuration

Add Integra testnet if not already configured:

1. Open MetaMask
2. Click Networks dropdown → Add Network
3. Fill in:
   - **Network Name:** Integra Testnet
   - **RPC URL:** https://testnet.integralayer.com/evm
   - **Chain ID:** 26218
   - **Currency Symbol:** IRL
   - **Block Explorer URL:** https://testnet.explorer.integralayer.com
4. Click Save

---

## Test Case 1: Connect Wallet (EVM Side)

### 1.1 Initial Connection

1. Navigate to https://testnet.explorer.integralayer.com
2. Click "Connect Wallet" button (top right)
3. Select "MetaMask" from wallet options
4. **Expected result:** MetaMask popup appears
5. Click "Next" to confirm permission
6. Click "Connect" to authorize connection
7. **Expected result:** Popup closes, wallet address appears in header (e.g., `0x123...`)

### 1.2 Verify Address Display

1. After connection, verify header shows:
   - [ ] Wallet address (truncated, e.g., `0x123...abc`)
   - [ ] Network name: "Integra Testnet"
   - [ ] Wallet icon/indicator
2. Click on address to see options:
   - [ ] Full address displayed
   - [ ] Copy address button available
   - [ ] Disconnect option available

### 1.3 Connection Persistence

1. Refresh page
2. **Expected result:** Wallet remains connected (no need to reconnect)
3. Close and reopen browser tab
4. **Expected result:** Wallet is still connected (persisted in localStorage)

---

## Test Case 2: Balance Display

### 2.1 Check Balance After Connection

1. Connect wallet (see Test Case 1)
2. Look for balance display on page:
   - [ ] Balance visible somewhere on UI (header, sidebar, or profile section)
   - [ ] Amount shown in IRL
   - [ ] Balance matches MetaMask balance

### 2.2 Balance Updates After Transactions

1. Note current balance
2. Send a transaction (see Test Case 3)
3. Wait for transaction confirmation (30 seconds)
4. Refresh page
5. **Expected result:** Balance is updated (decreased by transaction amount + gas)

### 2.3 Faucet Integration (if available)

1. Click "Faucet" link on explorer
2. If faucet is integrated in explorer:
   - [ ] Faucet button appears when wallet is connected
   - [ ] Shows IRL amount to be granted
   - [ ] Clicking faucet creates transaction in MetaMask
   - [ ] Balance increases after confirmation

---

## Test Case 3: Send Transaction

### 3.1 Test Transaction Creation

1. Connect wallet
2. Ensure balance > 0.1 IRL (for gas)
3. Look for transaction creation interface:
   - Might be on address detail page
   - Might be in a dedicated "Send" section
4. Fill in transaction details:
   - **To Address:** Use a second wallet address (or your own)
   - **Amount:** 0.01 IRL
5. Click "Send" or equivalent
6. **Expected result:** MetaMask popup appears with transaction details

### 3.2 Verify Transaction Details in MetaMask

In the MetaMask popup, verify:
- [ ] Recipient address is correct
- [ ] Amount is correct (0.01 IRL)
- [ ] Gas fee is displayed
- [ ] Total cost is shown

### 3.3 Confirm and Execute

1. Click "Confirm" in MetaMask
2. **Expected result:** Transaction is submitted
3. MetaMask shows "Transaction submitted" confirmation
4. Copy transaction hash

### 3.4 Verify Transaction on Explorer

1. Navigate to explorer homepage or transaction page
2. Search for transaction hash (or wait for it to appear in latest transactions)
3. **Expected result:**
   - [ ] Transaction appears in explorer
   - [ ] Status shows "Pending" then "Confirmed"
   - [ ] From address matches connected wallet
   - [ ] To address matches recipient
   - [ ] Amount is correct
   - [ ] Gas used is displayed

---

## Test Case 4: Message Signing

### 4.1 Sign a Message

1. Connect wallet
2. Look for "Sign Message" option (might be in account menu or dedicated page)
3. If available, click to sign a test message
4. Enter test message: "Testing Integra Explorer"
5. Click "Sign"
6. **Expected result:** MetaMask popup appears asking to sign

### 4.2 Verify Signature Prompt

In MetaMask signature request:
- [ ] Shows the message to be signed
- [ ] Shows connected account
- [ ] Has "Sign" and "Cancel" buttons

### 4.3 Complete Signing

1. Click "Sign" in MetaMask
2. **Expected result:**
   - [ ] Popup closes
   - [ ] Signature is displayed on page (or confirmation message shown)
   - [ ] Signature starts with "0x" and is 132 characters long (65 bytes)

### 4.4 Signature Verification (if supported)

If explorer has signature verification:
1. Copy the generated signature
2. Use verification tool to verify signature against message and public key
3. **Expected result:** Signature is valid

---

## Test Case 5: Network Switching

### 5.1 Switch Networks in MetaMask

1. Connect wallet to Integra testnet
2. Open MetaMask
3. Click Networks dropdown
4. Select a different network (e.g., Ethereum Mainnet)
5. **Expected result:**
   - [ ] MetaMask confirms network switch
   - [ ] Explorer should detect network change
   - [ ] One of: (a) explorer disconnects, (b) explorer shows warning, (c) explorer automatically switches context

### 5.2 Switch Back to Integra Testnet

1. Open MetaMask
2. Click Networks → Integra Testnet
3. **Expected result:**
   - [ ] Explorer reconnects automatically, OR
   - [ ] Explorer shows prompt to reconnect to correct network
   - [ ] Wallet remains connected after switch

---

## Test Case 6: Disconnect Wallet

### 6.1 Disconnect from Explorer UI

1. Connect wallet
2. Click on connected wallet address/icon
3. Look for "Disconnect" option
4. Click "Disconnect"
5. **Expected result:**
   - [ ] Wallet is disconnected
   - [ ] Header no longer shows address
   - [ ] "Connect Wallet" button reappears
   - [ ] localStorage is cleared (no auto-reconnect on page refresh)

### 6.2 Disconnect from MetaMask

1. Connect wallet to explorer
2. Open MetaMask
3. Click account → Settings → Connected Sites
4. Find explorer URL
5. Click the X or "Disconnect" button
6. **Expected result:**
   - [ ] Explorer detects disconnection
   - [ ] Address no longer shown in header
   - [ ] "Connect Wallet" button reappears

### 6.3 Reconnect After Disconnect

1. After disconnecting, click "Connect Wallet" again
2. **Expected result:** Connection flow works as expected (Test Case 1)

---

## Test Case 7: Keplr Wallet (Cosmos Side)

### 7.1 Add Integra Chain to Keplr

1. Install Keplr browser extension
2. Open Keplr
3. Click "Approve" when explorer requests chain addition
4. **Expected result:** Integra Testnet is added to Keplr

### 7.2 Connect Keplr Wallet

1. Navigate to explorer
2. Click "Connect Wallet"
3. Select "Keplr" or "Cosmos" option
4. **Expected result:** Keplr popup appears requesting connection
5. Click "Approve"
6. **Expected result:** Explorer connects to Keplr wallet

### 7.3 Verify Cosmos Address

1. After Keplr connection, wallet address should display:
   - [ ] Address starts with "integra1" (Cosmos format)
   - [ ] Address is 42-44 characters long
   - [ ] Different from MetaMask address (different namespace)

### 7.4 Cosmos-side Transaction (if supported)

1. If explorer supports Cosmos transactions:
   - Look for Cosmos transaction creation
   - Create a small delegation or transfer
   - Verify transaction appears in explorer

---

## Test Case 8: Mobile Wallet (WalletConnect)

### 8.1 Connect via WalletConnect

1. Navigate to explorer on desktop
2. Click "Connect Wallet"
3. Select "WalletConnect" option (if available)
4. **Expected result:** WalletConnect QR code appears
5. On mobile wallet (e.g., MetaMask Mobile):
   - Open app
   - Click "Scan QR Code"
   - Point at desktop QR code
6. **Expected result:** Mobile wallet prompts connection approval
7. Click "Approve" on mobile
8. **Expected result:** Explorer connects using WalletConnect bridge

### 8.2 Transaction via Mobile Wallet

1. Create transaction on desktop explorer (via WalletConnect)
2. **Expected result:** Mobile wallet receives transaction request
3. Review and approve on mobile
4. **Expected result:** Transaction executes and appears in explorer

---

## Test Case 9: Multiple Wallets

### 9.1 Switch Between Wallets

1. In MetaMask, switch to a different account
2. **Expected result:**
   - [ ] Explorer detects account change
   - [ ] Address in header updates
   - [ ] Balance updates to reflect new account
   - [ ] No manual reconnection needed

### 9.2 Create Multiple Transactions with Different Wallets

1. Connect wallet A, send transaction (0.01 IRL)
2. Switch to wallet B in MetaMask
3. **Expected result:** Explorer shows wallet B's address
4. Send another transaction (0.01 IRL)
5. Verify both transactions appear in explorer with correct addresses

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "MetaMask is not installed" | Install MetaMask extension from metamask.io |
| "Wrong network" error | Ensure MetaMask is on Integra testnet (Chain ID 26218) |
| Wallet connects but balance is 0 | Request tokens from faucet: https://testnet.explorer.integralayer.com/faucet |
| Transaction fails with "insufficient gas" | Ensure balance covers transaction amount + gas fee (typically 21k-100k gas) |
| "Signature request rejected" | Accept the signature prompt in MetaMask |
| Address shows but balance doesn't update | Try refreshing page or clearing browser cache |
| WalletConnect QR won't scan | Check QR code is clearly visible, ensure mobile camera permission granted |

---

## Wallet Testing Checklist

- [ ] MetaMask connects successfully
- [ ] Wallet address displays in header
- [ ] Balance displays and is accurate
- [ ] Network name (Integra Testnet) is shown
- [ ] Wallet persists after page refresh
- [ ] Transaction can be sent and appears in explorer
- [ ] Transaction details are correct
- [ ] Message signing works (if supported)
- [ ] Network switching doesn't break connection
- [ ] Wallet can be disconnected
- [ ] Keplr connects for Cosmos operations
- [ ] WalletConnect works (if supported)
- [ ] Multiple wallet accounts can be switched
- [ ] All error scenarios show helpful messages

---

## Expected Response Times

- Wallet connection: < 3 seconds
- Balance fetch: < 2 seconds
- Transaction confirmation: 10-30 seconds (block time dependent)
- Message signing: < 5 seconds (user confirmation)

---

## Notes

- Test with small amounts first (0.01 IRL is sufficient)
- Gas prices vary based on network load; check explorer for current rates
- Testnet tokens reset periodically; be prepared to refaucet
- Different wallet providers may have slight UI differences; test with at least 2 wallets
- Mobile testing requires physical device or emulator with camera for WalletConnect
