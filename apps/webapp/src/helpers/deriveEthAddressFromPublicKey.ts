import createKeccakHash from 'keccak'
import { decodeFromString, encodeToString } from '@polybase/util'
import { Buffer } from 'buffer'
export function deriveEthAddressFromPublicKey(publicKey: string) {
  if (publicKey?.slice(0, 2) === '0x') {
    const pkb = decodeFromString(publicKey, 'hex')
    const hash = createKeccakHash('keccak256').update(Buffer.from(pkb)).digest()
    return encodeToString(hash.slice(-20), 'hex')
  }
  return '?'
}
export default deriveEthAddressFromPublicKey
