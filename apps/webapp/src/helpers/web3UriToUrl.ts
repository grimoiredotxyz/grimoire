/**
 * Transform a web3 URI (arweave, ipfs...) to a http:// string
 * @param uri : URI to format as HTTP
 * @returns
 */
export function web3UriToUrl(uri: string): string {
  return uri?.replace('ipfs://', 'https://4everland.io/ipfs/').replace('ar://', 'https://arweave.net/')
}
export default web3UriToUrl
