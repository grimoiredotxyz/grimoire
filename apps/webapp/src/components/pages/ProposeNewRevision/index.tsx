import { z } from 'zod'
import { Match, Show, Switch } from 'solid-js'
import { web3UriToUrl } from '~/helpers'
import { IconCheck, IconDoubleChevronDown, IconError, IconExternal, IconSpinner } from '~/ui'
import { FormProposeNewRevision, useForm, schema, useSmartContract } from '~/components/forms/FormProposeNewRevision'
import { ROUTE_TRANSCRIPTION_DETAILS } from '~/config'
import { A } from 'solid-start'
import type { Transcription } from '~/services'
import type { Accessor } from 'solid-js'

interface ProposeNewRevisionProps {
  transcription: Accessor<Transcription>
}

export const ProposeNewRevision = (props: ProposeNewRevisionProps) => {
  const {
    apiPopoverProposeNewRevisionStatus,
    apiAccordionProposeNewRevisionStatus,
    // Uploads
    mutationUploadVTTFile,
    mutationUploadLRCFile,
    mutationUploadSRTFile,
    mutationUploadMetadata,
    // Contract interactions
    mutationWriteContractProposeNewRevision,
    mutationTxWaitProposeNewRevision,
    // Form submit event handlers
    onSubmitProposeNewRevisionForm,
  } = useSmartContract()

  const { formProposeNewRevision, stateMachineAccordion, stateMachineTabs } = useForm({
    //@ts-ignore
    initialValues: {
      id_original_transcription: props.transcription().transcription_id,
      source_media_title: props?.transcription().source_media_title ?? '',
      source_media_uris:
        props?.transcription()?.source_media_uris?.length > 0
          ? props?.transcription()?.source_media_uris.toString()
          : '',
      notes: props.transcription()?.notes,
      language: props.transcription().language as string,
      keywords: props.transcription()?.keywords?.length > 0 ? props?.transcription()?.keywords.toString() : '',
      title: props.transcription().title as string,
      transcription_plain_text: props.transcription().transcription_plain_text as string,
      srt_uri: props.transcription().srt_file_uri as string,
      vtt_uri: props.transcription().vtt_file_uri as string,
      lrc_uri: props.transcription().lrc_file_uri as string,
      change_description: '',
    },
    onSubmit: (values: z.infer<typeof schema>) => {
      onSubmitProposeNewRevisionForm({
        formValues: values,
      })
    },
  })

  return (
    <>
      <div class="w-full max-w-prose mx-auto">
        <h1 class="text-lg text-accent-12 font-serif font-bold">Propose your revision</h1>
        <div class="space-y-1 text-xs mt-2 mb-4 text-neutral-11 font-medium">
          <p>
            Once submitted, your revision will be reviewed by the initial creator of this transcription or one of their
            collaborators.
          </p>
        </div>
        <FormProposeNewRevision
          apiTabs={stateMachineTabs}
          apiAccordion={stateMachineAccordion}
          storeForm={formProposeNewRevision}
          isError={[
            mutationTxWaitProposeNewRevision.isError,
            mutationWriteContractProposeNewRevision.isError,
            mutationUploadLRCFile.isError,
            mutationUploadSRTFile.isError,
            mutationUploadVTTFile.isError,
            mutationUploadMetadata.isError,
          ].includes(true)}
          isLoading={[
            mutationTxWaitProposeNewRevision.isLoading,
            mutationWriteContractProposeNewRevision.isLoading,
            mutationUploadLRCFile.isLoading,
            mutationUploadSRTFile.isLoading,
            mutationUploadVTTFile.isLoading,
            mutationUploadMetadata.isLoading,
          ].includes(true)}
          isSuccess={
            ![mutationTxWaitProposeNewRevision.isSuccess, mutationWriteContractProposeNewRevision.isSuccess].includes(
              false,
            )
          }
        />
        <Show
          when={
            ['success', 'loading', 'error'].includes(mutationTxWaitProposeNewRevision.status) ||
            ['success', 'loading', 'error'].includes(mutationWriteContractProposeNewRevision.status) ||
            ['success', 'loading', 'error'].includes(mutationUploadVTTFile.status) ||
            ['success', 'loading', 'error'].includes(mutationUploadSRTFile.status) ||
            ['success', 'loading', 'error'].includes(mutationUploadLRCFile.status) ||
            ['success', 'loading', 'error'].includes(mutationUploadMetadata.status)
          }
        >
          <div class="fixed w-full pointer-events-none z-50 pb-16 bottom-0 inline-start-0 flex">
            <div class="w-full mx-auto flex justify-center">
              <div class="relative h-fit-content">
                <button
                  classList={{
                    'shadow-md rounded-2xl md:rounded-t-none border-accent-9':
                      !apiPopoverProposeNewRevisionStatus()?.isOpen,
                    'shadow-xl rounded-2xl md:rounded-t-none border-accent-11 border-opacity-75':
                      apiPopoverProposeNewRevisionStatus()?.isOpen,
                  }}
                  class="pointer-events-auto bg-accent-12 text-accent-1 hover:bg-neutral-12 hover:text-accent-1 focus:ring-2 border relative flex items-center font-semibold text-2xs px-5 py-1.5"
                  {...apiPopoverProposeNewRevisionStatus().triggerProps}
                >
                  <Switch fallback="Propose new revision">
                    <Match
                      when={[
                        mutationTxWaitProposeNewRevision.isLoading,
                        mutationWriteContractProposeNewRevision.isLoading,
                        mutationUploadMetadata.isLoading,
                        mutationUploadVTTFile.isLoading,
                        mutationUploadSRTFile.isLoading,
                        mutationUploadLRCFile.isLoading,
                      ].includes(true)}
                    >
                      <IconSpinner class="animate-spin w-5 h-5 mie-1ex" /> Sending new revision...
                    </Match>
                    <Match
                      when={
                        ![
                          mutationTxWaitProposeNewRevision.isSuccess,
                          mutationWriteContractProposeNewRevision.isSuccess,
                        ].includes(false)
                      }
                    >
                      <IconCheck class="w-5 h-5 mie-1ex" /> Revision sent !
                    </Match>
                  </Switch>
                </button>
                <div
                  {...apiPopoverProposeNewRevisionStatus().positionerProps}
                  class="absolute pointer-events-auto w-full min-w-[unset] top-0 inline-start-0"
                >
                  <div
                    {...apiPopoverProposeNewRevisionStatus().contentProps}
                    class="bg-accent-12 border  border-accent-5 w-full rounded-xl md:rounded-t-0 shadow-2xl"
                  >
                    <div class="sr-only" {...apiPopoverProposeNewRevisionStatus().titleProps}>
                      Propose new transcription
                    </div>
                    <div class="sr-only" {...apiPopoverProposeNewRevisionStatus().descriptionProps}>
                      You can check the status of your different file uploads and other required interactions below.
                    </div>
                    <div
                      class="border-t divide-y divide-accent-11 divide-opacity-50 border-accent-7"
                      {...apiAccordionProposeNewRevisionStatus().rootProps}
                    >
                      <div {...apiAccordionProposeNewRevisionStatus().getItemProps({ value: 'file-uploads' })}>
                        <h3>
                          <button
                            class="w-full font-semibold flex justify-between text-start text-accent-6 text-[0.85rem] p-2"
                            {...apiAccordionProposeNewRevisionStatus().getTriggerProps({
                              value: 'file-uploads',
                            })}
                          >
                            <Switch>
                              <Match
                                when={[
                                  mutationUploadMetadata.isLoading,
                                  mutationUploadVTTFile.isLoading,
                                  mutationUploadLRCFile.isLoading,
                                  mutationUploadSRTFile.isLoading,
                                ].includes(true)}
                              >
                                <IconSpinner class="animate-spin w-5 h-5 mie-1ex" />
                              </Match>
                              <Match when={mutationUploadMetadata.isSuccess}>
                                <IconCheck class="w-5 h-5 mie-1ex" />
                              </Match>
                            </Switch>
                            File uploads{' '}
                            <IconDoubleChevronDown
                              classList={{
                                'rotate-180': apiAccordionProposeNewRevisionStatus()?.value === 'file-uploads',
                              }}
                              class="text-accent-6 w-5 h-5 pis-1ex"
                            />
                          </button>
                        </h3>
                        <div
                          {...apiAccordionProposeNewRevisionStatus().getContentProps({
                            value: 'file-uploads',
                          })}
                        >
                          <ul class="pb-2 text-2xs space-y-1 px-2">
                            <Show when={formProposeNewRevision.data().srt_file?.name}>
                              <li
                                classList={{
                                  'text-accent-8': mutationUploadSRTFile?.isIdle,
                                  'animate-pulse font-bold': mutationUploadSRTFile?.isLoading,
                                  'text-accent-7': !mutationUploadSRTFile?.isIdle,
                                }}
                                class="flex items-center"
                              >
                                <Switch>
                                  <Match when={mutationUploadSRTFile?.isError}>
                                    <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                  </Match>

                                  <Match when={mutationUploadSRTFile?.isSuccess}>
                                    <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                  </Match>
                                  <Match when={mutationUploadSRTFile?.isLoading}>
                                    <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                  </Match>
                                </Switch>
                                <span>
                                  <span>SRT file:&nbsp;</span>
                                  <span>{mutationUploadSRTFile.status}</span>
                                </span>
                                <Show when={mutationUploadSRTFile?.isSuccess && mutationUploadSRTFile?.data}>
                                  <a
                                    class="block link text-[0.75rem]"
                                    rel="noreferrer nofollow"
                                    href={web3UriToUrl(mutationUploadSRTFile?.data as string)}
                                    target="_blank"
                                  >
                                    <span class="sr-only">View hosted file</span>{' '}
                                    <IconExternal class="w-4 h-4 pis-1ex" />
                                  </a>
                                </Show>
                              </li>
                            </Show>
                            <Show when={formProposeNewRevision.data().vtt_file?.name}>
                              <li
                                classList={{
                                  'text-accent-8': mutationUploadVTTFile?.isIdle,
                                  'animate-pulse font-bold': mutationUploadVTTFile?.isLoading,
                                  'text-accent-7': !mutationUploadVTTFile?.isIdle,
                                }}
                                class="flex items-center"
                              >
                                <Switch>
                                  <Match when={mutationUploadVTTFile?.isError}>
                                    <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                  </Match>

                                  <Match when={mutationUploadVTTFile?.isSuccess}>
                                    <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                  </Match>
                                  <Match when={mutationUploadVTTFile?.isLoading}>
                                    <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                  </Match>
                                </Switch>
                                <span>
                                  <span>VTT file:&nbsp;</span>
                                  <span>{mutationUploadVTTFile.status}</span>
                                </span>
                                <Show when={mutationUploadVTTFile?.isSuccess && mutationUploadVTTFile?.data}>
                                  <a
                                    class="block link text-[0.75rem]"
                                    rel="noreferrer nofollow"
                                    href={web3UriToUrl(mutationUploadVTTFile?.data as string)}
                                    target="_blank"
                                  >
                                    <span class="sr-only">View hosted file</span>{' '}
                                    <IconExternal class="w-4 h-4 pis-1ex" />
                                  </a>
                                </Show>
                              </li>
                            </Show>
                            <Show when={formProposeNewRevision.data().lrc_file?.name}>
                              <li
                                classList={{
                                  'text-accent-8': mutationUploadLRCFile?.isIdle,
                                  'animate-pulse font-bold': mutationUploadLRCFile?.isLoading,
                                  'text-accent-7': !mutationUploadLRCFile?.isIdle,
                                }}
                                class="flex items-center"
                              >
                                <Switch>
                                  <Match when={mutationUploadLRCFile?.isError}>
                                    <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                  </Match>

                                  <Match when={mutationUploadLRCFile?.isSuccess}>
                                    <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                  </Match>
                                  <Match when={mutationUploadLRCFile?.isLoading}>
                                    <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                  </Match>
                                </Switch>
                                <span>
                                  <span>LRC file:&nbsp;</span>
                                  <span>{mutationUploadLRCFile.status}</span>
                                </span>
                                <Show when={mutationUploadLRCFile?.isSuccess && mutationUploadLRCFile?.data}>
                                  <a
                                    class="block link text-[0.75rem]"
                                    rel="noreferrer nofollow"
                                    href={web3UriToUrl(mutationUploadLRCFile?.data as string)}
                                    target="_blank"
                                  >
                                    <span class="sr-only">View hosted file</span>{' '}
                                    <IconExternal class="w-4 h-4 pis-1ex" />
                                  </a>
                                </Show>
                              </li>
                            </Show>

                            <li
                              classList={{
                                'text-accent-8': mutationUploadMetadata?.isIdle,
                                'animate-pulse font-bold': mutationUploadMetadata?.isLoading,
                                'text-accent-7': !mutationUploadMetadata?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationUploadMetadata?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationUploadMetadata?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationUploadMetadata?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>
                              <span>
                                <span>Metadata:&nbsp;</span>
                                <span>{mutationUploadMetadata.status}</span>
                              </span>
                              <Show when={mutationUploadMetadata?.isSuccess && mutationUploadMetadata?.data}>
                                <a
                                  class="block link text-[0.75rem]"
                                  rel="noreferrer nofollow"
                                  href={web3UriToUrl(mutationUploadMetadata?.data as string)}
                                  target="_blank"
                                >
                                  <span class="sr-only">View hosted file</span> <IconExternal class="w-4 h-4 pis-1ex" />
                                </a>
                              </Show>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div {...apiAccordionProposeNewRevisionStatus().getItemProps({ value: 'transaction-1' })}>
                        <h3>
                          <button
                            class="w-full font-semibold flex justify-between text-start text-accent-6 text-[0.85rem] p-2"
                            {...apiAccordionProposeNewRevisionStatus().getTriggerProps({
                              value: 'transaction-1',
                            })}
                          >
                            <Switch>
                              <Match
                                when={[
                                  mutationWriteContractProposeNewRevision.isLoading,
                                  mutationTxWaitProposeNewRevision.isLoading,
                                ].includes(true)}
                              >
                                <IconSpinner class="animate-spin w-5 h-5 mie-1ex" />
                              </Match>
                              <Match
                                when={
                                  ![
                                    mutationWriteContractProposeNewRevision.isSuccess,
                                    mutationTxWaitProposeNewRevision.isSuccess,
                                  ].includes(false)
                                }
                              >
                                <IconCheck class="w-5 h-5 mie-1ex" />
                              </Match>
                            </Switch>
                            On-chain interactions{' '}
                            <IconDoubleChevronDown
                              classList={{
                                'rotate-180': apiAccordionProposeNewRevisionStatus()?.value === 'transaction-1',
                              }}
                              class="text-accent-6 w-5 h-5 pis-1ex"
                            />
                          </button>
                        </h3>
                        <div
                          {...apiAccordionProposeNewRevisionStatus().getContentProps({
                            value: 'transaction-1',
                          })}
                        >
                          <ol class="pb-2 text-2xs px-2 space-y-1">
                            <li
                              classList={{
                                'text-accent-8': mutationWriteContractProposeNewRevision?.isIdle,
                                'animate-pulse font-bold': mutationWriteContractProposeNewRevision?.isLoading,
                                'text-accent-7': !mutationWriteContractProposeNewRevision?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationWriteContractProposeNewRevision?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationWriteContractProposeNewRevision?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationWriteContractProposeNewRevision?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>

                              <Switch>
                                <Match when={mutationWriteContractProposeNewRevision.status !== 'loading'}>
                                  <span>
                                    <span>Sign transaction &nbsp;</span>

                                    <Show
                                      when={['success', 'error'].includes(
                                        mutationWriteContractProposeNewRevision.status,
                                      )}
                                    >
                                      <span>{mutationWriteContractProposeNewRevision.status}</span>
                                    </Show>
                                  </span>
                                </Match>

                                <Match when={mutationWriteContractProposeNewRevision.status === 'loading'}>
                                  <span>Please, sign transaction in your wallet...</span>
                                </Match>
                              </Switch>
                            </li>
                            <li
                              classList={{
                                'text-accent-8': mutationTxWaitProposeNewRevision?.isIdle,
                                'animate-pulse font-bold': mutationTxWaitProposeNewRevision?.isLoading,
                                'text-accent-7': !mutationTxWaitProposeNewRevision?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationTxWaitProposeNewRevision?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationTxWaitProposeNewRevision?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationTxWaitProposeNewRevision?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>
                              <span>
                                <span>Transaction status:&nbsp;</span>{' '}
                                <span>{mutationTxWaitProposeNewRevision.status}</span>
                              </span>
                            </li>
                          </ol>
                        </div>
                        <div class="pb-0.5 border-t border-accent-11 border-opacity-50">
                          <div class="px-2">
                            <Switch>
                              <Match
                                when={[
                                  mutationTxWaitProposeNewRevision?.status,
                                  mutationWriteContractProposeNewRevision.status,
                                  mutationUploadLRCFile.status,
                                  mutationUploadSRTFile.status,
                                  mutationUploadMetadata.status,
                                  mutationUploadVTTFile.status,
                                ].includes('error')}
                              >
                                <div class="mb-4 rounded-md text-2xs p-3 text-negative-11 border border-negative-5 bg-negative-3">
                                  <p class="font-semibold">Something went wrong.</p>
                                </div>
                              </Match>
                              <Match when={mutationTxWaitProposeNewRevision?.isSuccess}>
                                <div class="my-4 text-2xs rounded-md p-3 text-positive-11 border border-positive-5 bg-positive-3">
                                  <p class="font-semibold">Transcription created successfully !</p>
                                  <p>
                                    Check and share{' '}
                                    <A
                                      class="font-bold underline hover:no-underline focus:no-underline"
                                      href={ROUTE_TRANSCRIPTION_DETAILS.replace(
                                        '[chain]',
                                        mutationTxWaitProposeNewRevision.data?.chainAlias as string,
                                      ).replace(
                                        '[idTranscription]',
                                        mutationTxWaitProposeNewRevision.data?.transcript_id,
                                      )}
                                    >
                                      the details page here.
                                    </A>
                                  </p>
                                </div>
                              </Match>
                            </Switch>
                          </div>
                          <button
                            {...apiPopoverProposeNewRevisionStatus().closeTriggerProps}
                            class="text-center p-2 text-accent-10 w-full text-[0.75rem]"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  )
}

export default ProposeNewRevision
