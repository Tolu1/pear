# 1. Receive Arc payments in a backend hot wallet

Status: Accepted
Date: 2026-10-07

## Context

Users pay Pear in USDC on Arc, and Pear pays Laso for each virtual card in USDC on Base, so every Arc payment is bridged to Base with Circle's CCTP before the card is bought. A CCTP transfer starts with a burn on Arc that the backend must send on its own during a checkout. Pear's receiving address on Base is a Gnosis Safe, which needs its owners to sign every transaction, so the backend cannot burn from it. The Safe is also not deployed on Arc: the address has no contract code on Arc mainnet or testnet, so USDC sent there would not be controlled by the Safe.

## Decision

The Arc rail's payment address is a hot wallet whose private key the backend holds. Users pay into it, the backend burns from it on Arc, and the same address receives the minted USDC on Base and pays Laso. It only holds money in flight, and the margin left after each card is swept to the Safe by hand.

## Trade-offs

Chosen: a backend-held hot wallet
```diff
+ The backend can bridge and pay Laso without anyone signing, so checkout finishes on its own.
+ One address on Arc and Base keeps the flow easy to follow.
- A leaked key loses everything in the wallet.
- Sweeping the margin to the Safe is manual.
```

Rejected: keep the Gnosis Safe as the receiving address
```diff
+ Funds stay behind multisig.
- The backend cannot burn without owner signatures, so checkout cannot finish on its own.
- The Safe is not deployed on Arc.
```
