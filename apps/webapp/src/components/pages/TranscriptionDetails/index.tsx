import { formatDistanceToNow } from 'date-fns'
import { createEffect, createSignal, For, Match, Show, splitProps, Switch } from 'solid-js'
import type { Accessor } from 'solid-js'
import { A, useParams } from 'solid-start'
import { LOCALES, ROUTE_REQUEST_DETAILS } from '~/config'
import { callToAction } from '~/design-system'
import { deriveEthAddressFromPublicKey, web3UriToUrl } from '~/helpers'
import { useAuthentication } from '~/hooks'
import type { Transcription } from '~/services'
import {
  Button,
  IconDocumentArrowDown,
  IconEllipsisVertical,
  IconExclamationCircle,
  IconPlus,
  IconSpinner,
  IconStarFilled,
  IconTrash,
  Identity,
} from '~/ui'
import ProposeNewRevision from '../ProposeNewRevision'
import ListRevisions from './ListRevisions'
import Rate from './Rate'
import useDetails from './useDetails'
import useTranscriptionActions from './useTranscriptionActions'
import type { CreateQueryResult } from '@tanstack/solid-query'
import Discussion from '../Discussion'

interface TranscriptionDetailsProps {
  transcription: CreateQueryResult<Transcription, unknown>
}
export const TranscriptionDetails = (props: TranscriptionDetailsProps) => {
  const params = useParams()
  const [local] = splitProps(props, ['transcription'])
  const {
    apiTabs,
    apiPopoverActions,
    apiAccordionDetails,
    downloadFile,
    queryListAcceptedRevisions,
    queryListReceivedProposedRevisions,
  } = useDetails()
  const { mutationTxWaitDeleteTranscription, mutationWriteContractDeleteTranscription } = useTranscriptionActions()
  const { currentUser } = useAuthentication()
  const [currentUserRating, setCurrentUserRating] = createSignal(0)

  createEffect(() => {
    if (currentUser()?.address && local?.transcription?.data?.rating) {
      Object.keys(local?.transcription?.data?.rating)?.filter((r) => {
        if (deriveEthAddressFromPublicKey(r)?.toLowerCase() === currentUser()?.address?.toLowerCase()) {
          setCurrentUserRating(local?.transcription?.data?.rating?.[r])
        }
      })
    }
  })

  return (
    <>
      <div class="flex justify-between container mx-auto pb-6">
        <div class="max-w-prose">
          <div class="flex flex-col-reverse">
            <h1 class="font-serif text-2xl flex flex-col font-bold">{local?.transcription?.data?.title}</h1>
            <Show
              when={
                local.transcription?.data?.id_request !==
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              }
            >
              <p class="font-sans text-2xl font-black uppercase tracking-widest text-accent-10 italic">Proposition -</p>
            </Show>
          </div>
          <section class="text-2xs pt-3">
            <p class="text-neutral-11">
              Original media title:{' '}
              <span class="font-medium text-accent-11">"{local.transcription?.data?.source_media_title}"</span>
            </p>
            <p class="text-neutral-11 pt-1">
              Language: <span class="font-medium text-accent-11">{LOCALES?.[local.transcription?.data?.language]}</span>
            </p>
            <div class="flex flex-wrap pt-1">
              <span class="text-neutral-11">Keywords:&nbsp;</span>
              <ul class="flex flex-wrap gap-2">
                <For each={local.transcription?.data?.keywords?.split(',')}>
                  {(keyword) => (
                    <li class="leading-none font-medium text-[0.8em] py-[0.25em] px-[0.5em] rounded-md bg-accent-1 border-accent-6 text-accent-11 border">
                      {keyword}
                    </li>
                  )}
                </For>
              </ul>
            </div>
            <p class="pt-1 flex items-center text-neutral-11">
              Average rating:{' '}
              <span class="pis-2 flex gap-0.5">
                <For each={[...Array(5).keys()]}>
                  {(x, i) => (
                    <>
                      <IconStarFilled
                        class="w-3 h-3"
                        classList={{
                          'text-accent-5': local.transcription?.data.average_rating <= x,
                          'text-accent-11': local.transcription?.data.average_rating > x,
                        }}
                      />
                    </>
                  )}
                </For>
              </span>
            </p>
            <p class="pt-4 italic text-neutral-9 text-2xs">
              Proposed{' '}
              <Show when={local.transcription?.created_at_datetime}>
                {formatDistanceToNow(local.transcription?.data?.created_at_datetime, { addSuffix: true })}{' '}
              </Show>
              &nbsp;by{' '}
              <Identity address={local.transcription?.data?.creator as `0x${string}`} shortenOnFallback={true} />{' '}
              <Show
                when={
                  local.transcription?.data?.id_request !==
                  '0x0000000000000000000000000000000000000000000000000000000000000000'
                }
              >
                &nbsp;|&nbsp;
                <A
                  class="link"
                  href={ROUTE_REQUEST_DETAILS.replace('[idRequest]', local.transcription?.data?.id_request).replace(
                    '[chain]',
                    params.chain,
                  )}
                >
                  View request details
                </A>
              </Show>
            </p>
            <Show when={local.transcription?.created_at_datetime}>
              <p class="pt-1 italic text-neutral-9 text-2xs">
                Last updated{' '}
                {formatDistanceToNow(local.transcription?.data?.last_updated_at_datetime, { addSuffix: true })}
              </p>
            </Show>
          </section>
        </div>

        <Show when={currentUser()?.address === local.transcription?.data?.creator}>
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
                      mutationWriteContractDeleteTranscription.isLoading,
                      mutationTxWaitDeleteTranscription.isLoading,
                      mutationTxWaitDeleteTranscription.isSuccess,
                    ].includes(true)}
                    class="disabled:opacity-50 w-full flex items-center justify-start cursor-pointer text-negative-12 focus:bg-negative-1 focus:text-negative-11 py-2 px-3"
                    onClick={async () => {
                      await mutationWriteContractDeleteTranscription.mutateAsync({
                        idTranscription: local.transcription?.data?.transcription_id as string,
                      })
                    }}
                  >
                    <IconTrash class="text-negative-9 w-4 h-4" stroke-width="2" />

                    <span class="pis-1ex">
                      <Switch fallback="Delete">
                        <Match when={mutationWriteContractDeleteTranscription.isLoading}>Sign transaction...</Match>
                        <Match when={mutationTxWaitDeleteTranscription.isLoading}>Deleting...</Match>
                        <Match
                          when={
                            mutationTxWaitDeleteTranscription.isSuccess &&
                            mutationWriteContractDeleteTranscription.isSuccess
                          }
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
              {...apiTabs().getTriggerProps({ value: 'proposed-revisions' })}
            >
              Proposed revisions{' '}
              <Show
                fallback={<IconSpinner class="w-4 h-4 animate-spin" />}
                when={queryListReceivedProposedRevisions?.data}
              >
                ({queryListReceivedProposedRevisions?.data?.length})
              </Show>
            </button>
            <button
              class="data-[selected]:text-interactive-11 data-[selected]:underline xs:data-[selected]:no-underline p-2 xs:pb-2 xs:pt-0.5 font-semibold text-2xs text-neutral-11 xs:data-[selected]:border-b-2 xs:border-b-2 xs:border-transparent xs:data-[selected]:border-b-interactive-9"
              {...apiTabs().getTriggerProps({ value: 'accepted-revisions' })}
            >
              History{' '}
              <Show fallback={<IconSpinner class="w-4 h-4 animate-spin" />} when={queryListAcceptedRevisions?.data}>
                ({queryListAcceptedRevisions?.data?.length})
              </Show>
            </button>
            <button
              class="disabled:opacity-50 data-[selected]:text-interactive-11 data-[selected]:underline xs:data-[selected]:no-underline p-2 xs:pb-2 xs:pt-0.5 font-semibold text-2xs text-neutral-11 xs:data-[selected]:border-b-2 xs:border-b-2 xs:border-transparent xs:data-[selected]:border-b-interactive-9"
              {...apiTabs().getTriggerProps({ value: 'discussion', disabled: !currentUser()?.address ? true : false })}
            >
              Discussion
            </button>
            <Button
              intent="neutral-outline"
              scale="xs"
              class="mx-auto w-[fit-content] xs:w-auto xs:mie-0 mb-4 mt-2 xs:mt-0 xs:mb-1 inline-flex items-center"
              {...apiTabs().getTriggerProps({ value: 'propose' })}
            >
              <IconPlus class="w-4 h-4" />
              <span class="text-[0.85em] pis-1ex">Propose new revision</span>
            </Button>
          </div>
        </div>

        <div class="container pt-12 mx-auto">
          <div {...apiTabs().getContentProps({ value: 'about' })}>
            <div class="flex w-full relative container gap-x-12 mx-auto flex-col md:flex-row-reverse">
              <div class="w-full md:w-72 md:sticky md:h-[fit-content] md:top-14">
                <section>
                  <div class="w-full border bg-accent-1 divide-y divide-neutral-6 rounded-md border-neutral-7 mb-8">
                    <div {...apiAccordionDetails().getItemProps({ value: 'curator-notes' })}>
                      <div class="text-2xs flex relative p-2 font-bold focus-within:ring focus-within:bg-neutral-2">
                        <h2>Curator's notes</h2>
                        <button
                          class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                          {...apiAccordionDetails().getTriggerProps({ value: 'curator-notes' })}
                        >
                          Toggle "Contributors" section
                        </button>
                      </div>

                      <div
                        class="text-ellispis overflow-hidden pb-6 px-3 text-2xs space-y-1"
                        {...apiAccordionDetails().getContentProps({ value: 'curator-notes' })}
                      >
                        <figure class="text-xs whitespace-pre-line">
                          <blockquote class="italic text-accent-10">"{local.transcription?.data?.notes}"</blockquote>
                          <figcaption class="text-2xs font-medium pt-2 text-neutral-10">
                            <Identity
                              address={local.transcription?.data?.creator as `0x${string}`}
                              shortenOnFallback={true}
                            />
                          </figcaption>
                        </figure>
                      </div>
                    </div>

                    <div {...apiAccordionDetails().getItemProps({ value: 'contributors' })}>
                      <div class="text-2xs flex relative p-2 font-bold focus-within:ring focus-within:bg-neutral-2">
                        <h2>Contributors</h2>
                        <button
                          class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                          {...apiAccordionDetails().getTriggerProps({ value: 'contributors' })}
                        >
                          Toggle "Contributors" section
                        </button>
                      </div>

                      <div
                        class="text-ellispis overflow-hidden pb-6 px-3 text-2xs space-y-1"
                        {...apiAccordionDetails().getContentProps({ value: 'contributors' })}
                      >
                        <ul class="text-ellispis overflow-hidden flex flex-col space-y-1.5">
                          <For each={local.transcription?.data?.contributors}>
                            {(contributor) => (
                              <li class="text-ellispis overflow-hidden">
                                {<Identity address={contributor} shortenOnFallback={true} />}{' '}
                                <span class="text-[0.9em] font-medium italic text-accent-9">&nbsp;(core)</span>
                              </li>
                            )}
                          </For>
                          <For each={queryListAcceptedRevisions?.data}>
                            {(revision) => (
                              <li class="text-ellispis overflow-hidden">
                                {<Identity address={revision[2]} shortenOnFallback={true} />}{' '}
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div class="grow">
                <div class="max-w-prose w-full">
                  <section>
                    <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">
                      Plain-text transcription
                    </h2>
                    <Show
                      fallback={
                        <>
                          <p class="italic text-neutral-8">No plain-text transcription was provided.</p>
                        </>
                      }
                      when={
                        local.transcription?.data?.transcription_plain_text?.length > 0 &&
                        local.transcription?.data?.transcription_plain_text !== null
                      }
                    >
                      <div class="whitespace-pre-line">{local.transcription?.data?.transcription_plain_text}</div>
                    </Show>
                  </section>
                  <section class="pt-8">
                    <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Files</h2>
                    <p class="text-neutral-11 text-2xs pb-4">
                      You can preview the files in a new tab or download them for free.
                    </p>
                    <ul class="grid xs:grid-cols-3 gap-3">
                      <li class="flex flex-col p-3 items-center justify-center bg-neutral-1 border border-neutral-6 rounded-md">
                        <IconDocumentArrowDown class="w-8 text-interactive-12 h-8" />
                        <div class="text-2xs text-center">
                          <p class="font-mono font-bold text-interactive-11">.srt</p>
                          <p class="italic text-neutral-11 text-[0.85em] pb-2">Synchronized captions for video files</p>
                          <Show
                            fallback={<p class="font-medium text-neutral-8 italic text-2xs">No file provided</p>}
                            when={
                              local.transcription?.data?.srt_file_uri !== null &&
                              (local.transcription?.data?.srt_file_uri?.length as number) > 0
                            }
                          >
                            <a
                              class="text-[0.75em] link"
                              href={web3UriToUrl(local.transcription?.data?.srt_file_uri as string)}
                              target="_blank"
                            >
                              Open in a new tab
                            </a>
                            <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                            <button
                              type="button"
                              onClick={async () => {
                                await downloadFile({
                                  filename: `${local.transcription?.data?.slug}.srt`,
                                  uri: web3UriToUrl(local.transcription?.data?.srt_file_uri as string),
                                })
                              }}
                              class={callToAction({
                                intent: 'interactive-faint',
                                scale: 'xs',
                              })}
                            >
                              Download
                            </button>
                          </Show>
                        </div>
                      </li>
                      <li class="flex flex-col p-3 items-center justify-center bg-neutral-1 border border-neutral-6 rounded-md">
                        <IconDocumentArrowDown class="w-8 text-interactive-12 h-8" />
                        <div class="text-2xs text-center">
                          <p class="font-mono font-bold text-interactive-11">.vtt</p>
                          <p class="italic text-neutral-11 text-[0.85em] pb-2">
                            Synchronized captions for web video files
                          </p>
                          <Show
                            fallback={<p class="font-medium text-neutral-8 italic text-2xs">No file provided</p>}
                            when={
                              local.transcription?.data?.vtt_file_uri !== null &&
                              (local.transcription?.data?.vtt_file_uri?.length as number) > 0
                            }
                          >
                            <a
                              class="text-[0.75em] link"
                              href={web3UriToUrl(local.transcription?.data?.vtt_file_uri as string)}
                              target="_blank"
                            >
                              Open in a new tab
                            </a>
                            <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                            <button
                              type="button"
                              onClick={async () => {
                                await downloadFile({
                                  filename: `${local.transcription?.data?.slug}.vtt`,
                                  uri: web3UriToUrl(local.transcription?.data?.vtt_file_uri as string),
                                })
                              }}
                              class={callToAction({
                                intent: 'interactive-faint',
                                scale: 'xs',
                              })}
                            >
                              Download
                            </button>
                          </Show>
                        </div>
                      </li>
                      <li class="flex flex-col p-3 items-center justify-center bg-neutral-1 border border-neutral-6 rounded-md">
                        <IconDocumentArrowDown class="w-8 text-interactive-12 h-8" />
                        <div class="text-2xs text-center">
                          <p class="font-mono font-bold text-interactive-11">.lrc</p>
                          <p class="italic text-neutral-11 text-[0.85em] pb-2">Synchronized captions for audio files</p>
                          <Show
                            fallback={<p class="font-medium text-neutral-8 italic text-2xs">No file provided</p>}
                            when={
                              local.transcription?.data?.lrc_file_uri !== null &&
                              (local.transcription?.data?.lrc_file_uri?.length as number) > 0
                            }
                          >
                            <a
                              class="text-[0.75em] link"
                              href={web3UriToUrl(local.transcription?.data?.lrc_file_uri as string)}
                              target="_blank"
                            >
                              Open in a new tab
                            </a>
                            <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                            <button
                              type="button"
                              onClick={async () => {
                                await downloadFile({
                                  filename: `${local.transcription?.data?.slug}.lrc`,
                                  uri: web3UriToUrl(local.transcription?.data?.lrc_file_uri as string),
                                })
                              }}
                              class={callToAction({
                                intent: 'interactive-faint',
                                scale: 'xs',
                              })}
                            >
                              Download
                            </button>
                          </Show>
                        </div>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>
          <div {...apiTabs().getContentProps({ value: 'accepted-revisions' })}>
            <h2 class="pb-4 text-2xs uppercase tracking-wide text-accent-9 font-bold">
              Accepted revisions{' '}
              <Show fallback={<IconSpinner class="w-4 h-4 animate-spin" />} when={queryListAcceptedRevisions?.data}>
                ({queryListAcceptedRevisions?.data?.length})
              </Show>
            </h2>
            <Switch>
              <Match when={queryListAcceptedRevisions?.isLoading}>
                <p>Loading revisions...</p>
              </Match>
              <Match when={queryListAcceptedRevisions?.isSuccess && queryListAcceptedRevisions?.data}>
                <ListRevisions
                  contributors={local?.transcription?.data?.contributors}
                  query={queryListAcceptedRevisions}
                />
              </Match>
            </Switch>
          </div>

          <div {...apiTabs().getContentProps({ value: 'proposed-revisions' })}>
            <h2 class="pb-4 text-2xs uppercase tracking-wide text-accent-9 font-bold">
              Proposed revisions{' '}
              <Show
                fallback={<IconSpinner class="w-4 h-4 animate-spin" />}
                when={queryListReceivedProposedRevisions?.data}
              >
                ({queryListReceivedProposedRevisions?.data?.length})
              </Show>
            </h2>
            <Switch>
              <Match when={queryListReceivedProposedRevisions?.isLoading}>
                <p>Loading propositions...</p>
              </Match>
              <Match when={queryListReceivedProposedRevisions?.isSuccess && queryListReceivedProposedRevisions?.data}>
                <ListRevisions
                  contributors={local?.transcription?.data?.contributors}
                  query={queryListReceivedProposedRevisions}
                />
              </Match>
            </Switch>
          </div>

          <div
            {...apiTabs().getContentProps({ value: 'discussion', disabled: !currentUser()?.address ? true : false })}
          >
            <Show when={local.transcription.data?.slug}>
              <Discussion id={local.transcription.data?.slug as string} />
            </Show>
          </div>

          <div {...apiTabs().getContentProps({ value: 'propose', disabled: !local?.transcription?.data })}>
            <Show when={local?.transcription?.data}>
              <ProposeNewRevision transcription={local?.transcription as Accessor<Transcription>} />
            </Show>
          </div>
        </div>
      </div>
      <section class="mt-16 sm:text-center bg-neutral-1 border border-neutral-6 p-6">
        <div class="max-w-prose mx-auto">
          <h3 class="text-lg mb-1 font-serif font-semibold text-accent-12">Rate this transcription</h3>
          <p class="mb-4 text-neutral-11 text-sm"></p>
          <Show
            fallback={
              <>
                <span class="flex text-2xs text-accent-11 items-center justify-center">
                  Average rating: {local.transcription?.data?.average_rating ?? 0}/5
                </span>
                <p class="text-center justify-center flex items-center pt-2 font-semibold text-[0.725em] text-accent-9">
                  <IconExclamationCircle class="mie-1ex w-4 h-4" />
                  Connect your wallet to rate this transcription.
                </p>
              </>
            }
            when={currentUser()?.address}
          >
            <Rate
              currentUserInitialRating={currentUserRating()}
              idTranscription={local?.transcription?.data?.transcription_id as string}
              averageRating={local.transcription?.data?.average_rating ?? 0}
            />
          </Show>
        </div>
      </section>
    </>
  )
}

export default TranscriptionDetails
