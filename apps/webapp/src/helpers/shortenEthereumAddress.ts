/**
 * Shorten an Ethereum address to display the first and last characters
 * @param address - Ethereum address to shorten
 * @returns Ethereum address as "0xab..ef"
 */
export function shortenEthereumAddress(address: `0x${string}`): `0x${string}` {
  let shortenedAddress = address
  const shortenedLength = 4
  const front = address.substr(0, shortenedLength)
  const mid = '...'
  const end = address.substr(-2)
  shortenedAddress = (front + mid + end) as `0x${string}`
  return shortenedAddress
}

export default shortenEthereumAddress
