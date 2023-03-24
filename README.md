# Grimoire front-end

> **[REDACTED]**

## Description

[REDACTED]

## Monorepo structure

- `apps/webapp` - SolidJS webapp - allow users to create requests, transcriptions as well as proposing and managing transcriptions revisions

## Tech stack overview

[REDACTED]

## Get started

### Pre-requisites

- `node` version `>=18.0.0`. If you're using `nvm`, you can run `nvm use 18.0.0`.
- Fleek Storage API keys
- Create a `.env` file in `/apps/webapp` with the following content:

```
VITE_FLEEK_IPFS_KEY=
VITE_FLEEK_IPFS_SECRET=
```

### Once you're set

- Install dependencies `pnpm install`
- Run the app `pnpm dev`

## Deployed contracts

### Transcriptions

- Gnosis Chiado (testnet) contract address : `0x92C410556C7AeD3C9aa6ED3552431C876770FF99`
- Optimism Goerli (testnet) contract address : `0x239b986D8B3bAB3e89D9586a5D83c5C0B08Fc3D3`
- Scroll alpha (testnet) contract address : `0xF91F71e2AB73a5298CAb2aD8df0EBE6e176961Ce`
- FVM Hyperspace (testnet) contract address : `0x27B485cD095d4EC7181eE867c991E38654B7F3AA`
- Polygon Mumbai (testnet) contract address: `0x03a73edc9F544d3F0bbbb1895111BA918d3d01f6` ([view on Mumbaiscan](https://mumbai.polygonscan.com/address/0x03a73edc9F544d3F0bbbb1895111BA918d3d01f6#code))

## Deployed subgraphs (hosted service)
