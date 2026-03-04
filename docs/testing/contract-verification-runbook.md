# Contract Verification Runbook

This guide walks through testing smart contract source code verification on Integra Explorer.

**Explorer URL:** https://testnet.explorer.integralayer.com

---

## Prerequisites

- MetaMask or compatible wallet with Integra testnet configured
- Solidity compiler knowledge (or use the example Storage contract below)
- Testnet IRL tokens for gas (request from faucet: https://testnet.explorer.integralayer.com/faucet)

---

## Quick Testnet Setup (MetaMask)

If Integra testnet is not already in your wallet:

1. Open MetaMask
2. Click Networks dropdown → Add Network
3. Fill in:
   - **Network Name:** Integra Testnet
   - **RPC URL:** https://testnet.integralayer.com/evm
   - **Chain ID:** 26218
   - **Currency Symbol:** IRL
4. Click Save

---

## Test Case 1: Deploy via Remix

### 1.1 Deploy a Simple Storage Contract

1. Go to https://remix.ethereum.org
2. Create new file: `Storage.sol`
3. Paste the example contract below
4. Click Compile (left sidebar, version 0.8.20)
5. Deploy to Integra testnet:
   - **Environment:** Injected Provider (MetaMask)
   - **Contract:** Storage
   - Click Deploy
6. Confirm transaction in MetaMask
7. Copy the deployed contract address (e.g., `0xabc123...`)

### Example Storage Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Storage
 * @dev A simple contract to store and retrieve a number
 */
contract Storage {
    uint256 private number;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function setNumber(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value
     * @return the stored number
     */
    function getNumber() public view returns (uint256) {
        return number;
    }

    /**
     * @dev Increment the stored number
     */
    function increment() public {
        number += 1;
    }
}
```

### 1.2 Verify Contract on Explorer

1. Navigate to: https://testnet.explorer.integralayer.com/address/`0xYOUR_CONTRACT_ADDRESS`
2. Scroll to "Contract" tab
3. Click "Verify & Publish" button
4. Select verification method: **Solidity (Single File)**
5. Fill in the form:
   - **Compiler Version:** 0.8.20
   - **License:** MIT
   - **Optimization:** Enabled (runs: 200, or leave default)
6. Copy full source code from Remix and paste it
7. Click "Verify and Publish"
8. **Expected result:** "Successfully verified contract source code" message

---

## Test Case 2: Verify Contract with Remix Flatten

For more complex contracts with imports, use Remix's flatten feature:

1. In Remix, right-click the contract file
2. Select "Flatten"
3. Copy the flattened output
4. On explorer, paste into verification form
5. Ensure compiler version and optimization match deployment settings
6. Click "Verify and Publish"

---

## Test Case 3: Read/Write Functions

After verification succeeds, test contract interaction:

### 3.1 Read Function

1. Scroll to "Read Contract" section
2. Click "getNumber" function
3. **Expected result:** Returns `0` (initial value)

### 3.2 Write Function

1. Scroll to "Write Contract" section
2. Connect wallet if not already connected
3. Click "setNumber" function
4. Enter value: `42`
5. Click "Write" and confirm in MetaMask
6. Wait for transaction to confirm
7. Refresh page
8. Call "getNumber" again
9. **Expected result:** Now returns `42`

### 3.3 Increment Function

1. Click "increment" in Write Contract
2. Click "Write" and confirm transaction
3. Wait for confirmation
4. Call "getNumber" again
5. **Expected result:** Returns `43`

---

## Test Case 4: Verification Failure Scenarios

### 4.1 Wrong Compiler Version

1. Deploy Storage contract with compiler 0.8.20
2. On explorer, select compiler 0.8.19 during verification
3. **Expected result:** Verification fails with error message
4. Try again with correct version (0.8.20)
5. **Expected result:** Verification succeeds

### 4.2 Mismatched Optimization Settings

1. Deploy with optimization enabled
2. Verify without optimization enabled
3. **Expected result:** Verification fails
4. Correct optimization setting and retry

### 4.3 Incomplete Source Code

1. Submit only part of the contract source
2. **Expected result:** Verification fails with compilation error
3. Submit full source and retry

---

## Test Case 5: Contract Metadata Display

After successful verification, verify all metadata displays correctly:

- [ ] Contract name is correct
- [ ] "Verified" badge appears next to contract name
- [ ] Source code is readable in "Code" tab
- [ ] ABI is displayed in "Contract" tab
- [ ] Constructor parameters are decoded correctly (if any)
- [ ] Read/Write functions are categorized correctly
- [ ] Function signatures match the source code

---

## Test Case 6: Multiple Verification Attempts

1. Deploy a new contract
2. Verify with optimization enabled (Remix default)
3. On explorer, verify successfully
4. Try to verify again with same parameters
5. **Expected result:** Either shows "already verified" or re-verifies successfully
6. Try to verify with different parameters (e.g., different optimization)
7. **Expected result:** Either rejects or updates the verification

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Contract creation failed" | Ensure gas limit is sufficient (~200k for Storage), check balance |
| "Compiler version not found" | Use standard versions (0.8.19, 0.8.20, etc.). Custom versions may not be available |
| "Source code doesn't match" | Ensure exact source including comments and whitespace matches |
| "Unknown opcode" | Ensure Solidity version compatibility with EVM version (testnet uses Ethereum compatible EVM) |
| MetaMask rejects transaction | Check gas price, ensure enough balance for gas (not just for contract value) |

---

## Verification Checklist

- [ ] Contract deploys successfully to testnet
- [ ] Contract address is in Integra format (`0x` prefixed hex)
- [ ] Explorer resolves address correctly
- [ ] Verify & Publish button is clickable and visible
- [ ] Verification form accepts all required fields
- [ ] Verification succeeds with correct compiler + optimization
- [ ] Verified badge displays on contract page
- [ ] Source code is readable in Code tab
- [ ] Read functions execute without errors
- [ ] Write functions create transactions successfully
- [ ] Failed verification attempts show clear error messages
- [ ] Subsequent verifications behave consistently

---

## Expected Response Times

- Contract deployment: 10-30 seconds (testnet block time ~1-2s)
- Source code verification: < 5 seconds
- Read function execution: < 1 second
- Write function confirmation: 10-30 seconds (next block)

---

## Notes

- Testnet is a development environment. Contracts may not persist across testnet resets.
- Always test with small amounts of test tokens first.
- Verification results are cached. If verification shows old data, try clearing browser cache and refreshing.
