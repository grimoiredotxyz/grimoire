import { readContract } from '@wagmi/core'
import { queryClient, CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS, ChainAlias } from '~/config'
import { web3UriToUrl } from '~/helpers'
import { fromUnixTime } from 'date-fns'

export type OnChainTranscription = {
  id: string
  transcript_id: string
  communities: string
  contributors: string
  created_at: number
  creator: string
  id_request: string
  last_updated_at: number
  metadata_uri: string
  revision_metadata_uris: Array<string>
}

export type MetadataTranscription = {
  keywords: string | null
  language: string | null
  lrc_file_uri: string | null
  notes: string | null
  revision_must_be_approved_first: string | null
  source_media_title: string | null
  source_media_uri: string | null
  srt_file_uri: string | null
  title: string | null
  transcription_plain_text: string | null
  vtt_file_uri: string | null
}

export interface Transcription extends OnChainTranscription, MetadataTranscription {
  slug: string
  chainId: number
  created_at_epoch_timestamp: number
  created_at_datetime: Date
  last_updated_at_datetime: Date
  last_updated_at_epoch_timestamp: number
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
    transcript_id: chainData?.transcript_id,
    id: args?.idTranscription,
    communities: chainData.communities,
    contributors: chainData?.contributors?.length > 0 ? chainData?.contributors?.split(',') : [chainData.creator],
    created_at_epoch_timestamp: chainData.created_at,
    created_at_datetime: fromUnixTime(chainData.created_at),
    creator: chainData.creator,
    id_request: chainData.id_request,
    last_updated_at_epoch_timestamp: chainData.last_updated_at,
    last_updated_at_datetime: fromUnixTime(chainData.last_updated_at),
    metadata_uri: chainData.metadata_uri,
    revision_metadata_uris: chainData.revision_metadata_uris,
    keywords: null,
    language: null,
    lrc_file_uri: null,
    notes: null,
    revision_must_be_approved_first: null,
    source_media_title: null,
    source_media_uri: null,
    srt_file_uri: null,
    title: null,
    transcription_plain_text: null,
    vtt_file_uri: null,
  }

  if (data?.metadata_uri && data?.metadata_uri !== '') {
    const uri = web3UriToUrl(data?.metadata_uri)
    const response = await fetch(uri)
    const metadata = await response.json()
    data = {
      ...data,
      ...metadata,
    }
    queryClient.setQueryData(['transcription', `${args.chainAlias}/${args.idTranscription}`], data)
  }
  return data as Transcription
}

export default getOnChainTranscription
