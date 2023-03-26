import { createMutation } from '@tanstack/solid-query'
import { fetchSigner } from '@wagmi/core'
import * as PushAPI from '@pushprotocol/restapi'
import { useAuthentication, useToast } from '~/hooks'
import { createSignal } from 'solid-js'

export function usePushChat() {
  const toast = useToast()
  const { currentUser, pushChatProfile } = useAuthentication()
  const [decryptedKey, setDecryptedKey] = createSignal()
  async function getKeyAndSigner() {
    const encryptedPrivateKey = pushChatProfile()?.encryptedPrivateKey
    const signer = await fetchSigner()
    let _decryptedKey = decryptedKey()
    if (!_decryptedKey) {
      _decryptedKey = await PushAPI.chat.decryptPGPKey({
        encryptedPGPPrivateKey: encryptedPrivateKey,
        signer: signer,
      })
      setDecryptedKey(_decryptedKey)
    }

    return {
      decryptedKey: _decryptedKey,
      signer,
    }
  }

  const mutationSendMessage = createMutation(
    async (args: {
      messageContent: string
      messageType: 'Text' | 'Image' | 'File' | 'GIF'
      receiverAddress: `0x${string}`
    }) => {
      const { signer, decryptedKey } = await getKeyAndSigner()
      return await PushAPI.chat.send({
        messageContent: args.messageContent,
        messageType: args.messageType,
        receiverAddress: `eip155:${args.receiverAddress}`,
        signer: signer,
        pgpPrivateKey: decryptedKey,
      })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Message sent successfully !',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Your message couldn't be sent.",
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationCreateGroupChat = createMutation(
    async (args: {
      groupName: string
      groupDescription?: string
      members: Array<`0x${string}`>
      admins: Array<`0x${string}`>
      groupImage?: string
      isPublic: boolean
    }) => {
      const { decryptedKey } = await getKeyAndSigner()
      return await PushAPI.chat.createGroup({
        groupName: args?.groupName,
        groupDescription: args?.groupDescription ?? '',
        members: args?.members,
        groupImage: args?.groupImage ?? '',
        admins: args?.admins,
        isPublic: args?.isPublic ?? true,
        account: currentUser()?.address,
        pgpPrivateKey: decryptedKey, //decrypted private key
      })
    },
  )

  return {
    mutationCreateGroupChat,
    mutationSendMessage,
    getKeyAndSigner,
  }
}
export default usePushChat
