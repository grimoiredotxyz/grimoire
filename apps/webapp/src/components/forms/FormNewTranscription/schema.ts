import { any, boolean, object, number, string } from 'zod'

// Validation schema for the "create a new transcription" form
export const schema = object({
  title: string().trim().min(1).optional(),
  //  tags: string().optional(),
  //  reference_source_media: string().optional(), // eg: gnosis/<erc-721-contract-address>/<id> ; twitter/<tweet-id>
  source_media_url: string().optional(),
  media_source_type: string().optional(),
  source_media_contract: string().optional(),
  source_media_nft_id: number().optional(),

  // language: string().optional(), // code ; eg: en-GB
  transcription_plain_text: string().trim().min(1).optional(),
  srt_file: any().optional(),
  srt_uri: string().optional(),
  vtt_file: any().optional(),
  vtt_uri: string().optional(),
  lrc_file: any().optional(),
  lrc_uri: string().optional(),
  revision_must_be_approved_first: boolean()
})

export default schema
