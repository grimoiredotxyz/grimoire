import { readContract } from '@wagmi/core'
import { CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS, ChainAlias } from '~/config'
import { web3UriToUrl } from '~/helpers'
import { fromUnixTime } from 'date-fns'

export type OnChainTranscription = {
  id: string
  transcription_id: string
  communities: Array<string>
  contributors: Array<string>
  created_at: number
  creator: string
  id_request: string
  last_updated_at: number
  metadata_uri: string
  revision_metadata_uris: Array<string>
  revision_must_be_approved_first: boolean
}

export type MetadataTranscription = {
  keywords: string | null
  language: string | null
  lrc_file_uri: string | null
  notes: string | null
  source_media_title: string | null
  source_media_uris: string | null
  srt_file_uri: string | null
  title: string | null
  transcription_plain_text: string | null
  vtt_file_uri: string | null
}

export type TranscriptionRating = {
  [key: `0x${string}`]: number
}
export interface Transcription extends OnChainTranscription, MetadataTranscription {
  slug: string
  chainId: number
  created_at_epoch_timestamp: number
  created_at_datetime: Date
  last_updated_at_datetime: Date
  last_updated_at_epoch_timestamp: number
  average_rating: number
  rating: TranscriptionRating
}

/**
 * Get data & metadata from a transcription
 */
export async function getOnChainTranscription(args: {
  chainAlias: string
  idTranscription: string
}): Promise<Transcription> {
  const chainId = CHAINS_ALIAS[args.chainAlias as ChainAlias]
  //@ts-ignore
  const chainData: OnChainTranscription = await readContract({
    //@ts-ignore
    ...CONTRACT_TRANSCRIPTIONS[chainId],
    functionName: 'getTranscript',
    args: [args.idTranscription],
  })
  let data = {
    chainId,
    slug: `${args.chainAlias}/${args.idTranscription}`,
    transcription_id: chainData?.transcription_id,
    id: args?.idTranscription,
    communities: chainData.communities,
    contributors: [...chainData?.contributors, chainData?.creator],
    created_at: chainData.created_at,
    created_at_epoch_timestamp: chainData.created_at,
    created_at_datetime: fromUnixTime(chainData.created_at),
    creator: chainData.creator,
    id_request: chainData.id_request,
    last_updated_at: chainData.last_updated_at,
    last_updated_at_epoch_timestamp: chainData.last_updated_at,
    last_updated_at_datetime: fromUnixTime(chainData.last_updated_at),
    metadata_uri: chainData.metadata_uri,
    revision_metadata_uris: chainData.revision_metadata_uris,
    keywords: null,
    language: null,
    lrc_file_uri: null,
    notes: null,
    revision_must_be_approved_first: true,
    source_media_title: null,
    source_media_uris: null,
    srt_file_uri: null,
    title: null,
    transcription_plain_text: null,
    vtt_file_uri: null,
    rating: {},
    average_rating: 0,
  }
  let polybaseData
  if (chainData?.transcription_id) {
    console.log('spsojgjoe jioegoejfopefjpzj')
    const encoded = encodeURIComponent(`${import.meta.env.VITE_POLYBASE_NAMESPACE}/Transcription`)
    const requestUrl = `https://testnet.polybase.xyz/v0/collections/${encoded}/records/${chainData?.transcription_id}`
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
    const average_rating = Object.values(polybaseData?.data?.rating).reduce((average, value, _, { length }) => {
      return (average as number) + (value as number) / length
    }, 0)
    data = {
      ...data,
      ...metadata,
      rating: polybaseData?.data?.rating,
      average_rating,
    }
  }
  return data as Transcription
}

export default getOnChainTranscription
