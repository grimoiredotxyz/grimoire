export async function getRequestsBoard(args: { sortOrder: 'asc' | 'desc'; cursor?: string }) {
  const encoded = encodeURIComponent(`${import.meta.env.VITE_POLYBASE_NAMESPACE}/Request`)
  let requestUrl = `https://testnet.polybase.xyz/v0/collections/${encoded}/records?limit=30&sort=[["upvotes","${
    args?.sortOrder ?? 'desc'
  }"]]`
  if (args?.cursor) requestUrl = `${requestUrl}&cursor=${args?.cursor}`
  const response = await fetch(requestUrl, {
    headers: {
      Accept: 'application/json',
    },
  })
  const result: {
    data: Array<{
      [key: number]: {
        creator: `0x${string}`
        id: `0x${string}`
        keywords: string
        language: string
        slug: string
        source_media_title: string
        upvotes: number
        voters: Array<`0x${string}`>
      }
    }>
    cursor: {
      before: string
      after: string
    }
  } = await response.json()
  return result
}

export default getRequestsBoard
