import { useParams } from 'solid-start'
import { fromUnixTime, getUnixTime } from 'date-fns'
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
//@ts-ignore
import { v4 as uuid } from 'uuid'
import { ABI_TRANSCRIPTIONS, CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import { utils } from 'ethers'

interface FormValues extends z.infer<typeof schema> {}

export function useSmartContract() {
  // Route params
  const params = useParams<{ chain: string; idRequest: string }>()
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
      //@ts-ignore
      return await writeContract(config)
    },
    {
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't create your transcription !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )

  const mutationTxWaitCreateNewTranscription = createMutation(
    async (args: { hash: `0x${string}`; chainAlias: string }) => {
      const data = await waitForTransaction({ hash: args.hash })
      const iface = new utils.Interface(ABI_TRANSCRIPTIONS)
      const log = data.logs
      const {
        transcription_id,
        created_at,
        last_updated_at,
        creator,
        contributors,
        revision_metadata_uris,
        metadata_uri,
        id_request,
        communities,
      } = iface.parseLog(log[0]).args
      return {
        txData: data,
        transcription_id,
        created_at,
        last_updated_at,
        creator,
        contributors,
        revision_metadata_uris,
        metadata_uri,
        id_request,
        communities,
        chainAlias: args?.chainAlias,
      }
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
        //@ts-ignore
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
      // Helpful for our subgraph
      type: 'TRANSCRIPTION',

      // Source
      source_media_uris:
        formValues?.source_media_uris.constructor === Array
          ? formValues?.source_media_uris?.toString()
          : formValues?.source_media_uris?.length > 0
          ? formValues?.source_media_uris
          : '',
      source_media_title: formValues?.source_media_title ?? '',
      // About
      title: formValues?.title ?? '',
      language: formValues?.language, // code ; eg: en-GB
      keywords:
        formValues?.keywords.constructor === Array
          ? formValues?.keywords?.toString()
          : formValues?.keywords?.length > 0
          ? formValues?.keywords
          : '',
      notes: formValues?.notes ?? '',
      // Transcription
      transcription_plain_text: formValues?.transcription_plain_text ?? '',
      srt_file_uri: mutationUploadSRTFile?.data ?? '',
      vtt_file_uri: mutationUploadVTTFile?.data ?? '',
      lrc_file_uri: mutationUploadLRCFile?.data ?? '',
    }
    let uriMetadata = ''
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
      listCollaborators:
        formValues?.collaborators.constructor !== Array
          ? [...formValues?.collaborators?.split(',')]
          : formValues?.collaborators?.length > 0
          ? formValues?.collaborators
          : [],
      listCommunities:
        formValues?.communities.constructor !== Array
          ? [...formValues?.communities?.split(',')]
          : formValues?.communities?.length > 0
          ? formValues?.communities
          : [],
      idRequest: params?.idRequest?.length > 0 ? params?.idRequest : utils.formatBytes32String(''),
      metadata: {},
    }
  }

  async function onSubmitCreateTranscriptionForm(args: { formValues: FormValues }) {
    try {
      const network = await getNetwork()
      const chainId = network.chain?.id
      //@ts-ignore
      const chainAlias = CHAINS_ALIAS[chainId]
      /**
       * Prepare data
       */

      const { metadata, uriMetadata, updatedAt, listCollaborators, listCommunities, idRequest } = await prepareData(
        args?.formValues,
      )

      /**
       * Smart contract interaction
       */
      const dataWriteContract = await mutationWriteContractCreateNewTranscription.mutateAsync({
        uriMetadata: uriMetadata as string,
        updatedAt,
        listCollaborators,
        listCommunities,
        idRequest,
      })

      if (dataWriteContract?.hash) {
        const {
          transcription_id,
          created_at,
          last_updated_at,
          creator,
          contributors,
          revision_metadata_uris,
          metadata_uri,
          id_request,
          communities,
        } = await mutationTxWaitCreateNewTranscription.mutateAsync({ hash: dataWriteContract?.hash, chainAlias })

        const slug = `${chainAlias}/${transcription_id}`
        queryClient.setQueryData(['transcription', slug], {
          chainId,
          id: transcription_id,
          transcription_id,
          communities,
          contributors,
          created_at,
          creator,
          id_request,
          last_updated_at,
          metadata_uri,
          revision_metadata_uris,
          slug,
          created_at_epoch_timestamp: created_at,
          created_at_datetime: fromUnixTime(created_at),
          last_updated_at_epoch_timestamp: last_updated_at,
          last_updated_at_datetime: fromUnixTime(last_updated_at),
          keywords: metadata?.keywords?.split(','),
          language: metadata.language,
          lrc_file_uri: metadata.lrc_file_uri,
          notes: metadata.notes,
          revision_must_be_approved_first: metadata.revision_must_be_approved_first,
          source_media_title: metadata.source_media_title,
          source_media_uris: metadata.source_media_uris,
          srt_file_uri: metadata.srt_file_uri,
          title: metadata.title,
          transcription_plain_text: metadata.transcription_plain_text,
          vtt_file_uri: metadata.vtt_file_uri,
        })
      }
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
