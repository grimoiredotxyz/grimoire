import { readContract } from '@wagmi/core'
import { queryClient, CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS, ChainAlias } from '~/config'
import { web3UriToUrl } from '~/helpers'
import { fromUnixTime } from 'date-fns'

type OnChainRequest = {
  collaborators: Array<`0x${string}`>
  creator: `0x${string}`
  created_at: number
  fullfiled: boolean
  id: string
  id_linked_transcription: string
  last_updated_at: number
  metadata_uri: string
  receiving_transcripts: boolean
  request_id: string
}

export type MetadataRequest = {
  source_media_title: string
  source_media_uris: string
  notes: string
  language: string
  keywords: string
}

export interface Request extends OnChainRequest, MetadataRequest {
  slug: string
  chainId: number
  created_at_epoch_timestamp: number
  created_at_datetime: Date
  last_updated_at_datetime: Date
  last_updated_at_epoch_timestamp: number
  fulfilled: boolean
  open_for_transcripts: boolean
}

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
