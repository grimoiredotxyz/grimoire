import { SUBGRAPH_API_ENDPOINT } from './config'

/**
 * get all existing projext categories from Everest subgraph
 */
export async function getAllCategories() {
  const response = await fetch(SUBGRAPH_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: `
      categories {
        id
        name
        description
        imageUrl
      }        `,
    }),
  })
  const result = await response.json()
  return result
}

export default getAllCategories
