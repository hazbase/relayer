# @hazbase/relayer
[![npm version](https://badge.fury.io/js/@hazbase%2Frelayer.svg)](https://badge.fury.io/js/@hazbase%2Frelayer)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview
`@hazbase/relayer` is the **relayer SDK** that provides **gasless execution (meta-transactions)** for the hazBase stack.  
It is **designed to be used together with `@hazbase/kit`’s `ContractBuilder`**: build **calldata & gas estimates** with the builder, then **sign and relay** the request with this package.

- Recommended composition: **`ContractBuilder` (call assembly)** + **`@hazbase/relayer` (EIP‑712 signing & relay)** + **`@hazbase/auth` (JWT/client‑key/audit logging)**  
- Typical use cases: frictionless first‑time UX, sponsored transactions for KYC‑verified users, better mobile UX  
- Security: one‑time **Auth Code** + `ForwardRequest.nonce` for replay protection, strict **EIP‑712 domain separation**

---

## Flow (architecture)
1) Build calldata & (optionally) gas with **ContractBuilder** (`encode`, `estimate`)  
2) Build **ForwardRequest** (`buildForwardRequest`)  
3) Produce **EIP‑712 signature** (`signForwardRequest`)  
4) Obtain **one‑time Auth Code** (`generateRelayerAuthCode`)  
5) **Send** to relayer (`sendRelayerTransaction`) → returns **tx hash**

> Prefer **`forwardCall`** to do all steps in one go (ABI/method/args → relay). When you also use `ContractBuilder`, you can pre‑compute **data/gas** more precisely.

---

## Requirements
- Node.js **>= 18** (ESM recommended)
- TypeScript **>= 5**
- `ethers` **v6**
- `@hazbase/auth` (API endpoint & client key configuration, audit logging)
- `@hazbase/kit` (`ContractBuilder`)

---

## Installation
```bash
npm i @hazbase/relayer @hazbase/kit @hazbase/auth ethers
# or
pnpm add @hazbase/relayer @hazbase/kit @hazbase/auth ethers
```

---

## Pre‑setup (`@hazbase/auth`)
```ts
// All comments in English per project rule
import { setClientKey } from '@hazbase/auth';

setClientKey(process.env.HAZBASE_CLIENT_KEY!);               // required for validation & logging
```

---

## Quick start (with ContractBuilder)

### A) Builder + `forwardCall` (fastest path)
```ts
// Use ContractBuilder to centralize address/abi, then relay with forwardCall
import { ethers } from 'ethers';
import { signInWithWallet } from '@hazbase/auth';
import { ContractBuilder } from '@hazbase/kit';
import { forwardCall } from '@hazbase/relayer';
import erc20Abi from './abi/MyToken.json' assert { type: 'json' };

const CHAIN_ID = "11155111"; // repolia testnet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
const signer   = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

/** 1) Build a contract helper (address/abi binding) */
const tokenAddress = '0xToken...';

const signer = await provider.getSigner();

const { accessToken } = await signInWithWallet({ signer });

const contract = ContractBuilder
  .create({ address: tokenAddress, abi: erc20Abi, chainId: CHAIN_ID, signer })
  .withRelayer({ accessToken })
  .build();

const decimals = await contract.decimals();
const amountWei = ethers.parseUnits(amount.toString(), decimals);
await contract.transfer(toAddress, amountWei);
```

### B) Builder + low‑level control (explicit `data` / `gas`)
```ts
// Use ContractBuilder to encode calldata and estimate gas, then sign & relay
import { ethers } from 'ethers';
import { ContractBuilder } from '@hazbase/kit';
import {
  buildForwardRequest, makeDomain, signForwardRequest,
  generateRelayerAuthCode, sendRelayerTransaction
} from '@hazbase/relayer';
import erc20Abi from './abi/MyToken.json' assert { type: 'json' };

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
const signer   = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const chainId  = Number((await provider.getNetwork()).chainId);

/** 1) Prepare builder */
const tokenAddress = '0xToken...';
const builder = ContractBuilder
  .create({ address: tokenAddress, abi: erc20Abi, chainId: CHAIN_ID, signer })
  .build();

/** 2) Encode calldata via builder */
const to = '0xRecipient...';
const amount = 1_000n;
const data = builder.encode('transfer', [to, amount]); // or builder.interface.encodeFunctionData(...)

/** 3) Build ForwardRequest */
const req = await buildForwardRequest({
  signer,
  tokenAddress,             // maps to request.to
  chainId
});

/** 4) (Optional) refine gas with builder */
const gasEst = await builder.estimate('transfer', [to, amount]); // typical helper name
req.gas = BigInt(Math.ceil(Number(gasEst) * 1.2));               // add safety margin

/** 5) Inject calldata and sign typed data */
req.data = data;
const domain    = makeDomain(chainId);
const signature = await signForwardRequest({ signer, domain, request: req });

/** 6) Obtain one-time Auth Code and send */
const code   = await generateRelayerAuthCode({
  accessToken: 'JWT-from-signInWithWallet',
  chainId, contractAddress: tokenAddress
});
const txHash = await sendRelayerTransaction({ chainId, code, request: req, signature });
console.log('relayed tx =', txHash);
```

