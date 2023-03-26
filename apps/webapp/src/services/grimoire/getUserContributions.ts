/**
 * Get list of requests, transcriptions and revisions for a user
 */
export async function getUserContributions(args: { address: `0x${string}` }) {
  const data = await Promise.all(
    ['Request', 'Transcription', 'Revision'].map(async (key) => {
      const encoded = encodeURIComponent(`${import.meta.env.VITE_POLYBASE_NAMESPACE}/${key}`)
      let requestUrl = `https://testnet.polybase.xyz/v0/collections/${encoded}/records?where={"creator_address":"${args?.address}"}&limit=30`
      const response = await fetch(requestUrl, {
        headers: {
          Accept: 'application/json',
        },
      })
      return await response.json()
    }),
  )

  return {
    requests: data[0],
    transcriptions: data[1],
    revisions: data[2],
  }
}

export default getUserContributions
