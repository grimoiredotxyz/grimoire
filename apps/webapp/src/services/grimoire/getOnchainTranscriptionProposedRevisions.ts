import { readContract } from '@wagmi/core'
import { CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import type { ChainAlias } from '~/config'
/**
 * Get list of proposed revisions for a transcription with a given id
 */
export async function getOnchainTranscriptionProposedRevisions(args: {
  chainAlias: string
  idTranscription: string
  status: 0 | 1 | 2 // PENDING: 0, ACCEPTED: 1, REJECTED: 2
}) {
  const chainId = CHAINS_ALIAS[args.chainAlias as ChainAlias]
  //@ts-ignore
  const chainData: OnChainRequest = await readContract({
    //@ts-ignore
    ...CONTRACT_TRANSCRIPTIONS[chainId],
    functionName: 'getRevisionsByTranscriptionId',
    args: [args.idTranscription, args.status],
  })

  return chainData
}

export default getOnchainTranscriptionProposedRevisions
