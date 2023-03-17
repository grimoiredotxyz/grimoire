import { object, array, string } from 'zod'

// Validation schema for the "create a new request" form
export const schema = object({
  // About
  source_media_uris: array(string().trim()).optional(),
  source_media_title: string().trim().min(1),
  notes: string().trim().optional(),
  // Workflow & contributors
  collaborators: array(string().regex(/^0x[a-fA-F0-9]{40}$/)).optional(),
})

export default schema
