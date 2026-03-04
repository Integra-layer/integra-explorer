# Integra Explorer - Manual Testing Runbooks

This directory contains comprehensive testing guides for Integra Explorer manual QA.

**Explorer URL:** https://testnet.explorer.integralayer.com

---

## Runbooks

### 1. Contract Verification Runbook
**File:** `testing-contract-verification-runbook.md` (239 lines)

Tests smart contract source code verification on the explorer.

**Covers:**
- Deploying contracts via Remix
- Verifying contracts with correct compiler settings
- Reading and writing contract functions
- Handling verification failures
- Metadata validation

**Key Commands:**
- Deploy Storage contract to testnet
- Fill verification form with compiler version and source
- Test read/write function execution
- Verify error scenarios

---

### 2. Wallet Testing Runbook
**File:** `testing-wallet-testing-runbook.md` (361 lines)

Tests wallet connection, transactions, and signing on the explorer.

**Covers:**
- Connecting MetaMask wallet
- Balance display and updates
- Sending transactions
- Message signing
- Network switching
- Keplr wallet (Cosmos-side)
- WalletConnect (mobile)
- Multiple wallet accounts

**Key Commands:**
- Connect wallet to explorer
- Send 0.01 IRL transaction
- Sign test message
- Switch networks and wallets
- Disconnect and reconnect

---

### 3. WebSocket Verification Runbook
**File:** `testing-websocket-verification.md` (511 lines)

Tests real-time WebSocket updates via Soketi (Pusher-compatible).

**Covers:**
- Soketi health checks
- Pusher auth endpoint verification
- Real-time block updates
- Pending transaction monitoring
- Private workspace channels
- Network condition testing
- Reconnection behavior
- Server logs and performance

**Key Commands:**
- Check Soketi container: `docker ps | grep soketi`
- Test auth endpoint: `curl -X POST https://testnet.explorer.integralayer.com/pusher-auth`
- Monitor Soketi logs: `docker logs -f integra-explorer-soketi`
- Simulate network conditions in DevTools

---

## Quick Start

### For QA Engineers

1. **Start with wallet testing** (`testing-wallet-testing-runbook.md`) - covers basic explorer functionality
2. **Then test contracts** (`testing-contract-verification-runbook.md`) - tests core smart contract features
3. **Finally verify real-time** (`testing-websocket-verification.md`) - ensures live updates work

### For Developers

Use these as reference for:
- Expected behavior after code changes
- Testing checklist before deployment
- Troubleshooting production issues
- Network and browser DevTools techniques

### For Deployments

Before deploying to testnet:
1. Run all three runbooks end-to-end
2. Verify all checklist items pass
3. Note any environment-specific deviations
4. Document any blockers

---

## Prerequisites (All Runbooks)

- MetaMask or compatible wallet installed
- Integra testnet configured (Chain ID 26218, RPC https://testnet.integralayer.com/evm)
- Test IRL tokens (request from faucet)
- Browser Developer Tools knowledge (especially Network and Console tabs)
- Basic Solidity knowledge (for contract verification)

---

## Test Environment

**Testnet Details:**
- **Name:** Integra Testnet
- **Chain ID:** 26218
- **RPC:** https://testnet.integralayer.com/evm
- **Explorer:** https://testnet.explorer.integralayer.com
- **Currency:** IRL (testnet tokens)
- **Block Time:** ~1-2 seconds
- **Faucet:** Available on explorer (10 IRL per request)

---

## Running Tests Locally

### Docker Setup

```bash
# Start full stack
docker-compose -f docker-compose.dev.yml up -d

# Check Soketi is running
docker ps | grep soketi

# View logs
docker logs integra-explorer-soketi
```

### Manual Test Execution

**Contract Verification:**
1. Open https://localhost:3000 (or your dev server)
2. Follow "Test Case 1" through "Test Case 6" in contract runbook
3. Mark each test case ✓ when passing

**Wallet Testing:**
1. Navigate to explorer
2. Execute each test case sequentially
3. Use the provided checklist

**WebSocket Verification:**
1. Open DevTools (F12)
2. Go to Network tab, filter by "WS"
3. Follow test cases 1-11
4. Watch console for Pusher messages

---

## Verification Checklist (Quick Summary)

### Contract Verification (6 test cases)
- [ ] Deploy and verify simple Storage contract
- [ ] Verify with Remix flatten for multi-file contracts
- [ ] Read and write functions work correctly
- [ ] Verify failure scenarios (wrong compiler, mismatched settings)
- [ ] Metadata displays correctly
- [ ] Multiple verification attempts behave consistently

### Wallet Testing (9 test cases)
- [ ] Connect MetaMask and see address
- [ ] Balance displays and updates after transactions
- [ ] Send transaction successfully
- [ ] Sign message (if supported)
- [ ] Switch networks without breaking connection
- [ ] Disconnect and reconnect
- [ ] Connect Keplr for Cosmos operations
- [ ] WalletConnect mobile connection
- [ ] Switch between multiple wallet accounts

### WebSocket Verification (11 test cases)
- [ ] Soketi container healthy
- [ ] Auth endpoint returns valid signatures
- [ ] New blocks appear in real-time
- [ ] Pending transactions shown before confirmation
- [ ] No WebSocket errors in console
- [ ] Connection persists for 10+ minutes
- [ ] Auto-reconnect after network failure
- [ ] Multiple tabs work simultaneously
- [ ] Soketi logs show normal operation
- [ ] Performance under throttled network
- [ ] Error handling is graceful

---

## Troubleshooting

### Contract Verification

- **"Contract creation failed"** → Check gas (need ~200k), verify balance
- **"Compiler version not found"** → Use standard versions (0.8.19, 0.8.20)
- **"Source code doesn't match"** → Ensure exact whitespace/comment match

### Wallet Testing

- **"Wrong network" error** → Ensure MetaMask on Chain ID 26218
- **Transaction fails with "insufficient gas"** → Balance needs tx + gas fee
- **"MetaMask is not installed"** → Install from metamask.io

### WebSocket Verification

- **WebSocket connection failed** → Check Soketi running, Redis available
- **Auth endpoint 401** → Verify `SOKETI_*` env variables set
- **No real-time updates** → Check browser console for Pusher errors, verify auth

---

## Response Time Expectations

| Operation | Expected Time |
|-----------|----------------|
| Wallet connection | < 3 seconds |
| Contract deployment | 10-30 seconds |
| Contract verification | < 5 seconds |
| Transaction confirmation | 10-30 seconds |
| Block event propagation | < 500ms |
| WebSocket connection | < 2 seconds |
| Message signing | < 5 seconds (user input) |

---

## Notes

- **Testnet resets:** May happen periodically; contract data doesn't persist
- **Faucet limits:** Usually 10 IRL per request, sometimes daily limits
- **Gas prices:** Vary by network load; check explorer for current rates
- **Caching:** Clear browser cache if old data persists after updates
- **Mobile testing:** Requires physical device or emulator for WalletConnect QR codes
- **Performance:** Test under "Slow 3G" in DevTools to catch latency issues

---

## File Locations

```
.claude/plans/
├── TESTING-RUNBOOKS-INDEX.md                          (this file)
├── testing-contract-verification-runbook.md           (239 lines)
├── testing-wallet-testing-runbook.md                  (361 lines)
└── testing-websocket-verification.md                  (511 lines)
```

**Total:** 1,111 lines of testing documentation

---

## Version History

- **v1.0** (2026-03-04): Initial runbooks created
  - Contract verification (6 test cases, 239 lines)
  - Wallet testing (9 test cases, 361 lines)
  - WebSocket verification (11 test cases, 511 lines)
