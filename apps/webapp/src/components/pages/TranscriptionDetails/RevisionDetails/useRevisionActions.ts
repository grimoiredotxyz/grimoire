import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, writeContract, waitForTransaction, fetchSigner } from '@wagmi/core'
import { CONTRACT_ATTESTATION_STATION, CONTRACT_TRANSCRIPTIONS } from '~/config'
import { useAuthentication, usePolybase, useToast } from '~/hooks'
import { GelatoRelay, SponsoredCallRequest } from '@gelatonetwork/relay-sdk'
import { ethers } from 'ethers'
import { createEffect } from 'solid-js'
import * as atst from '@eth-optimism/atst'
export function useRevisionActions() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { currentUser } = useAuthentication()
  const mutationWriteAcceptRevision = createMutation(
    //@ts-ignore
    async (args: { idRevision: string; contributorAddress: `0x${string}`; slug: string }) => {
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
        await mutationTxWaitAcceptRevision.mutateAsync({
          idRevision: variables?.idRevision,
          hash: data?.hash,
          contributorAddress: variables.contributorAddress,
          slug: variables.slug,
        })
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
    async (args: { hash: `0x${string}`; idRevision: string; contributorAddress: `0x${string}`; slug: string }) => {
      return await waitForTransaction({ hash: args.hash })
    },
    {
      async onSuccess(data, variables) {
        //@ts-ignore
        toast().create({
          title: 'Revision accepted successfully!',
          type: 'success',
          placement: 'bottom-right',
        })
        await mutationIssueAttestation.mutateAsync({
          contributorAddress: variables.contributorAddress,
          transcriptionSlug: variables.slug,
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

  const mutationIssueAttestation = createMutation(
    async (args: { contributorAddress: `0x${string}`; transcriptionSlug: string }) => {
      // Issue an attestation for the contributor
      // Here we use Gelato's relayer to sponsor the call so the issuer doesn't need gas/to switch chain
      const relay = new GelatoRelay()
      const provider = new ethers.providers.Web3Provider(window?.ethereum)
      const signer = provider.getSigner()
      const AttestationStation = new ethers.Contract(
        CONTRACT_ATTESTATION_STATION[420].address,
        CONTRACT_ATTESTATION_STATION[420].abi,
        signer,
      )
      const attestation = {
        about: args?.contributorAddress,
        key: atst.createKey(args?.transcriptionSlug),
        val: 0x01, // true
      }
      const { data } = await AttestationStation.populateTransaction.attest([attestation])
      const request: SponsoredCallRequest = {
        chainId: 420,
        target: CONTRACT_ATTESTATION_STATION[420].address,
        data: data,
      }
      const { taskId } = await relay.sponsoredCall(request, import.meta.env.VITE_GELATO_1BALANCE_API_KEY)
      toast().create({
        title: 'Issuing attestation for the contributor...',
        placement: 'bottom-right',
      })

      let isRelayed = false
      let txHash
      while (!isRelayed) {
        const response = await fetch(`https://relay.gelato.digital/tasks/status/${taskId}`)
        const result = await response.json()
        if (result?.task?.taskState === 'ExecSuccess') {
          isRelayed = true
          txHash = result?.task?.transactionHash
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      }

      return txHash
    },
    {
      onSuccess(data, variables, context) {
        //@ts-ignore
        toast().create({
          title: 'Attestation issued !',
          description: 'A contribution attestation was issued for this contributor.',
          type: 'error',
          placement: 'bottom-right',
        })
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
    mutationIssueAttestation,
  }
}

export default useRevisionActions
