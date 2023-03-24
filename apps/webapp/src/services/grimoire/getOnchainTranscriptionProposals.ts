import { readContract } from '@wagmi/core'
import { CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import type { ChainAlias } from '~/config'

/**
 * Get list of proposals for a request with a given id
 */
export async function getOnChainTranscriptionProposals(args: { chainAlias: string; idRequest: string }) {
  const chainId = CHAINS_ALIAS[args.chainAlias as ChainAlias]
  //@ts-ignore
  const chainData: OnChainRequest = await readContract({
    //@ts-ignore
    ...CONTRACT_TRANSCRIPTIONS[chainId],
    functionName: 'getProposalsByRequestId',
    args: [args.idRequest],
  })

  return chainData
}

export default getOnChainTranscriptionProposals
