import { z } from 'zod'
import { Match, Show, Switch } from 'solid-js'
import web3UriToUrl from '~/helpers/web3UriToUrl'
import { IconCheck, IconDoubleChevronDown, IconError, IconExternal, IconSpinner } from '~/ui/Icons'
import { FormNewRequest, useSmartContract, schema, useForm } from '~/components/forms/FormNewRequest'
import { ROUTE_REQUEST_DETAILS } from '~/config'
import { A } from 'solid-start'

export const Request = () => {
  const {
    apiPopoverCreateNewRequestStatus,
    apiAccordionCreateNewRequestStatus,
    // Uploads
    mutationUploadMetadata,
    // Contract interactions
    mutationTxWaitCreateNewRequest,
    mutationWriteContractCreateNewRequest,
    // Form submit event handlers
    onSubmitCreateRequestForm,
  } = useSmartContract()

  const {
    comboboxLanguageOptions,
    formNewRequest,
    stateMachineAccordion,
    stateMachineCollaborators,
    stateMachineSourcesMediaUris,
    stateMachineComboboxLanguage,
    stateMachineKeywords,
  } = useForm({
    //@ts-ignore
    initialValues: {
      source_media_title: '',
      source_media_uris: [],
      collaborators: [],
    },
    onSubmit: (values: z.infer<typeof schema>) => {
      onSubmitCreateRequestForm({
        formValues: values,
      })
    },
  })
  return (
    <>
      <div class="w-full max-w-prose mx-auto">
        <h1 class="text-2xl text-accent-12 font-serif font-bold">Create a new transcription request</h1>
        <div class="space-y-1 text-xs mt-2 mb-4 text-neutral-11 font-medium">
          <p>
            Need a transcription of a video course ? A podcast ? The synchronized lyrics of a song ? A translation ? You
            can put a transcription request on Grimoire request board so other users can propose transcriptions.
          </p>
        </div>
        <FormNewRequest
          apiKeywords={stateMachineKeywords}
          apiComboboxLanguage={stateMachineComboboxLanguage}
          comboboxLanguageOptions={comboboxLanguageOptions}
          apiCollaborators={stateMachineCollaborators}
          apiAccordion={stateMachineAccordion}
          apiSourcesMediaUris={stateMachineSourcesMediaUris}
          storeForm={formNewRequest}
          isError={[
            mutationTxWaitCreateNewRequest.isError,
            mutationWriteContractCreateNewRequest.isError,
            mutationUploadMetadata.isError,
          ].includes(true)}
          isLoading={[
            mutationTxWaitCreateNewRequest.isLoading,
            mutationWriteContractCreateNewRequest.isLoading,
            mutationUploadMetadata.isLoading,
          ].includes(true)}
          isSuccess={
            ![mutationTxWaitCreateNewRequest.isSuccess, mutationWriteContractCreateNewRequest.isSuccess].includes(false)
          }
        />
        <Show
          when={
            ['success', 'loading', 'error'].includes(mutationTxWaitCreateNewRequest.status) ||
            ['success', 'loading', 'error'].includes(mutationWriteContractCreateNewRequest.status) ||
            ['success', 'loading', 'error'].includes(mutationUploadMetadata.status)
          }
        >
          <div class="fixed w-full pointer-events-none z-50 pb-16 bottom-0 inline-start-0 flex ">
            <div class="w-full mx-auto flex justify-center">
              <div class="relative h-fit-content">
                <button
                  classList={{
                    'shadow-md rounded-2xl md:rounded-t-none border-accent-9':
                      !apiPopoverCreateNewRequestStatus()?.isOpen,
                    'shadow-xl rounded-2xl md:rounded-t-none border-accent-11 border-opacity-75':
                      apiPopoverCreateNewRequestStatus()?.isOpen,
                  }}
                  class="pointer-events-auto bg-accent-12 text-accent-1 hover:bg-neutral-12 hover:text-accent-1 focus:ring-2 border relative flex items-center font-semibold text-2xs px-5 py-1.5"
                  {...apiPopoverCreateNewRequestStatus().triggerProps}
                >
                  <Switch fallback="Create new transcription">
                    <Match
                      when={[
                        mutationTxWaitCreateNewRequest.isLoading,
                        mutationWriteContractCreateNewRequest.isLoading,
                        mutationUploadMetadata.isLoading,
                      ].includes(true)}
                    >
                      <IconSpinner class="animate-spin w-5 h-5 mie-1ex" /> Creating new request...
                    </Match>
                    <Match
                      when={
                        ![
                          mutationTxWaitCreateNewRequest.isSuccess,
                          mutationWriteContractCreateNewRequest.isSuccess,
                        ].includes(false)
                      }
                    >
                      <IconCheck class="w-5 h-5 mie-1ex" /> Request created !
                    </Match>
                  </Switch>
                </button>
                <div
                  {...apiPopoverCreateNewRequestStatus().positionerProps}
                  class="absolute pointer-events-auto w-full min-w-[unset] top-0 md:-translate-y-full md:bottom-0 inline-start-0"
                >
                  <div
                    {...apiPopoverCreateNewRequestStatus().contentProps}
                    class="bg-accent-12 border  border-accent-5 w-full rounded-xl md:rounded-t-0 shadow-2xl"
                  >
                    <div class="sr-only" {...apiPopoverCreateNewRequestStatus().titleProps}>
                      Create new request
                    </div>
                    <div class="sr-only" {...apiPopoverCreateNewRequestStatus().descriptionProps}>
                      You can check the status of your file upload and other required interactions below.
                    </div>
                    <div
                      class="border-t divide-y divide-accent-11 divide-opacity-50 border-accent-7"
                      {...apiAccordionCreateNewRequestStatus().rootProps}
                    >
                      <div {...apiAccordionCreateNewRequestStatus().getItemProps({ value: 'file-uploads' })}>
                        <h3>
                          <button
                            class="w-full font-semibold flex justify-between text-start text-accent-6 text-[0.85rem] p-2"
                            {...apiAccordionCreateNewRequestStatus().getTriggerProps({ value: 'file-uploads' })}
                          >
                            <Switch>
                              <Match when={[mutationUploadMetadata.isLoading].includes(true)}>
                                <IconSpinner class="animate-spin w-5 h-5 mie-1ex" />
                              </Match>
                              <Match when={mutationUploadMetadata.isSuccess}>
                                <IconCheck class="w-5 h-5 mie-1ex" />
                              </Match>
                            </Switch>
                            File uploads{' '}
                            <IconDoubleChevronDown
                              classList={{
                                'rotate-180': apiAccordionCreateNewRequestStatus()?.value === 'file-uploads',
                              }}
                              class="text-accent-6 w-5 h-5 pis-1ex"
                            />
                          </button>
                        </h3>
                        <div {...apiAccordionCreateNewRequestStatus().getContentProps({ value: 'file-uploads' })}>
                          <ul class="pb-2 text-2xs space-y-1 px-2">
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
                      <div {...apiAccordionCreateNewRequestStatus().getItemProps({ value: 'transaction-1' })}>
                        <h3>
                          <button
                            class="w-full font-semibold flex justify-between text-start text-accent-6 text-[0.85rem] p-2"
                            {...apiAccordionCreateNewRequestStatus().getTriggerProps({ value: 'transaction-1' })}
                          >
                            <Switch>
                              <Match
                                when={[
                                  mutationWriteContractCreateNewRequest.isLoading,
                                  mutationTxWaitCreateNewRequest.isLoading,
                                ].includes(true)}
                              >
                                <IconSpinner class="animate-spin w-5 h-5 mie-1ex" />
                              </Match>
                              <Match
                                when={
                                  ![
                                    mutationWriteContractCreateNewRequest.isSuccess,
                                    mutationTxWaitCreateNewRequest.isSuccess,
                                  ].includes(false)
                                }
                              >
                                <IconCheck class="w-5 h-5 mie-1ex" />
                              </Match>
                            </Switch>
                            On-chain interactions{' '}
                            <IconDoubleChevronDown
                              classList={{
                                'rotate-180': apiAccordionCreateNewRequestStatus()?.value === 'transaction-1',
                              }}
                              class="text-accent-6 w-5 h-5 pis-1ex"
                            />
                          </button>
                        </h3>
                        <div {...apiAccordionCreateNewRequestStatus().getContentProps({ value: 'transaction-1' })}>
                          <ol class="pb-2 text-2xs px-2 space-y-1">
                            <li
                              classList={{
                                'text-accent-8': mutationWriteContractCreateNewRequest?.isIdle,
                                'animate-pulse font-bold': mutationWriteContractCreateNewRequest?.isLoading,
                                'text-accent-7': !mutationWriteContractCreateNewRequest?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationWriteContractCreateNewRequest?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationWriteContractCreateNewRequest?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationWriteContractCreateNewRequest?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>

                              <Switch>
                                <Match when={mutationWriteContractCreateNewRequest.status !== 'loading'}>
                                  <span>
                                    <span>Sign transaction &nbsp;</span>

                                    <Show
                                      when={['success', 'error'].includes(mutationWriteContractCreateNewRequest.status)}
                                    >
                                      <span>{mutationWriteContractCreateNewRequest.status}</span>
                                    </Show>
                                  </span>
                                </Match>

                                <Match when={mutationWriteContractCreateNewRequest.status === 'loading'}>
                                  <span>Please, sign transaction in your wallet...</span>
                                </Match>
                              </Switch>
                            </li>
                            <li
                              classList={{
                                'text-accent-8': mutationTxWaitCreateNewRequest?.isIdle,
                                'animate-pulse font-bold': mutationTxWaitCreateNewRequest?.isLoading,
                                'text-accent-7': !mutationTxWaitCreateNewRequest?.isIdle,
                              }}
                              class="flex items-center"
                            >
                              <Switch>
                                <Match when={mutationTxWaitCreateNewRequest?.isError}>
                                  <IconError class="w-4 h-4 shrink-0 mie-1ex text-negative-9" />
                                </Match>

                                <Match when={mutationTxWaitCreateNewRequest?.isSuccess}>
                                  <IconCheck class="w-4 h-4 shrink-0 mie-1ex text-positive-9" />
                                </Match>
                                <Match when={mutationTxWaitCreateNewRequest?.isLoading}>
                                  <IconSpinner class="w-4 h-4 shrink-0 mie-1ex animate-spin" />
                                </Match>
                              </Switch>
                              <span>
                                <span>Transaction status:&nbsp;</span>{' '}
                                <span>{mutationTxWaitCreateNewRequest.status}</span>
                              </span>
                            </li>
                          </ol>
                        </div>
                        <div class="pb-0.5 border-t border-accent-11 border-opacity-50">
                          <div class="px-2">
                            <Switch>
                              <Match
                                when={[
                                  mutationTxWaitCreateNewRequest?.status,
                                  mutationWriteContractCreateNewRequest.status,
                                  mutationUploadMetadata.status,
                                ].includes('error')}
                              >
                                <div class="mb-4 rounded-md text-2xs p-3 text-negative-11 border border-negative-5 bg-negative-3">
                                  <p class="font-semibold">Something went wrong.</p>
                                </div>
                              </Match>
                              <Match when={mutationTxWaitCreateNewRequest?.isSuccess}>
                                <div class="my-4 text-2xs rounded-md p-3 text-positive-11 border border-positive-5 bg-positive-3">
                                  <p class="font-semibold">Request created successfully !</p>
                                  <p>
                                    Check and share{' '}
                                    <A
                                      class="font-bold underline hover:no-underline focus:no-underline"
                                      href={ROUTE_REQUEST_DETAILS.replace(
                                        '[chain]',
                                        mutationTxWaitCreateNewRequest.data?.chainAlias as string,
                                      ).replace('[idRequest]', mutationTxWaitCreateNewRequest.data?.request_id)}
                                    >
                                      the details page here.
                                    </A>
                                  </p>
                                </div>
                              </Match>
                            </Switch>
                          </div>
                          <button
                            {...apiPopoverCreateNewRequestStatus().closeTriggerProps}
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

export default Request
