---
gip: 1
title: Energy Token Standard (GRID / GRX)
status: Draft
type: Standards Track
category: Core
author: WiT (@WiT)
discussions-to: https://github.com/gridtokenx/gips/discussions/1
pr: 1
created: 2026-07-19
---

## Abstract

This GIP specifies the **Energy Token** — the single fungible unit of account
for the GridTokenX P2P energy platform. One on-chain SPL mint represents
generated and tradeable energy: **1 kWh = 1 GRID**. The mint is labelled
**GRID** as the energy unit and **GRX** in its utility / collateral role — it
is the *same* mint, not two tokens. Issuance is gated behind a set of
registered **REC validators** so every minted token is backed by an attested
renewable-energy certificate.

The token is implemented by the `energy-token` Anchor program (on-chain id
`6FZKcVKCLFSNLMxypFJGU4K14xUBnxNW9VAuKGhmqjGX`).

## Motivation

Energy must be represented on-chain in a way that is (a) fungible and
tradeable in the CDA matching engine, (b) provably backed by real generation,
and (c) safe to mint from an off-chain metering pipeline that may retry. A
single Token-2022 mint plus a REC-validator co-signature gate and a
per-`(meter, window)` idempotency guard satisfies all three.

## Specification

### Token

- **Standard:** SPL **Token-2022** mint, with Metaplex metadata.
- **Decimals:** 9.
- **Denomination:** 1 kWh = 1 GRID (GRX = same mint, utility/collateral role).
- **Mint authority:** the `energy-token` program via its `TokenInfo` PDA.

### Accounts (PDAs)

- **`TokenInfo`** — seeds `["token_info_2022"]`. Fields: `authority`,
  `registry_authority`, `registry_program`, `mint`, `total_supply`,
  `created_at`, `rec_validators[5]`, `rec_validators_count`. Holds the global
  mint config and the REC-validator set (max 5).
- **`GenerationMintRecord`** — seeds
  `["gen_mint", meter_id, window_start_ms]`. Fields: `meter_id[16]`
  (settlement meter UUID), `window_start_ms`, `amount`, `minted`, `bump`.
  One record per `(meter, 15-min window)`; the idempotency guard for minting.

### REC gate

Every mint path (`mint_to_wallet`, `mint_generation`, `mint_tokens_direct`)
requires a co-signer that is a **registered REC validator** — a single shared
membership check (`rec_validator_registered`) so the gate can never drift
between paths. REC validators are added/removed **only** by the governance
authority (the ERC governance program), not the token admin.

### Instructions

| Instruction | Purpose |
| --- | --- |
| `initialize` / `initialize_token` | Create `TokenInfo` + config. |
| `create_token_mint` | Attach Metaplex metadata to the GRID mint. |
| `mint_to_wallet` | REC-gated mint of GRID to a wallet. |
| `mint_generation` | Idempotent generation mint, keyed by `(meter_id, window_start_ms)`. |
| `mint_tokens_direct` | Registry-PDA-signed mint (registration airdrop). |
| `transfer_tokens` | Transfer GRID between token accounts. |
| `retire_energy_tokens` | Burn GRID on energy consumption. |
| `add_rec_validator` / `remove_rec_validator` | Governance-only REC-validator set management. |
| `sync_total_supply` | Reconcile `TokenInfo.total_supply` in batch. |
| `set_registry_authority` / `set_authority` | Rotate authorities. |

### Generation minting rules

`mint_generation` is called by the Aggregator Bridge **once per settlement
window**. It enforces:

- **Idempotency:** if the `(meter, window)` record already has `minted = true`,
  the call is a no-op success (safe on retry/replay).
- **Non-zero amount:** `amount == 0` is rejected (a zero `mint_to` would still
  stamp `minted = true` and permanently poison the window).
- **Window alignment:** `window_start_ms > 0`,
  `window_start_ms % 900_000 == 0` (15-min = 900 s = 900 000 ms), and the
  window may not start in the future (`≤ now + one window`).

### Retirement

`retire_energy_tokens` burns GRID to represent consumption. `total_supply` is
**not** updated inline — use `sync_total_supply` for batch reconciliation.

### Registration airdrop

On user registration the `registry` program CPIs into `energy-token`
(`mint_tokens_direct`), signing **as its own PDA**, to mint a small GRX
onboarding grant (10 GRX).

## Rationale

- **One mint, two roles** avoids liquidity fragmentation between an "energy"
  and a "utility" token while keeping a single supply figure.
- **REC-validator co-signature** ties issuance to an off-chain attestation
  authority (ERC), so tokens cannot be minted without a backing certificate.
- **Per-`(meter, window)` PDA** makes the metering→mint pipeline crash-safe:
  the on-chain record, not the off-chain node, is the source of truth for
  "has this window already been minted".

## Security Considerations

- Minting is only as trustworthy as the REC-validator set; validator
  management is restricted to the governance authority.
- The window upper bound and alignment checks reject unaligned or
  future-dated garbage windows before any `mint_to` CPI runs.
