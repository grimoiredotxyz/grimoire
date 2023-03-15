const BASE_ROUTE_TRANSCRIPTION = '/transcription'
const BASE_ROUTE_TRANSCRIPTION_REVISION = `${BASE_ROUTE_TRANSCRIPTION}/[idTranscription]/revision`
const BASE_ROUTE_USER = '/user'
const BASE_ROUTE_REQUEST = '/request'

// Home page
export const ROUTE_HOME = '/'

// Sign-in
export const ROUTE_SIGN_IN = '/sign-in'

// Dashboard
export const ROUTE_DASHBOARD = '/dashboard'

// Transcriptions

// Search transcripts page
export const ROUTE_TRANSCRIPTION_SEARCH = `${BASE_ROUTE_TRANSCRIPTION}/search`

// Transcription details page
export const ROUTE_TRANSCRIPTION_DETAILS = `${BASE_ROUTE_TRANSCRIPTION}/[idTranscription]`

// Create new transcription page
export const ROUTE_TRANSCRIPTION_NEW = `${BASE_ROUTE_TRANSCRIPTION}/new`

// Transcript revisions

// Transcription revision details page
export const ROUTE_TRANSCRIPTION_REVISION_DETAILS = `${BASE_ROUTE_TRANSCRIPTION_REVISION}/[idRevision]`

// Create new revision of a transcription page
export const ROUTE_TRANSCRIPTION_REVISION_NEW = `${BASE_ROUTE_TRANSCRIPTION_REVISION}/new`

// Request

// Ongoing/active requests page
export const ROUTE_REQUEST_ACTIVE = `${BASE_ROUTE_REQUEST}/active`

// Create new request page
export const ROUTE_REQUEST_NEW = `${BASE_ROUTE_REQUEST}/new`

// Request details page
export const ROUTE_REQUEST_DETAILS = `${BASE_ROUTE_REQUEST}/[idRequest]`

// Leaderboard
export const ROUTE_LEADERBOARD = '/leaderboard'

// Users

// User details page (contributions, score...)
export const ROUTE_USER_DETAILS = `${BASE_ROUTE_USER}/[idUser]`
