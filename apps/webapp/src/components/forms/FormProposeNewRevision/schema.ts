import { any, boolean, object, array, string } from 'zod'

// Validation schema for the "create a new transcription" form
export const schema = object({
  // Source
  source_media_uris: string(),
  source_media_title: string(),
  // About
  title: string(),
  language: string(), // code ; eg: en-GB
  keywords: string(),
  notes: string().trim().min(1),
  // Original transcription
  id_original_transcription: string(),
  // Revision
  change_type: array(string()).min(1),
  transcription_plain_text: string().trim().min(1).optional(),
  srt_file: any().optional(),
  srt_uri: string().optional(),
  vtt_file: any().optional(),
  vtt_uri: string().optional(),
  lrc_file: any().optional(),
  lrc_uri: string().optional(),
  // Workflow & contributors
  revision_must_be_approved_first: boolean(),
  collaborators: string(),
})

export default schema