> The exact API names on `ContractBuilder` (e.g., `encode`, `estimate`) can vary by version. Please consult the **type definitions (`.d.ts`) or your editor’s IntelliSense**.

---

## Function reference

### `forwardCall(params: ForwardCallParams) => Promise<string>`
**Purpose**: from ABI/method/args, do ForwardRequest build → sign → get Auth Code → send, and return the **tx hash**.  
**Params**
- `signer: ethers.JsonRpcSigner`
- `chainId: number`
- `accessToken: string` — JWT obtained from `@hazbase/auth.signInWithWallet`
- `contractAddress: string`
- `abi: ethers.InterfaceAbi`
- `method: string`
- `args: unknown[]`

**Returns**: `string` — **transaction hash** (relayer response)

---

### `generateRelayerAuthCode({ accessToken, chainId, contractAddress, type? }) => Promise<string>`
**Purpose**: fetch a **one‑time code** required to execute via relayer.  
**Details**
- Internally calls `ensureClientKeyActive(70)` → `POST /api/app/code/generate-code`
- On success, logs `createRequestTransaction(functionId=70, status='succeeded')`

**Params**
- `accessToken: string`
- `chainId: number`
- `contractAddress: string`
- `type?: string` (default `'relayer_auth'`)

**Returns**: `string` — one‑time code

---

### `buildForwardRequest({ signer, tokenAddress, chainId }) => Promise<ForwardRequest>`
**Purpose**: build a Minimal‑Forwarder compatible **ForwardRequest** (`from,to,value,gas,nonce,data`).  
**Details**
- Reads `nonce` from the chain’s **Forwarder** (`getForwarderAddress(chainId)`)
- Defaults: `value = 0`, `gas` is a coarse estimate (override with builder’s estimate if available)

**Params**
- `signer: ethers.JsonRpcSigner`
- `tokenAddress: string` (mapped to request `to`)
- `chainId: number`

**Returns**: `ForwardRequest`

---

### `makeDomain(chainId: number) => Domain`
**Purpose**: build the EIP‑712 **domain** (`name, version, chainId, verifyingContract`).  
**Note**: `verifyingContract` is the chain’s **Forwarder address**.

---

### `signForwardRequest({ signer, domain, request }) => Promise<string>`
**Purpose**: sign the `ForwardRequest` using EIP‑712 and return the `signature`.

---

### `sendRelayerTransaction({ chainId, code, request, signature }) => Promise<string>`
**Purpose**: send the signed `ForwardRequest` to the **relayer API** and get the **tx hash**.  

**Returns**: `string` — transaction hash (or relayer’s canonical identifier)

---

## Types (primary)
```ts
export interface ForwardRequest {
  from:  string;
  to:    string;
  value: bigint;   // usually 0n
  gas:   bigint;   // estimation; override with builder's estimate
  nonce: bigint;   // forwarder.getNonce(from)
  data:  string;   // calldata from ContractBuilder.encode(...)
}

export interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface ForwardCallParams {
  signer:  ethers.JsonRpcSigner;
  chainId: number;
  accessToken: string;
  contractAddress: string;
  abi: ethers.InterfaceAbi;
  method: string;
  args: unknown[];
}
```

---

## Utilities / constants (excerpt)
- `getRelayerUrl(chainId): string` — resolve relayer API base URL
- `getForwarderAddress(chainId): string` — resolve Minimal‑Forwarder address
- `bigintReplacer` — `JSON.stringify` replacer to stringify `bigint`

> The chain → forwarder mapping depends on your environment. See your `utils.ts` / `constants.ts`.

---

## Best practices
- **Normalize with the builder**: centralize calldata generation & gas estimation in `ContractBuilder`.
- **Domain separation**: always derive domain via `makeDomain()`; pin `chainId` and forwarder per env.
- **Re‑issue Auth Code on retry**: it’s one‑time; also re‑read `nonce` on each retry.

---

## Troubleshooting
- **`Client key not set`** — call `@hazbase/auth.setClientKey()` first.
- **`Relayer error`** — check `result` in the response (expired Auth Code / forwarder mismatch / encoding issues).
- **`invalid signature`** — mismatch between `domain` and `request`. Ensure `from` matches the signer’s address.
- **`nonce too low/high`** — refresh `forwarder.getNonce(from)` and update `request.nonce`.
- **`execution reverted`** — check roles/paused state on target contract, arguments, and balances.

---

## License
Apache-2.0
