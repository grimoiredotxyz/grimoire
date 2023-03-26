import * as rating from '@zag-js/rating-group'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'
import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { useNavigate } from 'solid-start'
import { CONTRACT_TRANSCRIPTIONS } from '~/config'
import { usePolybase, useToast } from '~/hooks'

export function useTranscriptionActions(args: { averageRating: number; id: string }) {
  //@ts-ignore
  const navigate = useNavigate()
  //@ts-ignore
  const { db } = usePolybase()
  const queryClient = useQueryClient()
  const toast = useToast()

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
      async onSuccess() {
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
        queryClient.invalidateQueries({ queryKey: ['user-balance'] })
      },
    },
  )

  /**
   * Mutation that updates the rating a user gave to a specific Transcription record
   */
  const mutationGiveRating = createMutation(
    async (args: { idTranscription: string; rating: number }) => {
      const dbCollectionReference = db.collection('Transcription')
      await dbCollectionReference.record(args?.idTranscription).call('evaluateTranscription', [args?.rating])

      return args?.rating
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Rating saved!',
          description: 'You can update your rating for this transcription whenever you want',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't update your rating for this transcription !",
          description: 'Make sure to sign the message in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )
  const [stateRateTranscription, sendRateTranscription] = useMachine(
    rating.machine({
      id: createUniqueId(),
      value: args?.averageRating ?? 0,
      async onChange({ value }) {
        await mutationGiveRating.mutateAsync({
          idTranscription: args?.id,
          rating: value,
        })
      },
    }),
  )
  const apiRateTranscription = createMemo(() =>
    rating.connect(stateRateTranscription, sendRateTranscription, normalizeProps),
  )
  return {
    mutationWriteContractDeleteTranscription,
    mutationTxWaitDeleteTranscription,
    apiRateTranscription,
    mutationGiveRating,
  }
}

export default useTranscriptionActions
