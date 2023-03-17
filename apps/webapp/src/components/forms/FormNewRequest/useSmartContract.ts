import { getUnixTime } from 'date-fns'
import { createEffect, createMemo, createUniqueId } from 'solid-js'
import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { z } from 'zod'
import * as popover from '@zag-js/popover'
import * as accordion from '@zag-js/accordion'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { useToast } from '~/hooks/useToast'
import { uploadFileToIPFS } from '~/helpers'
import { schema } from './schema'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { uuid } from 'uuidv4'
import { CONTRACT_TRANSCRIPTIONS } from '~/config'
import { ethers } from 'ethers'

interface FormValues extends z.infer<typeof schema> {}

export function useSmartContract() {
  const queryClient = useQueryClient()
  // UI
  const toast = useToast()
  const [statePopover, sendPopover] = useMachine(popover.machine({ id: createUniqueId(), portalled: true }))
  const apiPopoverCreateNewRequestStatus = createMemo(() => popover.connect(statePopover, sendPopover, normalizeProps))
  const [stateAccordion, sendAccordion] = useMachine(accordion.machine({ id: createUniqueId(), collapsible: true }))
  const apiAccordionCreateNewRequestStatus = createMemo(() =>
    accordion.connect(stateAccordion, sendAccordion, normalizeProps),
  )

  // Mutations
  // Metadata file upload
  const mutationUploadMetadata = createMutation(uploadFileToIPFS, {
    onSuccess() {
      if (apiAccordionCreateNewRequestStatus().value !== 'transaction-1')
        apiAccordionCreateNewRequestStatus().setValue('transaction-1') // Open the transaction accordion when the metadata are uploaded successfully
    },
  })
  const mutationWriteContractCreateNewRequest = createMutation(
    //@ts-ignore
    async (args: {
      updatedAt: number
      listCollaborators: Array<string>
      listCommunities: Array<string>
      uriMetadata: string
    }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      /**
       * @TODO - change this once smart contract is updated
       */
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'createRequest',
        /*
            Arguments order: 
              created_at (uint256)
              metadata_uri (string)
        */
        args: [args?.updatedAt, args?.listCollaborators, args?.uriMetadata],
      })
      /**
       * endof todo
       */
      if (apiAccordionCreateNewRequestStatus().value !== 'transaction-1')
        apiAccordionCreateNewRequestStatus().setValue('transaction-1')
      return await writeContract(config)
    },
    {
      onError() {
        toast().create({
          title: "Couldn't create the request !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
      async onSuccess(data: { hash: `0x${string}` }) {
        if (data?.hash) await mutationTxWaitCreateNewRequest.mutateAsync(data.hash)
      },
    },
  )

  const mutationTxWaitCreateNewRequest = createMutation(
    async (hash: `0x${string}`) => {
      return await waitForTransaction({ hash })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Request created successfully!',
          description: 'The request is now visible on the board and ready to accept new propositions.',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        toast().create({
          title: "Couldn't create the request !",
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

  async function prepareData(formValues: any) {
    apiAccordionCreateNewRequestStatus().setValue('file-uploads')

    const uid = uuid()

    /**
     * 1 - Upload metadata to IPFS
     */

    const metadata = {
      // Source
      source_media_uri: formValues?.source_media_uri ?? null,
      source_media_title: formValues?.source_media_title ?? null,
      notes: formValues?.notes,
      // Workflow & contributors
      collaborators: formValues?.collaborators?.toString(),
    }

    let uriMetadata
    if (!mutationUploadMetadata.isSuccess) {
      uriMetadata = await mutationUploadMetadata.mutateAsync(
        { file: JSON.stringify(metadata), key: `request_${uid}_metadata.json` },
        {
          onError(e) {
            console.error(e)
            throw new Error('Something went wrong while uploading the metadata file.')
          },
        },
      )
    } else {
      uriMetadata = mutationUploadMetadata.data
    }

    return {
      uriMetadata,
      updatedAt: getUnixTime(new Date()),
      listCollaborators: formValues?.collaborators ?? [],
      listCommunities: formValues?.communities ?? [],
    }
  }

  async function onSubmitCreateRequestForm(args: { formValues: FormValues }) {
    try {
      /**
       * Prepare data
       */

      const { uriMetadata, updatedAt, listCollaborators } = await prepareData(args?.formValues)

      /**
       * Smart contract interaction
       */
      await mutationWriteContractCreateNewRequest.mutateAsync({
        uriMetadata: uriMetadata as string,
        updatedAt,
        listCollaborators,
      })
    } catch (e) {
      console.error(e)
    }
  }

  createEffect(() => {
    if (
      [
        mutationUploadMetadata.status,
        // Contract interactions
        mutationWriteContractCreateNewRequest.status,
        mutationTxWaitCreateNewRequest.status,
      ].includes('loading') &&
      !apiPopoverCreateNewRequestStatus().isOpen
    ) {
      apiPopoverCreateNewRequestStatus().open()
    }
  })

  return {
    // UI
    apiPopoverCreateNewRequestStatus,
    apiAccordionCreateNewRequestStatus,

    // Uploads
    mutationUploadMetadata,

    // Contract interactions
    mutationWriteContractCreateNewRequest,
    mutationTxWaitCreateNewRequest,

    // Form submit event handlers
    onSubmitCreateRequestForm,
  }
}

export default useSmartContract
