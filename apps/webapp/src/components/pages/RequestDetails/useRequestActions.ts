import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { useNavigate } from 'solid-start'
import { CONTRACT_TRANSCRIPTIONS } from '~/config'
import { useToast } from '~/hooks'

export function useRequestActions() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const mutationWriteContractDeleteRequest = createMutation(
    //@ts-ignore
    async (args: { idRequest: string }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'deleteRequest',
        /*
              Arguments order: 
              created_at (uint256)
              contributors (address[])
              metadata_uri (string)
              id_request (bytes32)
              communities (string[]) 
            */
        args: [args?.idRequest],
      })
      //@ts-ignore
      return await writeContract(config)
    },
    {
      async onSuccess(data, variables, context) {
        await mutationTxWaitDeleteRequest.mutateAsync({ hash: data?.hash })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't delete your request !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitDeleteRequest = createMutation(
    async (args: { hash: `0x${string}` }) => {
      await waitForTransaction({ hash: args.hash })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Request deleted successfully!',
          description: "Your request was deleted successfully. You'll be redirected to the home page in 5 seconds.",
          type: 'success',
          placement: 'bottom-right',
        })
        setTimeout(() => navigate('/', { replace: true }), 5000)
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't delete your request !",
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
    mutationWriteContractDeleteRequest,
    mutationTxWaitDeleteRequest,
  }
}

export default useRequestActions
