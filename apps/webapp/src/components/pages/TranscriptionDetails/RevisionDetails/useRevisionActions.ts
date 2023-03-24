import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core'
import { CONTRACT_TRANSCRIPTIONS } from '~/config'
import { usePolybase, useToast } from '~/hooks'

export function useRevisionActions() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutationWriteAcceptRevision = createMutation(
    //@ts-ignore
    async (args: { idRevision: string }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'acceptRevision',
        args: [args?.idRevision],
      })
      //@ts-ignore
      return await writeContract(config)
    },
    {
      async onSuccess(data, variables, context) {
        await mutationTxWaitAcceptRevision.mutateAsync({ idRevision: variables?.idRevision, hash: data?.hash })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't accept this revision !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitAcceptRevision = createMutation(
    async (args: { hash: `0x${string}`; idRevision: string }) => {
      return await waitForTransaction({ hash: args.hash })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Revision accepted successfully!',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't accept the revision !",
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

  const mutationWriteRejectRevision = createMutation(
    //@ts-ignore
    async (args: { idRevision: string }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'rejectRevision',
        args: [args?.idRevision],
      })
      //@ts-ignore
      return await writeContract(config)
    },
    {
      async onSuccess(data, variables, context) {
        await mutationTxWaitRejectRevision.mutateAsync({ idRevision: variables?.idRevision, hash: data?.hash })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't reject this revision !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitRejectRevision = createMutation(
    async (args: { hash: `0x${string}`; idRevision: string }) => {
      return await waitForTransaction({ hash: args.hash })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Revision rejected successfully!',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't reject the revision !",
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
    mutationWriteAcceptRevision,
    mutationTxWaitAcceptRevision,
    mutationWriteRejectRevision,
    mutationTxWaitRejectRevision,
  }
}

export default useRevisionActions
