import { createEffect, For, Match, Show, splitProps, Switch } from 'solid-js'
import { formatDistanceToNow } from 'date-fns'
import { web3UriToUrl } from '~/helpers'
import { Button, IconEllipsisVertical, IconPlus, IconSpinner, IconTrash, Identity } from '~/ui'
import { A, useParams } from '@solidjs/router'
import useDetails from './useDetails'
import ProposeNewTranscription from '../ProposeNewTranscription'
import useRequestActions from './useRequestActions'
import { LOCALES } from '~/config'
import { useAuthentication } from '~/hooks'
import ListPropositions from './ListPropositions'
import Upvote from './Upvote'
import type { Request } from '~/services'
import type { CreateQueryResult } from '@tanstack/solid-query'

interface RequestDetailsProps {
  request: CreateQueryResult<Request, unknown>
}
export const RequestDetails = (props: RequestDetailsProps) => {
  const [local] = splitProps(props, ['request'])
  //@ts-ignore
  const { currentUser } = useAuthentication()
  const { apiTabs, apiPopoverActions, queryListReceivedProposals } = useDetails()
  const {
    mutationWriteContractDeleteRequest,
    mutationTxWaitDeleteRequest,
    mutationWriteContractUpdateRequestStatus,
    mutationTxWaitUpdateRequestStatus,
  } = useRequestActions()
  const params = useParams()

  return (
    <>
      <div class="container flex flex-col-reverse xs:flex-row flex-wrap gap-4 mx-auto pb-6">
        <div class="max-w-prose">
          <h1 class="font-serif text-2xl flex flex-col font-bold">
            <span class="font-sans font-black uppercase tracking-widest text-accent-10 italic">
              <Switch>
                <Match when={local.request?.data?.fulfilled}>Request fulfilled</Match>
                <Match when={!local.request?.data?.fulfilled}>Transcription wanted</Match>
              </Switch>
              &nbsp;-&nbsp;
            </span>
            {local.request?.data?.source_media_title}
          </h1>
          <div class="text-2xs flex flex-wrap pt-2 gap-2">
            <mark
              classList={{
                'bg-negative-3 border-negative-6 text-negative-11 ': !local.request?.data?.open_for_transcripts,
                'bg-positive-3 border-positive-6 text-positive-11': local.request?.data?.open_for_transcripts,
              }}
              class="flex items-baseline py-[0.1em] px-[0.5em] border text-[0.785em] "
            >
              <Switch fallback="--">
                <Match when={local.request?.data?.open_for_transcripts && !local.request?.data?.fulfilled}>
                  Open to receive new proposals
                </Match>
                <Match when={!local.request?.data?.open_for_transcripts && !local.request?.data?.fulfilled}>
                  Reviewing (closed for new proposals)
                </Match>
              </Switch>
            </mark>
          </div>
          <p class="pt-4 italic text-neutral-9 text-2xs">
            {/* @ts-ignore */}
            Posted {formatDistanceToNow(local.request?.data?.created_at_datetime, { addSuffix: true })} by{' '}
            <Identity address={local.request?.data?.creator as `0x${string}`} shortenOnFallback={true} />
          </p>
        </div>
        <Show when={currentUser()?.address === local.request?.data?.creator}>
          <div class="xs:mt-2 xs:mis-auto">
            <button
              type="button"
              classList={{
                'bg-neutral-7 shadow-inner': apiPopoverActions().isOpen,
              }}
              class="flex items-center xs:aspect-square border-neutral-5 border focus:border-transparent text-neutral-11 p-2 rounded-md hover:bg-neutral-4"
              {...apiPopoverActions().triggerProps}
            >
              <IconEllipsisVertical class="w-5 h-5" />

              <span class="pis-1ex text-2xs font-medium xs:pis-0 xs:sr-only">Actions</span>
            </button>
            <div
              class="text-2xs bg-white w-[200px] rounded shadow-lg border border-neutral-7 divide-y divide-neutral-5"
              {...apiPopoverActions().positionerProps}
            >
              <div class="text-[0.85em]" {...apiPopoverActions().contentProps}>
                <div class="sr-only" {...apiPopoverActions().titleProps}>
                  Actions
                </div>
                <div class="py-1">
                  <Show when={local.request?.data?.fulfilled === false}>
                    <Switch fallback="--">
                      <Match when={local.request?.data?.open_for_transcripts === true}>
                        <button
                          disabled={[
                            mutationWriteContractUpdateRequestStatus.isLoading,
                            mutationTxWaitUpdateRequestStatus.isLoading,
                          ].includes(true)}
                          class="disabled:opacity-50 w-full flex items-center justify-start cursor-pointer text-neutral-12 focus:bg-interactive-2 hover:bg-interactive-1 focus:text-interactive-12 hover:text-interactive-11 py-2 px-3"
                          onClick={async () => {
                            await mutationWriteContractUpdateRequestStatus.mutateAsync({
                              idRequest: local.request?.data?.request_id as string,
                              isFulfilled: local.request?.data?.fulfilled as boolean,
                              isOpen: false,
                            })
                          }}
                        >
                          <Show
                            when={[
                              mutationWriteContractUpdateRequestStatus.isLoading,
                              mutationTxWaitUpdateRequestStatus.isLoading,
                            ].includes(true)}
                          >
                            <IconSpinner class="w-4 h-4 animate-spin" />
                          </Show>
                          <span class="pis-1ex">
                            <Switch fallback="Close for proposals">
                              <Match when={mutationTxWaitUpdateRequestStatus.isLoading}>Closing...</Match>
                              <Match when={mutationWriteContractUpdateRequestStatus.isLoading}>
                                Sign transaction...
                              </Match>
                            </Switch>
                          </span>
                        </button>
                      </Match>
                      <Match when={local.request?.data?.open_for_transcripts === false}>
                        <button
                          disabled={[
                            mutationWriteContractUpdateRequestStatus.isLoading,
                            mutationTxWaitUpdateRequestStatus.isLoading,
                          ].includes(true)}
                          class="disabled:opacity-50 w-full flex items-center justify-start cursor-pointer text-neutral-12 focus:bg-interactive-2 hover:bg-interactive-1 focus:text-interactive-12 hover:text-interactive-11 py-2 px-3"
                          onClick={async () => {
                            await mutationWriteContractUpdateRequestStatus.mutateAsync({
                              idRequest: local.request?.data?.request_id as string,
                              isFulfilled: local.request?.data?.fulfilled as boolean,
                              isOpen: true,
                            })
                          }}
                        >
                          <Show
                            when={[
                              mutationWriteContractUpdateRequestStatus.isLoading,
                              mutationTxWaitUpdateRequestStatus.isLoading,
                            ].includes(true)}
                          >
                            <IconSpinner class="w-4 h-4 animate-spin" />
                          </Show>
                          <span class="pis-1ex">
                            <Switch fallback="Open for proposals">
                              <Match when={mutationTxWaitUpdateRequestStatus.isLoading}>Opening...</Match>
                              <Match when={mutationWriteContractUpdateRequestStatus.isLoading}>
                                Sign transaction...
                              </Match>
                            </Switch>
                          </span>
                        </button>
                      </Match>
                    </Switch>
                  </Show>
                  <button
                    disabled={[
                      mutationWriteContractDeleteRequest.isLoading,
                      mutationTxWaitDeleteRequest.isLoading,
                      mutationTxWaitDeleteRequest.isSuccess,
                    ].includes(true)}
                    class="disabled:opacity-50 w-full flex items-center justify-start cursor-pointer text-negative-12 focus:bg-negative-1 focus:text-negative-11 py-2 px-3"
                    onClick={async () => {
                      await mutationWriteContractDeleteRequest.mutateAsync({
                        idRequest: local.request?.data?.request_id as string,
                      })
                    }}
                  >
                    <IconTrash class="text-negative-9 w-4 h-4" stroke-width="2" />

                    <span class="pis-1ex">
                      <Switch fallback="Delete">
                        <Match when={mutationWriteContractDeleteRequest.isLoading}>Sign transaction...</Match>
                        <Match when={mutationTxWaitDeleteRequest.isLoading}>Deleting...</Match>
                        <Match
                          when={mutationTxWaitDeleteRequest.isSuccess && mutationWriteContractDeleteRequest.isSuccess}
                        >
                          Deleted !
                        </Match>
                      </Switch>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
      <div {...apiTabs().rootProps}>
        <div class="border-neutral-4 border-b">
          <div class="container flex flex-col xs:flex-row mx-auto" {...apiTabs().tablistProps}>
            <button
              class="data-[selected]:text-interactive-11 data-[selected]:underline xs:data-[selected]:no-underline p-2 xs:pb-2 xs:pt-0.5 font-semibold text-2xs text-neutral-11 xs:data-[selected]:border-b-2 xs:border-b-2 xs:border-transparent xs:data-[selected]:border-b-interactive-9"
              {...apiTabs().getTriggerProps({ value: 'about' })}
            >
              About
            </button>
            <button
              class="data-[selected]:text-interactive-11 data-[selected]:underline xs:data-[selected]:no-underline p-2 xs:pb-2 xs:pt-0.5 font-semibold text-2xs text-neutral-11 xs:data-[selected]:border-b-2 xs:border-b-2 xs:border-transparent xs:data-[selected]:border-b-interactive-9"
              {...apiTabs().getTriggerProps({ value: 'transcriptions' })}
            >
              Transcription propositions{' '}
              <Show fallback={<IconSpinner class="w-4 h-4 animate-spin" />} when={queryListReceivedProposals?.data}>
                ({queryListReceivedProposals?.data?.length})
              </Show>
            </button>
            <Show when={!local.request?.data?.fulfilled && local.request?.data?.open_for_transcripts === true}>
              <Button
                intent="neutral-outline"
                scale="xs"
                class="mx-auto w-[fit-content] xs:w-auto xs:mie-0 mb-4 mt-2 xs:mt-0 xs:mb-1 inline-flex items-center"
                {...apiTabs().getTriggerProps({ value: 'propose' })}
              >
                <IconPlus class="w-4 h-4" />
                <span class="text-[0.85em] pis-1ex">Propose new transcription</span>
              </Button>
            </Show>
          </div>
        </div>
        <div class="container pt-12 mx-auto">
          <div class="space-y-8" {...apiTabs().getContentProps({ value: 'about' })}>
            <section>
              <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Details</h2>
              <p class="mb-4">
                {/* @ts-ignore */}
                Language: <span class="font-bold">{LOCALES[local.request?.data?.language]}</span>
              </p>
              <p class="whitespace-pre">{local.request?.data?.notes}</p>
            </section>
            <section>
              <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Source material</h2>
              <p class="text-xs text-neutral-11">
                The creator of this request a transcription for the media accessible at following sources :
              </p>

              <ul class="pt-2 space-y-1.5">
                {/* @ts-ignore */}
                <For each={local.request?.data?.source_media_uris.split(',')}>
                  {(source_media_uri) => (
                    <li class="font-mono">
                      <A href={web3UriToUrl(source_media_uri)}>{source_media_uri}</A>
                    </li>
                  )}
                </For>
              </ul>
            </section>
            <section>
              <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Reviewers</h2>
              <p class="text-xs text-neutral-11">
                The following people will review and accept/reject proposed transcriptions :
              </p>
              <ul class="pt-2 space-y-1.5">
                <For each={local.request?.data?.collaborators}>
                  {(collaborator) => (
                    <li class="font-mono">
                      <Identity address={collaborator} shortenOnFallback={false} />
                    </li>
                  )}
                </For>
              </ul>
            </section>
          </div>
          <div {...apiTabs().getContentProps({ value: 'transcriptions' })}>
            <h2 class="pb-4 text-2xs uppercase tracking-wide text-accent-9 font-bold">
              Propositions received{' '}
              <Show fallback={<IconSpinner class="w-4 h-4 animate-spin" />} when={queryListReceivedProposals?.data}>
                ({queryListReceivedProposals?.data?.length})
              </Show>
            </h2>

            <Switch>
              <Match when={queryListReceivedProposals?.isLoading}>
                <p>Loading propositions...</p>
              </Match>
              <Match
                when={params?.chain && queryListReceivedProposals?.data && queryListReceivedProposals?.data?.length > 0}
              >
                <ListPropositions chain={params.chain} query={queryListReceivedProposals} />
              </Match>
            </Switch>
          </div>
          {/* @ts-ignore */}
          <div {...apiTabs().getContentProps({ value: 'propose', disabled: !props.request?.data })}>
            <Show when={props.request?.data}>
              {/* @ts-ignore */}
              <ProposeNewTranscription request={props.request} />
            </Show>
          </div>
        </div>
      </div>
      <Show when={!props.request?.data?.fulfilled}>
        <section class="mt-16 sm:text-center bg-neutral-1 border border-neutral-6 p-6">
          <div class="max-w-prose mx-auto">
            <h3 class="text-lg mb-1 font-serif font-semibold text-accent-12">Need this transcription ?</h3>
            <p class="mb-4 text-neutral-11 text-sm">
              You can help making this request more visible on the request board by upvoting it. By the way - upvoting
              is completely free !
            </p>
            <Upvote
              class="flex items-center mx-auto"
              intent="neutral-outline"
              scale="sm"
              voters={props.request?.data?.voters}
              idRequest={props.request?.data?.id as string}
            />
          </div>
        </section>
      </Show>
    </>
  )
}

export default RequestDetails
