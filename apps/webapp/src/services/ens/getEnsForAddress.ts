import { SUBGRAPH_API_ENDPOINT } from './config'

/**
 * @param query - get ENS name by user Ethereum address
 */
export async function getEnsForAddress(args: { query: `0x${string}` }) {
  const response = await fetch(SUBGRAPH_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: `
          query DomainsByAddress($query: String!) {
            domains(
              where: { 
                owner_contains_nocase: $query
                resolvedAddress_contains_nocase: $query }
            ) {
              name
              resolver {
               texts
              }
            }
          }
        `,
      variables: {
        query: args.query ?? '',
      },
    }),
  })
  const result = await response.json()
  return result
}

export default getEnsForAddress
