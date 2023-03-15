import { createEffect, createMemo, createUniqueId } from 'solid-js'
import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { z } from 'zod'
import * as popover from '@zag-js/popover'
import * as accordion from '@zag-js/accordion'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { useToast } from '~/hooks/useToast'
import { uploadFileToIPFS } from '~/helpers'
import { schema } from './schema'

interface FormValues extends z.infer<typeof schema> {}

export function useSmartContract() {
  const queryClient = useQueryClient()
  // UI
  const toast = useToast()
  const [statePopover, sendPopover] = useMachine(popover.machine({ id: createUniqueId(), portalled: true }))
  const apiPopoverCreateNewTranscriptionStatus = createMemo(() => popover.connect(statePopover, sendPopover, normalizeProps))
  const [stateAccordion, sendAccordion] = useMachine(accordion.machine({ id: createUniqueId(), collapsible: true }))
  const apiAccordionCreateNewTranscriptionStatus = createMemo(() => accordion.connect(stateAccordion, sendAccordion, normalizeProps))

  // Mutations
  // File uploads
  const mutationUploadVTTFile = createMutation(uploadFileToIPFS)
  const mutationUploadSRTFile = createMutation(uploadFileToIPFS)
  const mutationUploadLRCFile = createMutation(uploadFileToIPFS)

  // Metadata file upload
  const mutationUploadMetadata = createMutation(uploadFileToIPFS, {
    onSuccess() {
      apiAccordionCreateNewTranscriptionStatus().setValue('transaction-1') // Open the transaction accordion when the metadata are uploaded successfully
    },
  })
  const mutationWriteContractCreateNewTranscription = createMutation(
    async (args: { uriMetadata: string }) => {
      try {
        return {

        }
      } catch (e) {
        console.error(e)
      }
    },
    {
      async onSuccess(data: { taskId: string }) {
        await mutationTxWaitCreateNewTranscription.mutateAsync(data?.taskId)
      },
    },
  )

  const mutationTxWaitCreateNewTranscription = createMutation(
    async (id: string) => {
      try {
        // ...         
      } catch (e) {
        console.error(e)
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
    const promises = []
    // SRT file (captions for video)
    if(formValues?.srt_file && !mutationUploadSRTFile.isSuccess){
        promises.push(mutationUploadSRTFile.mutateAsync({file: formValues?.srt_file, key: `${formValues?.srt_file?.name}`}))
    }
    // VTT file (captions for video)
    if(formValues?.vtt_file && !mutationUploadVTTFile.isSuccess){
        promises.push(mutationUploadVTTFile.mutateAsync({file:formValues?.vtt_file, key:`${formValues?.vtt_file?.name}`}))
    }
    // LRC file (captions for audio)
    if(formValues?.lrc_file && !mutationUploadLRCFile.isSuccess){
        promises.push(mutationUploadLRCFile.mutateAsync({file: formValues?.lrc_file, key: `${formValues?.lrc_file?.name}`}))
    }
    await Promise.all(promises)

    /**
     * 2 - Upload metadata to IPFS
     */
    /*
    const metadata = {
        title: formValues?.title,
        tags: formValues?.tags,
        reference_source_media: formValues?.reference_source_media, // eg: ethereum/<contract-address>/<id> ; /tweet/<tweet-id>
        source_media_metadata_uri: formValues?.source_media_metadata_uri,
        language: formValues?.language, // code ; eg: en-GB
        transcription: formValues?.transcription,
        srt_file_uri: mutationUploadSRTFile?.data ?? null,
        vtt_file_uri: mutationUploadVTTFile?.data ?? null,
        lrc_file_uri: mutationUploadLRCFile?.data ?? null,
    }

    let uriMetadata
    if (!mutationUploadMetadata.isSuccess) {
      uriMetadata = await mutationUploadMetadata.mutateAsync({file: JSON.stringify(metadata), key: ''})
    } else {
      uriMetadata = mutationUploadMetadata.data
    }
*/
    return {
      uriMetadata: "",
    }
  }

  async function onSubmitCreateTranscriptionForm(args: { formValues: FormValues }) {
    try {
      /**
       * Prepare data
       */
      const { uriMetadata } = await prepareData(args?.formValues)
      /**
       * Smart contract interaction
       */
     // await mutationWriteContractCreateNewTranscription.mutateAsync({
     //   // idOriginalVersion: args?.formValues?.id_original_song,
     //   uriMetadata: uriMetadata as string,
     // })
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
    )
      apiPopoverCreateNewTranscriptionStatus().open()
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
