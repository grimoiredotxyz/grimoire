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
  const params = useParams<{ chain: string; idTranscript: string }>()
  const queryClient = useQueryClient()
  // UI
  const toast = useToast()
  const [statePopover, sendPopover] = useMachine(popover.machine({ id: createUniqueId(), portalled: true }))
  const apiPopoverProposeNewRevisionStatus = createMemo(() =>
    popover.connect(statePopover, sendPopover, normalizeProps),
  )
  const [stateAccordion, sendAccordion] = useMachine(accordion.machine({ id: createUniqueId(), collapsible: true }))
  const apiAccordionProposeNewRevisionStatus = createMemo(() =>
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
      if (apiAccordionProposeNewRevisionStatus().value !== 'transaction-1')
        apiAccordionProposeNewRevisionStatus().setValue('transaction-1') // Open the transaction accordion when the metadata are uploaded successfully
    },
  })
  const mutationWriteContractProposeNewRevision = createMutation(
    //@ts-ignore
    async (args: { updatedAt: number; idTranscript: string; uriMetadata: string }) => {
      const network = await getNetwork()
      const chainId = network?.chain?.id
      const config = await prepareWriteContract({
        //@ts-ignore
        ...CONTRACT_TRANSCRIPTIONS[chainId],
        functionName: 'proposeRevision',
        /*
            Arguments order: 
            transcript_id (bytes32)
            updated_time (uint256)
            content_uri (string)
        */
        args: [args?.idTranscript, args?.updatedAt, args?.uriMetadata],
      })
      if (apiAccordionProposeNewRevisionStatus().value !== 'transaction-1')
        apiAccordionProposeNewRevisionStatus().setValue('transaction-1')
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
    },
  )

  const mutationTxWaitProposeNewRevision = createMutation(
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
          title: 'Revision created successfully!',
          description: 'Your revision was sent and is ready to be reviewed.',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        toast().create({
          title: "Couldn't create your revision !",
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
    apiAccordionProposeNewRevisionStatus().setValue('file-uploads')

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
      source_media_uris:
        formValues?.source_media_uris.constructor === Array
          ? formValues?.source_media_uris?.toString()
          : formValues?.source_media_uris?.length > 0
          ? formValues?.source_media_uris
          : '',
      source_media_title: formValues?.source_media_title ?? null,
      // About
      title: formValues?.title,
      language: formValues?.language, // code ; eg: en-GB
      keywords:
        formValues?.keywords.constructor === Array
          ? formValues?.keywords?.toString()
          : formValues?.keywords?.length > 0
          ? formValues?.keywords
          : '',
      notes: formValues?.notes,
      // Revision
      transcription_plain_text: formValues?.transcription_plain_text ?? '',
      srt_file_uri: mutationUploadSRTFile?.data ?? null,
      vtt_file_uri: mutationUploadVTTFile?.data ?? null,
      lrc_file_uri: mutationUploadLRCFile?.data ?? null,
      // Workflow & contributors
      revision_must_be_approved_first: formValues?.revision_must_be_approved_first,
      collaborators:
        formValues?.collaborators.constructor === Array
          ? formValues?.collaborators?.toString()
          : formValues?.collaborators?.length > 0
          ? formValues?.collaborators
          : '',
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
      idTranscript: params?.idTranscript?.length > 0 ? params?.idTranscript : utils.formatBytes32String(''),
      metadata,
    }
  }

  async function onSubmitProposeNewRevisionForm(args: { formValues: FormValues }) {
    try {
      const network = await getNetwork()
      const chainId = network.chain?.id
      //@ts-ignore
      const chainAlias = CHAINS_ALIAS[chainId]
      /**
       * Prepare data
       */

      const { metadata, uriMetadata, updatedAt, idTranscript } = await prepareData(args?.formValues)

      /**
       * Smart contract interaction
       */
      const dataWriteContract = await mutationWriteContractProposeNewRevision.mutateAsync({
        uriMetadata: uriMetadata as string,
        updatedAt,
        idTranscript,
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
        } = await mutationTxWaitProposeNewRevision.mutateAsync({ hash: dataWriteContract?.hash, chainAlias })

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
          keywords: metadata.keywords.split(','),
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
        mutationWriteContractProposeNewRevision.status,
        mutationTxWaitProposeNewRevision.status,
      ].includes('loading') &&
      !apiPopoverProposeNewRevisionStatus().isOpen
    ) {
      apiPopoverProposeNewRevisionStatus().open()
    }
  })

  return {
    // UI
    apiPopoverProposeNewRevisionStatus,
    apiAccordionProposeNewRevisionStatus,

    // Uploads
    mutationUploadVTTFile,
    mutationUploadSRTFile,
    mutationUploadLRCFile,
    mutationUploadMetadata,

    // Contract interactions
    mutationWriteContractProposeNewRevision,
    mutationTxWaitProposeNewRevision,

    // Form submit event handlers
    onSubmitProposeNewRevisionForm,
  }
}

export default useSmartContract
