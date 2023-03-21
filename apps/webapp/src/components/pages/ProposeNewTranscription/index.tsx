import { z } from 'zod'
import { createEffect, Match, Show, Switch } from 'solid-js'
import { web3UriToUrl } from '~/helpers'
import { IconCheck, IconDoubleChevronDown, IconError, IconExternal, IconSpinner } from '~/ui'
import { FormProposeNewTranscription, useForm, schema } from '~/components/forms/FormProposeNewTranscription'
import { useSmartContract } from '~/components/forms/FormNewTranscription'

import { ROUTE_TRANSCRIPTION_DETAILS } from '~/config'
import { A } from 'solid-start'
import type { Request } from '~/services'
import type { Accessor } from 'solid-js'

interface ProposeNewTranscriptionProps {
  request: Accessor<Request>
}

export const ProposeNewTranscription = (props: ProposeNewTranscriptionProps) => {
  const {
    apiPopoverCreateNewTranscriptionStatus,
    apiAccordionCreateNewTranscriptionStatus,
    // Uploads
    mutationUploadVTTFile,
    mutationUploadLRCFile,
    mutationUploadSRTFile,
    mutationUploadMetadata,
    // Contract interactions
    mutationWriteContractCreateNewTranscription,
    mutationTxWaitCreateNewTranscription,
    // Form submit event handlers
    onSubmitCreateTranscriptionForm,
  } = useSmartContract()

  const {
    formProposeNewTranscription,
    stateMachineAccordion,
    stateMachineTabs,
    stateMachineComboboxLanguage,
    stateMachineKeywords,
    stateMachineSourcesMediaUris,
    stateMachineCollaborators,
    comboboxLanguageOptions,
  } = useForm({
    //@ts-ignore
    initialValues: {
      source_media_title: props?.request().source_media_title ?? '',
      source_media_uris:
        props?.request()?.source_media_uris?.length > 0 ? [...props?.request()?.source_media_uris] : [],
      language: props.request().language,
      keywords: props.request()?.keywords?.length > 0 ? [...props.request()?.keywords] : [],
      title: '',
      revision_must_be_approved_first: true,
      transcription_plain_text: '',
      collaborators: [],
    },
    onSubmit: (values: z.infer<typeof schema>) => {
      onSubmitCreateTranscriptionForm({
        formValues: values,
      })
    },
  })

  createEffect(() => {
    console.log(formProposeNewTranscription.data())
  })
  return (
    <>
      <div class="w-full max-w-prose mx-auto">
        <h1 class="text-lg text-accent-12 font-serif font-bold">Propose your transcription</h1>
        <div class="space-y-1 text-xs mt-2 mb-4 text-neutral-11 font-medium">
          <p>
            Once submitted, your transcription will be reviewed by the team behind this request and will be either
            accepted or rejected.
          </p>
        </div>
        <FormProposeNewTranscription
          apiTabs={stateMachineTabs}
          apiKeywords={stateMachineKeywords}
          apiCollaborators={stateMachineCollaborators}
          apiAccordion={stateMachineAccordion}
          apiComboboxLanguage={stateMachineComboboxLanguage}
          apiSourcesMediaUris={stateMachineSourcesMediaUris}
          comboboxLanguageOptions={comboboxLanguageOptions}
          storeForm={formProposeNewTranscription}
          isError={[
            mutationTxWaitCreateNewTranscription.isError,
            mutationWriteContractCreateNewTranscription.isError,
            mutationUploadLRCFile.isError,
            mutationUploadSRTFile.isError,
            mutationUploadVTTFile.isError,
            mutationUploadMetadata.isError,
          ].includes(true)}
          isLoading={[
            mutationTxWaitCreateNewTranscription.isLoading,
            mutationWriteContractCreateNewTranscription.isLoading,
            mutationUploadLRCFile.isLoading,
            mutationUploadSRTFile.isLoading,
            mutationUploadVTTFile.isLoading,
            mutationUploadMetadata.isLoading,
          ].includes(true)}
          isSuccess={
            ![
              mutationTxWaitCreateNewTranscription.isSuccess,
              mutationWriteContractCreateNewTranscription.isSuccess,
            ].includes(false)
          }
        />
        <Show
          when={
            ['success', 'loading', 'error'].includes(mutationTxWaitCreateNewTranscription.status) ||
            ['success', 'loading', 'error'].includes(mutationWriteContractCreateNewTranscription.status) ||
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
                      !apiPopoverCreateNewTranscriptionStatus()?.isOpen,
                    'shadow-xl rounded-2xl md:rounded-t-none border-accent-11 border-opacity-75':
                      apiPopoverCreateNewTranscriptionStatus()?.isOpen,
                  }}
                  class="pointer-events-auto bg-accent-12 text-accent-1 hover:bg-neutral-12 hover:text-accent-1 focus:ring-2 border relative flex items-center font-semibold text-2xs px-5 py-1.5"
                  {...apiPopoverCreateNewTranscriptionStatus().triggerProps}
                >
                  <Switch fallback="Create new transcription">
                    <Match
                      when={[
                        mutationTxWaitCreateNewTranscription.isLoading,
                        mutationWriteContractCreateNewTranscription.isLoading,
                        mutationUploadMetadata.isLoading,
                        mutationUploadVTTFile.isLoading,
                        mutationUploadSRTFile.isLoading,
                        mutationUploadLRCFile.isLoading,
                      ].includes(true)}
                    >
                      <IconSpinner class="animate-spin w-5 h-5 mie-1ex" /> Creating new transcription...
                    </Match>
                    <Match
                      when={
                        ![
                          mutationTxWaitCreateNewTranscription.isSuccess,
                          mutationWriteContractCreateNewTranscription.isSuccess,
                        ].includes(false)
                      }
                    >
                      <IconCheck class="w-5 h-5 mie-1ex" /> Transcription created !
                    </Match>
                  </Switch>
                </button>
                <div
                  {...apiPopoverCreateNewTranscriptionStatus().positionerProps}
                  class="absolute pointer-events-auto w-full min-w-[unset] top-0 md:-translate-y-full md:bottom-0 inline-start-0"
                >
                  <div
                    {...apiPopoverCreateNewTranscriptionStatus().contentProps}
                    class="bg-accent-12 border  border-accent-5 w-full rounded-xl md:rounded-t-0 shadow-2xl"
                  >
                    <div class="sr-only" {...apiPopoverCreateNewTranscriptionStatus().titleProps}>
                      Create new transcription
                    </div>
                    <div class="sr-only" {...apiPopoverCreateNewTranscriptionStatus().descriptionProps}>
                      You can check the status of your different file uploads and other required interactions below.
                    </div>
                    <div
                      class="border-t divide-y divide-accent-11 divide-opacity-50 border-accent-7"
                      {...apiAccordionCreateNewTranscriptionStatus().rootProps}
                    >
                      <div {...apiAccordionCreateNewTranscriptionStatus().getItemProps({ value: 'file-uploads' })}>
                        <h3>
                          <button
                            class="w-full font-semibold flex justify-between text-start text-accent-6 text-[0.85rem] p-2"
                            {...apiAccordionCreateNewTranscriptionStatus().getTriggerProps({
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
                                'rotate-180': apiAccordionCreateNewTranscriptionStatus()?.value === 'file-uploads',
                              }}
                              class="text-accent-6 w-5 h-5 pis-1ex"
                            />
                          </button>
                        </h3>
                        <div
                          {...apiAccordionCreateNewTranscriptionStatus().getContentProps({
                            value: 'file-uploads',
                          })}
                        >
                          <ul class="pb-2 text-2xs space-y-1 px-2">
                            <Show when={formProposeNewTranscription.data().srt_file?.name}>
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
                            <Show when={formProposeNewTranscription.data().vtt_file?.name}>
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
                            <Show when={formProposeNewTranscription.data().lrc_file?.name}>
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
                      <div {...apiAccordionCreateNewTranscriptionStatus().getItemProps({ value: 'transaction-1' })}>
                        <h3>
                          <button
                            class="w-full font-semibold flex justify-between text-start text-accent-6 text-[0.85rem] p-2"
                            {...apiAccordionCreateNewTranscriptionStatus().getTriggerProps({
                              value: 'transaction-1',
                            })}
                          >
                            <Switch>
                              <Match
                                when={[
                                  mutationWriteContractCreateNewTranscription.isLoading,
                                  mutationTxWaitCreateNewTranscription.isLoading,
                                ].includes(true)}
                              >
                                <IconSpinner class="animate-spin w-5 h-5 mie-1ex" />
                              </Match>
                              <Match
                                when={
                                  ![
                                    mutationWriteContractCreateNewTranscription.isSuccess,
                                    mutationTxWaitCreateNewTranscription.isSuccess,
                                  ].includes(false)
                                }
                              >
                                <IconCheck class="w-5 h-5 mie-1ex" />
                              </Match>
                            </Switch>
                            On-chain interactions{' '}
                            <IconDoubleChevronDown
                              classList={{
                                'rotate-180': apiAccordionCreateNewTranscriptionStatus()?.value === 'transaction-1',
                              }}
                              class="text-accent-6 w-5 h-5 pis-1ex"
                            />
                          </button>
                        </h3>
                        <div
                          {...apiAccordionCreateNewTranscriptionStatus().getContentProps({
                            value: 'transaction-1',
                          })}
                        >
                          <ol class="pb-2 text-2xs px-2 space-y-1">
                            <li
                              classList={{
                                'text-accent-8': mutationWriteContractCreateNewTranscription?.isIdle,
                                'animate-pulse font-bold': mutationWriteContractCreateNewTranscription?.isLoading,
                                'text-accent-7': !mutationWriteContractCreateNewTranscription?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationWriteContractCreateNewTranscription?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationWriteContractCreateNewTranscription?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationWriteContractCreateNewTranscription?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>

                              <Switch>
                                <Match when={mutationWriteContractCreateNewTranscription.status !== 'loading'}>
                                  <span>
                                    <span>Sign transaction &nbsp;</span>

                                    <Show
                                      when={['success', 'error'].includes(
                                        mutationWriteContractCreateNewTranscription.status,
                                      )}
                                    >
                                      <span>{mutationWriteContractCreateNewTranscription.status}</span>
                                    </Show>
                                  </span>
                                </Match>

                                <Match when={mutationWriteContractCreateNewTranscription.status === 'loading'}>
                                  <span>Please, sign transaction in your wallet...</span>
                                </Match>
                              </Switch>
                            </li>
                            <li
                              classList={{
                                'text-accent-8': mutationTxWaitCreateNewTranscription?.isIdle,
                                'animate-pulse font-bold': mutationTxWaitCreateNewTranscription?.isLoading,
                                'text-accent-7': !mutationTxWaitCreateNewTranscription?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationTxWaitCreateNewTranscription?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationTxWaitCreateNewTranscription?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationTxWaitCreateNewTranscription?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>
                              <span>
                                <span>Transaction status:&nbsp;</span>{' '}
                                <span>{mutationTxWaitCreateNewTranscription.status}</span>
                              </span>
                            </li>
                          </ol>
                        </div>
                        <div class="pb-0.5 border-t border-accent-11 border-opacity-50">
                          <div class="px-2">
                            <Switch>
                              <Match
                                when={[
                                  mutationTxWaitCreateNewTranscription?.status,
                                  mutationWriteContractCreateNewTranscription.status,
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
                              <Match when={mutationTxWaitCreateNewTranscription?.isSuccess}>
                                <div class="my-4 text-2xs rounded-md p-3 text-positive-11 border border-positive-5 bg-positive-3">
                                  <p class="font-semibold">Transcription created successfully !</p>
                                  <p>
                                    Check and share{' '}
                                    <A
                                      class="font-bold underline hover:no-underline focus:no-underline"
                                      href={ROUTE_TRANSCRIPTION_DETAILS.replace(
                                        '[chain]',
                                        mutationTxWaitCreateNewTranscription.data?.chainAlias as string,
                                      ).replace(
                                        '[idTranscription]',
                                        mutationTxWaitCreateNewTranscription.data?.transcript_id,
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
                            {...apiPopoverCreateNewTranscriptionStatus().closeTriggerProps}
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

export default ProposeNewTranscription
