
const BASE_ROUTE_TRANSCRIPT = '/transcript'
const BASE_ROUTE_TRANSCRIPT_REVISION =  `${BASE_ROUTE_TRANSCRIPT}/[idTranscript]/revision`
const BASE_ROUTE_USER = '/user'
const BASE_ROUTE_REQUEST = '/request'

// Home page
export const ROUTE_HOME = '/'

// Sign-in
export const ROUTE_SIGN_IN = '/sign-in'

// Dashboard
export const ROUTE_DASHBOARD = '/dashboard'

// Transcripts

// Transcription details page
export const ROUTE_TRANSCRIPT_DETAILS = `${BASE_ROUTE_TRANSCRIPT}/[idTranscript]`

// Create new transcription page
export const ROUTE_TRANSCRIPT_NEW = `${BASE_ROUTE_TRANSCRIPT}/new`

// Transcript revisions

// Transcription revision details page
export const ROUTE_TRANSCRIPT_REVISION_DETAILS = `${BASE_ROUTE_TRANSCRIPT_REVISION}/[idRevision]`

// Create new revision of a transcription page
export const ROUTE_TRANSCRIPT_REVISION_NEW = `${BASE_ROUTE_TRANSCRIPT_REVISION}/new`

// Request

// Ongoing/active requests page
export const ROUTE_REQUEST_ACTIVE =`${BASE_ROUTE_REQUEST}/active`

// Create new request page
export const ROUTE_REQUEST_NEW =`${BASE_ROUTE_REQUEST}/new`

// Request details page
export const ROUTE_REQUEST_DETAILS =`${BASE_ROUTE_REQUEST}/[idRequest]`


// Leaderboard
export const ROUTE_LEADERBOARD ='/leaderboard'

// Users

// User details page (contributions, score...)
export const ROUTE_USER_DETAILS = `${BASE_ROUTE_USER}/[idUser]`
