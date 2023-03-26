import { readContract } from '@wagmi/core'
import { CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS, ChainAlias } from '~/config'
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
  voters: any
}

/**
 * Get data & metadata from a request
 */
export async function getOnChainRequest(args: { chainAlias: string; idRequest: string }) {
  const chainId = CHAINS_ALIAS[args.chainAlias as ChainAlias]
  //@ts-ignore
  const chainData: OnChainRequest = await readContract({
    //@ts-ignore
    ...CONTRACT_TRANSCRIPTIONS[chainId],
    functionName: 'getRequest',
    args: [args.idRequest],
  })

  let data = {
    chainId,
    slug: `${args.chainAlias}/${args.idRequest}`,
    request_id: chainData?.request_id,
    id: args?.idRequest,
    collaborators:
      chainData?.collaborators?.length > 0 ? [...chainData?.collaborators, chainData.creator] : [chainData.creator],
    created_at_epoch_timestamp: chainData.created_at,
    created_at_datetime: fromUnixTime(chainData.created_at),
    creator: chainData.creator,
    last_updated_at_epoch_timestamp: chainData.last_updated_at,
    last_updated_at_datetime: fromUnixTime(chainData.last_updated_at),
    metadata_uri: chainData.metadata_uri,
    id_linked_transcription: chainData.id_linked_transcription,
    fulfilled: chainData.fullfiled,
    open_for_transcripts: chainData.receiving_transcripts,
  }
  let polybaseData
  if (chainData?.request_id) {
    const encoded = encodeURIComponent(`${import.meta.env.VITE_POLYBASE_NAMESPACE}/Request`)
    const requestUrl = `https://testnet.polybase.xyz/v0/collections/${encoded}/records/${chainData?.request_id}`
    const response = await fetch(requestUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
    polybaseData = await response.json()
  }

  if (data?.metadata_uri && data?.metadata_uri !== '') {
    const uri = web3UriToUrl(data?.metadata_uri)
    const response = await fetch(uri)
    const metadata = await response.json()
    data = {
      ...data,
      ...metadata,
      collaborators: data.collaborators,
      voters: polybaseData?.data?.voters ?? {},
    }
  }

  return data as Request
}

export default getOnChainRequest
