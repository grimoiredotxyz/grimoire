import { fromUnixTime, getUnixTime } from 'date-fns'
import { createEffect, createMemo, createUniqueId, onMount } from 'solid-js'
import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { z } from 'zod'
import * as popover from '@zag-js/popover'
import * as accordion from '@zag-js/accordion'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { useToast } from '~/hooks/useToast'
import { uploadFileToIPFS } from '~/helpers'
import { schema } from './schema'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { v4 as uuid } from 'uuid'
import { ABI_TRANSCRIPTIONS, CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import { utils } from 'ethers'
import { usePolybase } from '~/hooks'

interface FormValues extends z.infer<typeof schema> {}

export function useSmartContract() {
  const queryClient = useQueryClient()
  // DB (polybase)
  const { db } = usePolybase()
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
    async (args: { updatedAt: number; listCollaborators: Array<string>; uriMetadata: string }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'createRequest',
        /*
          Arguments order: 
          created_at (uint256)
          metadata_uri (string)
          collaborators (address[]) 
        */
        args: [args?.updatedAt, args?.uriMetadata, args?.listCollaborators],
      })

      if (apiAccordionCreateNewRequestStatus().value !== 'transaction-1')
        apiAccordionCreateNewRequestStatus().setValue('transaction-1')
      //@ts-ignore
      return await writeContract(config)
    },
    {
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't create the request !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitCreateNewRequest = createMutation(
    async (args: { hash: `0x${string}`; chainAlias: string }) => {
      const data = await waitForTransaction({ hash: args?.hash })
      const iface = new utils.Interface(ABI_TRANSCRIPTIONS)
      const log = data.logs
      const { request_id, created_at, creator, metadata_uri, last_updated_at } = iface.parseLog(log[0]).args

      return {
        txData: data,
        request_id,
        created_at,
        creator,
        metadata_uri,
        last_updated_at,
        chainAlias: args?.chainAlias,
      }
    },
    {
      onError() {
        //@ts-ignore
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

  const mutationIndexRequest = createMutation(
    async (args: {
      id: string
      slug: string
      source_media_title: string
      source_media_uris: string
      language: string
      keywords: string
    }) => {
      const dbCollectionReference = db.collection('Request')

      // Parameters in that order specifically
      // id, slug, source_media_title, source_media_uris, language, keywords
      return await dbCollectionReference.create([
        args?.id,
        args?.slug,
        args?.source_media_title,
        args?.source_media_uris,
        args?.language,
        args?.keywords,
      ])
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Request created and indexed successfully!',
          description: 'The request is now visible on the board and ready to accept new propositions.',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't index this request !",
          description: 'Make sure to sign the message in your wallet.',
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
      source_media_uris:
        formValues?.source_media_uris.constructor === Array
          ? formValues?.source_media_uris?.toString()
          : formValues?.source_media_uris?.length > 0
          ? formValues?.source_media_uris
          : '',
      source_media_title: formValues?.source_media_title ?? '',
      notes: formValues?.notes ?? '',
      language: formValues?.language, // code ; eg: en-GB
      keywords:
        formValues?.keywords.constructor === Array
          ? formValues?.keywords?.toString()
          : formValues?.keywords?.length > 0
          ? formValues?.keywords
          : '',
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
      metadata,
      uriMetadata,
      updatedAt: getUnixTime(new Date()),
      listCollaborators: formValues?.collaborators ?? [],
      listCommunities: formValues?.communities ?? [],
    }
  }

  async function onSubmitCreateRequestForm(args: { formValues: FormValues }) {
    try {
      const network = await getNetwork()
      const chainId = network.chain?.id
      //@ts-ignore
      const chainAlias = CHAINS_ALIAS[chainId]

      /**
       * Prepare data
       */

      const { metadata, uriMetadata, updatedAt, listCollaborators } = await prepareData(args?.formValues)

      /**
       * Smart contract interaction
       */
      const dataWriteContract = await mutationWriteContractCreateNewRequest.mutateAsync({
        uriMetadata: uriMetadata as string,
        updatedAt,
        listCollaborators,
      })

      if (dataWriteContract?.hash) {
        const { request_id, created_at, creator, metadata_uri, last_updated_at } =
          await mutationTxWaitCreateNewRequest.mutateAsync({ hash: dataWriteContract.hash, chainAlias })
        const slug = `${chainAlias}/${request_id}`
        await mutationIndexRequest.mutateAsync({
          id: request_id,
          slug,
          source_media_title: metadata.source_media_title,
          source_media_uris: metadata.source_media_uris,
          language: metadata.language,
          keywords: metadata.keywords,
        })
        queryClient.setQueryData(['transcription', slug], {
          chainId,
          id: request_id,
          request_id,
          created_at,
          creator,
          metadata_uri,
          slug,
          last_updated_at,
          fulfilled: false,
          open_for_transcripts: true,
          created_at_epoch_timestamp: created_at,
          created_at_datetime: fromUnixTime(created_at),
          last_updated_at_epoch_timestamp: last_updated_at,
          last_updated_at_datetime: fromUnixTime(last_updated_at),
          collaborators: args.formValues?.collaborators ?? [],
          source_media_title: metadata.source_media_title,
          source_media_uris: metadata.source_media_uris,
          language: metadata.language,
          keywords: metadata.keywords?.split(','),
          notes: metadata.notes,
          id_linked_transcription: '0x0000000000000000000000000000000000000000000000000000000000000000',
        })
      }
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
        // Index
        mutationIndexRequest.status,
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
    mutationIndexRequest,

    // Form submit event handlers
    onSubmitCreateRequestForm,
  }
}

export default useSmartContract
