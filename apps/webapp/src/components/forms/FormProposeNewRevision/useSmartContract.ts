import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { getNetwork, prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import * as accordion from '@zag-js/accordion'
import * as popover from '@zag-js/popover'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { getUnixTime } from 'date-fns'
import { createEffect, createMemo, createUniqueId } from 'solid-js'
import { useParams } from 'solid-start'
import { utils } from 'ethers'
//@ts-ignore
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { ABI_TRANSCRIPTIONS, CHAINS_ALIAS, CONTRACT_TRANSCRIPTIONS } from '~/config'
import { useToast, usePolybase } from '~/hooks'
import { uploadFileToIPFS } from '~/helpers'
import { schema } from './schema'

interface FormValues extends z.infer<typeof schema> {}
export function useSmartContract() {
  // DB
  //@ts-ignore
  const { db } = usePolybase()
  // Route params
  const params = useParams<{ chain: string; idTranscription: string }>()
  // Query client & cache
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
  /**
   * Mutations that handles uploading our various files to IPFS   *
   */
  const mutationUploadVTTFile = createMutation(uploadFileToIPFS)
  const mutationUploadSRTFile = createMutation(uploadFileToIPFS)
  const mutationUploadLRCFile = createMutation(uploadFileToIPFS)

  /**
   * Mutation that handles uploading our metadata (JSON file) to IPFS
   * If it is successful, it opens the "transaction" accordion in the UI
   *
   */
  const mutationUploadMetadata = createMutation(uploadFileToIPFS, {
    onSuccess() {
      if (apiAccordionProposeNewRevisionStatus().value !== 'transaction-1')
        apiAccordionProposeNewRevisionStatus().setValue('transaction-1') // Open the transaction accordion when the metadata are uploaded successfully
    },
  })

  /**
   * Mutation that handles writing a new Revision on chain (proposeRevision function)
   * If it is successful, it triggers the txWait mutation
   */
  const mutationWriteContractProposeNewRevision = createMutation(
    //@ts-ignore
    async (args: { updatedAt: number; idTranscription: string; uriMetadata: string }) => {
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
        args: [args?.idTranscription, args?.updatedAt, args?.uriMetadata],
      })
      if (apiAccordionProposeNewRevisionStatus().value !== 'transaction-1')
        apiAccordionProposeNewRevisionStatus().setValue('transaction-1')
      //@ts-ignore
      return await writeContract(config)
    },
    {
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't create your revision !",
          description: 'Make sure to sign the transaction in your wallet.',
          type: 'error',
          placement: 'bottom-right',
        })
      },
    },
  )
  /**
   * Mutation that handles waiting for an on-chain transaction to be successful (in this case, after calling the proposeRevision function)
   */
  const mutationTxWaitProposeNewRevision = createMutation(
    async (args: { hash: `0x${string}`; chainAlias: string }) => {
      const data = await waitForTransaction({ hash: args.hash })
      const iface = new utils.Interface(ABI_TRANSCRIPTIONS)
      const log = data.logs
      const { id_revision, transcript_id } = iface.parseLog(log[0]).args
      return {
        txData: data,
        id_revision,
        transcript_id,
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
        //@ts-ignore
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
  /**
   * Mutation that handles creating a new `Revision` record on Polybase
   * constructor (id: string, chain_id: number, slug: string, content_uri: string, transcription: Transcription, change_type: string, change_description: string)
   */
  const mutationIndexRevision = createMutation(
    async (args: {
      id: string
      slug: string
      chain_id: number
      content_uri: string
      id_transcription: string
      change_type: string
      change_description: string
    }) => {
      const dbRevisionCollectionReference = db.collection('Revision')
      const dbTranscriptionCollectionReference = db.collection('Transcription')
      const transcriptionReference = dbTranscriptionCollectionReference.record(args?.id_transcription)

      // Parameters in that order specifically
      // id, chain_id, slug, content_uri, transcription, change_type, change_description

      return await dbRevisionCollectionReference.create([
        args?.id,
        args?.chain_id,
        args?.slug,
        args?.content_uri,
        transcriptionReference,
        args?.change_type,
        args?.change_description,
      ])
    },
    {
      onSuccess() {
        //@ts-ignore
        toast().create({
          title: 'Revision created and indexed successfully!',
          description: 'The revision is now ready to be reviewed.',
          type: 'success',
          placement: 'bottom-right',
        })
      },
      onError() {
        //@ts-ignore
        toast().create({
          title: "Couldn't index this revision !",
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

  /**
   * - Upload files to IPFS
   * - Returns data required by the smart contract to create a new revision on chain
   * @param formValues: FormValues
   */

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
      // Helpful for our subgraph
      type: 'REVISION',
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
      // Revision
      change_type: formValues?.change_type?.toString(),
      change_description: formValues?.change_description,
      transcription_plain_text: formValues?.transcription_plain_text ?? '',
      srt_file_uri: mutationUploadSRTFile?.data ?? '',
      vtt_file_uri: mutationUploadVTTFile?.data ?? '',
      lrc_file_uri: mutationUploadLRCFile?.data ?? '',
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
      idTranscription: params?.idTranscription,
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

      const { metadata, uriMetadata, updatedAt, idTranscription } = await prepareData(args?.formValues)

      /**
       * Smart contract interaction
       */
      const dataWriteContract = await mutationWriteContractProposeNewRevision.mutateAsync({
        uriMetadata: uriMetadata as string,
        updatedAt,
        idTranscription,
      })

      if (dataWriteContract?.hash) {
        const { id_revision } = await mutationTxWaitProposeNewRevision.mutateAsync({
          hash: dataWriteContract?.hash,
          chainAlias,
        })
        const slug = `${chainAlias}/${idTranscription}/${id_revision}`

        // Index action
        await mutationIndexRevision.mutateAsync({
          id: id_revision,
          chain_id: chainId as number,
          slug,
          content_uri: uriMetadata,
          id_transcription: idTranscription,
          change_type: metadata.change_type,
          change_description: metadata.change_description,
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

    // Indexing
    mutationIndexRevision,
    // Form submit event handlers
    onSubmitProposeNewRevisionForm,
  }
}

export default useSmartContract
