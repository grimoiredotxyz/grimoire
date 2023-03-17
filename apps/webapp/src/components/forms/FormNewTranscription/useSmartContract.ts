import { useSearchParams } from 'solid-start'
import { getUnixTime } from 'date-fns'
import { createEffect, createMemo, createUniqueId, onError } from 'solid-js'
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
import { ABI_TRANSCRIPTIONS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import { ethers } from 'ethers'
import { api } from '@zag-js/toast'

interface FormValues extends z.infer<typeof schema> {}

export function useSmartContract() {
  // Route params
  const [searchParams] = useSearchParams() // Tanstack query client
  const queryClient = useQueryClient()
  // UI
  const toast = useToast()
  const [statePopover, sendPopover] = useMachine(popover.machine({ id: createUniqueId(), portalled: true }))
  const apiPopoverCreateNewTranscriptionStatus = createMemo(() =>
    popover.connect(statePopover, sendPopover, normalizeProps),
  )
  const [stateAccordion, sendAccordion] = useMachine(accordion.machine({ id: createUniqueId(), collapsible: true }))
  const apiAccordionCreateNewTranscriptionStatus = createMemo(() =>
    accordion.connect(stateAccordion, sendAccordion, normalizeProps),
  )

  // Mutations
  // File uploads
  const mutationUploadVTTFile = createMutation(uploadFileToIPFS)
  const mutationUploadSRTFile = createMutation(uploadFileToIPFS)
  const mutationUploadLRCFile = createMutation(uploadFileToIPFS)

  // Metadata file upload
  const mutationUploadMetadata = createMutation(uploadFileToIPFS, {
    onSuccess() {
      if (apiAccordionCreateNewTranscriptionStatus().value !== 'transaction-1')
        apiAccordionCreateNewTranscriptionStatus().setValue('transaction-1') // Open the transaction accordion when the metadata are uploaded successfully
    },
  })
  const mutationWriteContractCreateNewTranscription = createMutation(
    //@ts-ignore
    async (args: {
      updatedAt: number
      listCollaborators: Array<string>
      listCommunities: Array<string>
      idRequest: null | string
      uriMetadata: string
    }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'createTranscription',
        /*
            Arguments order: 
          created_at (uint256)
          contributors (address[])
          metadata_uri (string)
          id_request (bytes32)
          communities (string[])
          */
        args: [args?.updatedAt, args?.listCollaborators, args?.uriMetadata, args?.idRequest, args?.listCommunities],
      })
      if (apiAccordionCreateNewTranscriptionStatus().value !== 'transaction-1')
        apiAccordionCreateNewTranscriptionStatus().setValue('transaction-1')
      return await writeContract(config)
    },
    {
      onError() {
        toast().create({
          title: "Couldn't create your transcription !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
      async onSuccess(data: { hash: `0x${string}` }) {
        if (data?.hash) await mutationTxWaitCreateNewTranscription.mutateAsync(data.hash)
      },
    },
  )

  const mutationTxWaitCreateNewTranscription = createMutation(
    async (hash: `0x${string}`) => {
      return await waitForTransaction({ hash })
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Transcription created successfully!',
          description: 'Your transcription is ready to be used.',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        toast().create({
          title: "Couldn't create your transcription !",
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
    apiAccordionCreateNewTranscriptionStatus().setValue('file-uploads')

    /**
     * 1 - Upload assets to IPFS
     */

    const uid = uuid()
    const promises = []
    // SRT file (captions for video)
    if (formValues?.srt_file && !mutationUploadSRTFile.isSuccess) {
      promises.push(
        mutationUploadSRTFile.mutateAsync(
          { file: formValues?.srt_file, key: `${uid}_${formValues?.srt_file?.name}` },
          {
            onError(e) {
              console.error(e)
              throw new Error('Something went wrong while uploading the .srt file.')
            },
          },
        ),
      )
    }
    // VTT file (captions for video)
    if (formValues?.vtt_file && !mutationUploadVTTFile.isSuccess) {
      promises.push(
        mutationUploadVTTFile.mutateAsync(
          { file: formValues?.vtt_file, key: `${uid}_${formValues?.vtt_file?.name}` },
          {
            onError(e) {
              console.error(e)
              throw new Error('Something went wrong while uploading the .vtt file.')
            },
          },
        ),
      )
    }
    // LRC file (captions for audio)
    if (formValues?.lrc_file && !mutationUploadLRCFile.isSuccess) {
      promises.push(
        mutationUploadLRCFile.mutateAsync(
          { file: formValues?.lrc_file, key: `${uid}_${formValues?.lrc_file?.name}` },
          {
            onError(e) {
              console.error(e)
              throw new Error('Something went wrong while uploading the .lrc file.')
            },
          },
        ),
      )
    }
    await Promise.all(promises)

    /**
     * 2 - Upload metadata to IPFS
     */

    const metadata = {
      // Source
      source_media_uri: formValues?.source_media_uri ?? null,
      source_media_title: formValues?.source_media_title ?? null,
      // About
      title: formValues?.title,
      language: formValues?.language, // code ; eg: en-GB
      keywords: formValues?.keywords,
      notes: formValues?.notes,
      // Transcription
      transcription_plain_text: formValues?.transcription_plain_text ?? '',
      srt_file_uri: mutationUploadSRTFile?.data ?? null,
      vtt_file_uri: mutationUploadVTTFile?.data ?? null,
      lrc_file_uri: mutationUploadLRCFile?.data ?? null,
      // Workflow & contributors
      revision_must_be_approved_first: formValues?.revision_must_be_approved_first,
      collaborators: formValues?.collaborators?.toString(),
    }

    let uriMetadata
    if (!mutationUploadMetadata.isSuccess) {
      uriMetadata = await mutationUploadMetadata.mutateAsync(
        { file: JSON.stringify(metadata), key: `${uid}_metadata.json` },
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
      idRequest: searchParams?.idRequest ?? ethers.utils.formatBytes32String(''),
    }
  }

  async function onSubmitCreateTranscriptionForm(args: { formValues: FormValues }) {
    try {
      /**
       * Prepare data
       */

      const { uriMetadata, updatedAt, listCollaborators, listCommunities, idRequest } = await prepareData(
        args?.formValues,
      )

      /**
       * Smart contract interaction
       */
      await mutationWriteContractCreateNewTranscription.mutateAsync({
        uriMetadata: uriMetadata as string,
        updatedAt,
        listCollaborators,
        listCommunities,
        idRequest,
      })
    } catch (e) {
      console.error(e)
    }
  }

  createEffect(() => {
    if (
      [
        mutationUploadVTTFile.status,
        mutationUploadSRTFile.status,
        mutationUploadLRCFile.status,
        mutationUploadMetadata.status,
        // Contract interactions
        mutationWriteContractCreateNewTranscription.status,
        mutationTxWaitCreateNewTranscription.status,
      ].includes('loading') &&
      !apiPopoverCreateNewTranscriptionStatus().isOpen
    ) {
      apiPopoverCreateNewTranscriptionStatus().open()
    }
  })

  return {
    // UI
    apiPopoverCreateNewTranscriptionStatus,
    apiAccordionCreateNewTranscriptionStatus,

    // Uploads
    mutationUploadVTTFile,
    mutationUploadSRTFile,
    mutationUploadLRCFile,
    mutationUploadMetadata,

    // Contract interactions
    mutationWriteContractCreateNewTranscription,
    mutationTxWaitCreateNewTranscription,

    // Form submit event handlers
    onSubmitCreateTranscriptionForm,
  }
}

export default useSmartContract
