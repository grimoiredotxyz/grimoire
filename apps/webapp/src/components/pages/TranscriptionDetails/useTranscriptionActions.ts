import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { useNavigate } from 'solid-start'
import { CONTRACT_TRANSCRIPTIONS } from '~/config'
import { useToast } from '~/hooks'

export function useTranscriptionActions() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const mutationWriteContractDeleteTranscription = createMutation(
    //@ts-ignore
    async (args: { idTranscription: string }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'deleteTranscription',
        args: [args?.idTranscription],
      })
      //@ts-ignore
      return await writeContract(config)
    },
    {
      async onSuccess(data, variables, context) {
        await mutationTxWaitDeleteTranscription.mutateAsync({ hash: data?.hash })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't delete your transcription !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitDeleteTranscription = createMutation(
    async (args: { hash: `0x${string}` }) => {
      await waitForTransaction({ hash: args.hash })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Transcription deleted successfully!',
          description:
            "Your transcription was deleted successfully. You'll be redirected to the home page in 5 seconds.",
          type: 'success',
          placement: 'bottom-right',
        })
        setTimeout(() => navigate('/', { replace: true }), 5000)
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't delete your transcription !",
          description: 'Your transaction might have failed.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
      onSettled() {
        // Whether or not the transaction is successful, invalidate user balance query
        // this way we will refresh the balance
        queryClient.invalidateQueries(['user-balance'])
      },
    },
  )

  return {
    mutationWriteContractDeleteTranscription,
    mutationTxWaitDeleteTranscription,
  }
}

export default useTranscriptionActions
