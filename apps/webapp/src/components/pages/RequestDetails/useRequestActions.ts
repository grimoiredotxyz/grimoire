import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { useNavigate } from 'solid-start'
import { CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import { usePolybase, useToast } from '~/hooks'

export function useRequestActions() {
  const queryClient = useQueryClient()
  // DB (polybase)
  const { db } = usePolybase()

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
        args: [args?.idRequest],
      })
      //@ts-ignore
      return await writeContract(config)
    },
    {
      async onSuccess(data, variables, context) {
        await mutationTxWaitDeleteRequest.mutateAsync({ idRequest: variables?.idRequest, hash: data?.hash })
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
    async (args: { hash: `0x${string}`; idRequest: string }) => {
      await waitForTransaction({ hash: args.hash })
      const dbCollectionReference = db.collection('Request')
      await dbCollectionReference.record(args?.idRequest).call('del')
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

  const mutationWriteContractUpdateRequestStatus = createMutation(
    //@ts-ignore
    async (args: { idRequest: string; isFulfilled: boolean; isOpen: boolean }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'updateRequestStatus',
        /**
          request_id (bytes32)
          receiving_transcripts (bool)
          fulfilled (bool) 
         */
        args: [args?.idRequest, args?.isOpen, args?.isFulfilled],
      })
      //@ts-ignore
      return {
        ...(await writeContract(config)),
        chainId,
      }
    },
    {
      async onSuccess(data, variables, context) {
        await mutationTxWaitUpdateRequestStatus.mutateAsync({
          chainId: data.chainId as number,
          hash: data?.hash,
          idRequest: variables?.idRequest,
          isFulfilled: variables?.isFulfilled,
          isOpen: variables?.isOpen,
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't update your request !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitUpdateRequestStatus = createMutation(
    async (args: {
      hash: `0x${string}`
      idRequest: string
      isFulfilled: boolean
      isOpen: boolean
      chainId: number
    }) => {
      await waitForTransaction({ hash: args.hash })
    },
    {
      onSuccess(data, variables) {
        //@ts-ignore
        toast().create({
          title: 'Request updated successfully!',
          description: 'Your request was updated successfully.',
          type: 'success',
          placement: 'bottom-right',
        })
        const slug = `${CHAINS_ALIAS[variables.chainId]}/${variables.idRequest}`
        const requestPreviousData = queryClient.getQueriesData(['request', slug])
        queryClient.setQueryData(['request', slug], {
          ...requestPreviousData,
          fulfilled: variables.isFulfilled,
          fullfiled: variables.isFulfilled,
          receiving_transcripts: variables.isOpen,
          open_for_transcripts: variables.isOpen,
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't update the status of your request !",
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

  const mutationUpvoteRequest = createMutation(
    async (args: { idRequest: string }) => {
      const dbCollectionReference = db.collection('Request')
      await dbCollectionReference.record(args?.idRequest).call('upvote')
    },
    {
      onSuccess(data, variables) {
        //@ts-ignore
        toast().create({
          title: 'Your upvote was casted successfully successfully!',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't upvote this request !",
          description: 'Make sure to sign the message in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  return {
    mutationWriteContractDeleteRequest,
    mutationTxWaitDeleteRequest,
    mutationWriteContractUpdateRequestStatus,
    mutationTxWaitUpdateRequestStatus,
    mutationUpvoteRequest,
  }
}

export default useRequestActions
