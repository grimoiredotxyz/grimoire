import { For, Match, Show, splitProps, Switch } from 'solid-js'
import { formatDistanceToNow } from 'date-fns'
import { web3UriToUrl } from '~/helpers'
import { Button, IconEllipsisVertical, IconPlus, IconTrash, Identity } from '~/ui'
import { A } from '@solidjs/router'
import useDetails from './useDetails'
import type { Request } from '~/services'
import type { Resource } from 'solid-js'
import ProposeNewTranscription from '../ProposeNewTranscription'
import useRequestActions from './useRequestActions'
import { LOCALES } from '~/config'

interface RequestDetailsProps {
  request: Resource<Request>
}
export const RequestDetails = (props: RequestDetailsProps) => {
  const [local] = splitProps(props, ['request'])
  const { apiTabs, apiPopoverActions } = useDetails()
  const { mutationWriteContractDeleteRequest, mutationTxWaitDeleteRequest } = useRequestActions()
  return (
    <>
      <div class="container flex flex-col-reverse xs:flex-row flex-wrap gap-4 mx-auto pb-6">
        <div class="max-w-prose">
          <h1 class="font-serif text-2xl flex flex-col font-bold">
            <span class="font-sans font-black uppercase tracking-widest text-accent-10 italic">
              <Switch>
                <Match when={local.request()?.fulfilled}>Request fulfilled</Match>
                <Match when={!local.request()?.fulfilled}>Transcription wanted</Match>
              </Switch>
              &nbsp;-&nbsp;
            </span>
            {local.request()?.source_media_title}
          </h1>
          <div class="text-2xs flex flex-wrap pt-2 gap-2">
            <mark
              classList={{
                'bg-negative-3 border-negative-6 text-negative-11 ': !local.request()?.open_for_transcripts,
                'bg-positive-3 border-positive-6 text-positive-11': local.request()?.open_for_transcripts,
              }}
              class="flex items-baseline py-[0.1em] px-[0.5em] border text-[0.785em] "
            >
              <Switch>
                <Match when={local.request()?.open_for_transcripts && !local.request()?.fulfilled}>
                  Open to receive new proposals
                </Match>
                <Match when={!local.request()?.open_for_transcripts && !local.request()?.fulfilled}>
                  Reviewing (closed for new proposals)
                </Match>
              </Switch>
            </mark>
          </div>
          <p class="pt-4 italic text-neutral-9 text-2xs">
            Posted {formatDistanceToNow(local.request()?.created_at_datetime, { addSuffix: true })} by{' '}
            <Identity address={local.request()?.creator as `0x${string}`} shortenOnFallback={true} />
          </p>
        </div>
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
                <button
                  disabled={[
                    mutationWriteContractDeleteRequest.isLoading,
                    mutationTxWaitDeleteRequest.isLoading,
                    mutationTxWaitDeleteRequest.isSuccess,
                  ].includes(true)}
                  class="disabled:opacity-50 w-full flex items-center justify-start cursor-pointer text-negative-12 focus:bg-negative-1 focus:text-negative-11 py-2 px-3"
                  onClick={async () => {
                    await mutationWriteContractDeleteRequest.mutateAsync({
                      idRequest: local.request()?.request_id as string,
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
              Transcription propositions
            </button>
            <Show when={!local.request()?.fulfilled && local.request()?.open_for_transcripts === true}>
              <Button
                intent="primary-outline"
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
                Language: <span class="font-bold">{LOCALES[local.request()?.language]}</span>
              </p>
              <p class="whitespace-pre">{local.request()?.notes}</p>
            </section>
            <section>
              <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Source material</h2>
              <p class="text-xs text-neutral-11">
                The creator of this request a transcription for the media accessible at following sources :
              </p>

              <ul class="pt-2 space-y-1.5">
                <For each={local.request()?.source_media_uris}>
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
                <For each={local.request()?.collaborators}>
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
            <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Propositions received</h2>
            <p></p>
          </div>
          <div {...apiTabs().getContentProps({ value: 'propose', disabled: !props.request() })}>
            <Show when={props.request()}>
              <ProposeNewTranscription request={props.request} />
            </Show>
          </div>
        </div>
      </div>
    </>
  )
}

export default RequestDetails
