# Grimoire front-end

> Making web3 more inclusive and accessible with open, quality, community-checked captions and transcriptions.

## Features Overview

- [x] Create and manage transcriptions requests and their transcription proposals ;
- [x] Create and manage transcriptions and their revision proposals ;
- [x] Issue a social attestation for any successul contribution ; (accepted revision, accepted transcription proposal)
- [x] Rate transcriptions ;
- [ ] Message reviewers openly (public group chat) ; (work-in-progress)
- [ ] Search and filter through transcriptions ; (work-in-progress)

## Description

**Grimoire** is a platform that helps users make online content more accessible and inclusive by creating transcriptions of audio/video content using SRT, VTT, LRC files, as well as plain-text transcriptions. In additon, users can also request transcriptions and propose revisions to improve them. The quality of the transcriptions is decided by the community via a 5-stars-based rating, ensuring accuracy and accountability. Requests can be more visible by upvoting them.

By leveraging the power of web3 technology to create a transparent and open for transcription services, Grimoire strives not only to help users by providing them accessible content, but also to empower other content creation platforms by providing them quality synchronized captions for free, creating new opportunities for content creation platforms and content creators.

Available on multiple chains that all feature low gas fees, Grimoire ensures this essential service is accessible to as many dapps as possible in the future, opening the way to create quality, inclusive and accessible web3 experiences.

## Tech stack overview

- Front-end - @wagmi/core, solid-start, tailwindcss, @tanstack/query, @zag-js, cva, graphql-requesy
- Web3 database: Polybase
- Messaging - Push Protocol
- Subgraph - The Graph Protocol
- File upload - Fleek/IPFS
- Relayer/gas sponsoring - Gelato Network 1Balance
- Attestation - Optimism Attestation Station

## Get started

### Pre-requisites

- `node` version `>=18.0.0`. If you're using `nvm`, you can run `nvm use 18.0.0`.
- Fleek Storage API keys
- Gelato 1Balance API key
- Create a `.env` file in `/apps/webapp` with the following content:

```
VITE_FLEEK_IPFS_KEY=
VITE_FLEEK_IPFS_SECRET=
VITE_GELATO_1BALANCE_API_KEY=
VITE_POLYBASE_NAMESPACE=pk/0xe762dc31848931f629dced5663de9412ac467b6b1475b99134dd41a51ca1e52ae61e096fcccae25ae11c80550cfbadebb3dcf69c639e762dcbdad4d6fe508a6e/grimoirexyz-beta
```

### Once you're set

- Install dependencies `pnpm install`
- Run the app `pnpm dev`

## Deployed contracts

### Grimoire

This Solidity smart contract is compatible with EVM chains. It enables the management of requests, transcriptions and transcriptions revisions. Indexing large, filterable lists are delegated to the database (Polybase) and the subgraph (The Graph)

- [Polygon Mumbai `0xaCA5bbE605f528bb5D101abe352cA390E7E70d09`](https://mumbai.polygonscan.com/address/0xaCA5bbE605f528bb5D101abe352cA390E7E70d09)
- [Gnosis Chiado `0xc6f77Bb7E30310dD56668998F7257d4b58753D89`](https://repo.sourcify.dev/contracts/full_match/10200/0xc6f77Bb7E30310dD56668998F7257d4b58753D89/)
- [Optimism Goerli `0x4B81eBb27Fc6d07C8d0F1CD7d163E5ED809940d8`](https://repo.sourcify.dev/contracts/full_match/420/0x4B81eBb27Fc6d07C8d0F1CD7d163E5ED809940d8/)
- [Scroll Alpha tesnet `0x239b986D8B3bAB3e89D9586a5D83c5C0B08Fc3D3`](https://blockscout.scroll.io/address/0x239b986D8B3bAB3e89D9586a5D83c5C0B08Fc3D3)
- [Filecoin Hyperspace `0x92C410556C7AeD3C9aa6ED3552431C876770FF99`](https://w3s.link/ipfs/bafkreihwxlpopkzqgs7upogg3yqtr2gtnjx56ixvqdys56jcbcegt5dnju)
-[Polygon zkEVM `0x3A871Aea5151046bD2C8c8a7ae3356c0836D0a82`](https://explorer.public.zkevm-test.net/address/0x3A871Aea5151046bD2C8c8a7ae3356c0836D0a82)
- [Taiko Sepolia `0x4B81eBb27Fc6d07C8d0F1CD7d163E5ED809940d8`](https://sepolia.etherscan.io/address/0x4B81eBb27Fc6d07C8d0F1CD7d163E5ED809940d8)

### Scaling Ethereum 2023 hackathon
After recording our demo video for the Scaling Ethereum hackathon, we noticed a bug in the smart contract and redeployed them. You can find the smart contracts address used in our demo video below :

- Polygon Mumbai : 0xD9f939e8eCD876Ca0908E8CE35C109161488E895
- Gnosis Chiado: 0x92C410556C7AeD3C9aa6ED3552431C876770FF99
- Optimism Goerli: 0x239b986D8B3bAB3e89D9586a5D83c5C0B08Fc3D3 -
- Scroll Alpha tesnet: 0xF91F71e2AB73a5298CAb2aD8df0EBE6e176961Ce
- Filecoin Hyperspace: 0xB293049B4940C3AF4191C8b03f79C8c0e5B39199
- Polygon zkEVM (testnet): 0x239b986D8B3bAB3e89D9586a5D83c5C0B08Fc3D3
- Sepolia (Taiko testnet): 0x239b986D8B3bAB3e89D9586a5D83c5C0B08Fc3D3


## Deployed subgraphs (hosted service)

- [Mumbai](https://thegraph.com/hosted-service/subgraph/timotejgerzelj/grimoire-subgraph)
  We are also using the ENS subgraph to display human-friendly Ethereum addresses.

## Polybase schema

You can check the schema at this id `grimoirexyz-beta`
