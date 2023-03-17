import { FLEEK_KEYS } from '~/config'
import fleek from '@fleekhq/fleek-storage-js'

/**
 * Upload a file to IPFS using Fleek
 * Learn more on Fleek documentation (https://docs.fleek.co/storage/fleek-storage-js/#upload)
 * @param args {file: File, key: string }
 * @returns IPFS hash (CID)
 */
export async function uploadFileToIPFS(args: { file: any; key: string }) {
  const input = {
    ...FLEEK_KEYS,
    key: args.key,
    data: args.file,
  }

  const result = await fleek.upload(input)
  const cid = result.hash
  return `ipfs://${cid}`
}

export default uploadFileToIPFS
