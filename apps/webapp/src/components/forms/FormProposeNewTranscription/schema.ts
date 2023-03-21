import { any, boolean, object, array, string } from 'zod'

// Validation schema for the "create a new transcription" form
export const schema = object({
  // Source
  source_media_uris: array(string().trim()).optional(),
  source_media_title: string().trim().min(1),
  language: string().min(1), // code ; eg: en-GB
  keywords: array(string().trim()).optional(),

  // About
  title: string().trim().min(1),
  notes: string().trim().optional(),
  // Transcription
  transcription_plain_text: string().trim().min(1).optional(),
  srt_file: any().optional(),
  srt_uri: string().optional(),
  vtt_file: any().optional(),
  vtt_uri: string().optional(),
  lrc_file: any().optional(),
  lrc_uri: string().optional(),
  // Workflow & contributors
  revision_must_be_approved_first: boolean(),
  collaborators: array(string().regex(/^0x[a-fA-F0-9]{40}$/)).optional(),
})

export default schema
