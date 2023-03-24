import { For, Match, Show, Switch } from 'solid-js'
import { useParams } from 'solid-start'
import { isAddress } from 'viem'
import { CHAINS_ALIAS } from '~/config'
import { callToAction } from '~/design-system'
import { web3UriToUrl } from '~/helpers'
import { useAuthentication } from '~/hooks'
import { Button, IconDocumentArrowDown, Identity } from '~/ui'
import { useDetails as useRevisionDetails } from '../useDetails'
import { useDetails as useTranscriptionDetails } from './useDetails'

import useRevisionActions from './useRevisionActions'

export const RevisionDetails = (props) => {
  const params = useParams()
  const { currentUser, currentNetwork, mutationSwitchNetwork } = useAuthentication()
  const { downloadFile } = useTranscriptionDetails()

  const { apiAccordionDetails } = useRevisionDetails()
  const {
    mutationWriteAcceptRevision,
    mutationTxWaitAcceptRevision,
    mutationWriteRejectRevision,
    mutationTxWaitRejectRevision,
  } = useRevisionActions()

  return (
    <>
      <div>
        <div class="text-start block w-full">
          <p class="font-medium whitespace-pre pb-6 text-sm text-accent-12">{props.query?.data?.change_description}</p>
          <p class="italic text-neutral-11 text-2xs">
            <span class="not:last:after:content-[','] font-semibold text-accent-10">
              <Show when={props.query?.data?.transcription_plain_text?.trim()?.length > 0}>
                <span>Plain text transcription ;&nbsp;</span>
              </Show>
              <Show when={props.query?.data?.srt_file_uri?.trim()?.length > 0}>
                <span>.srt file ;&nbsp;</span>
              </Show>
              <Show when={props.query?.data?.vtt_file_uri?.trim()?.length > 0}>
                <span>.vtt file ;&nbsp;</span>
              </Show>
              <Show when={props.query?.data?.lrc_file_uri?.trim()?.length > 0}>
                <span>.lrc file ;&nbsp;</span>
              </Show>
            </span>
            proposed by <Identity shortenOnFallback={true} address={props.query?.data?.creator} />{' '}
          </p>
          <p class="pt-2 pb-4 flex flex-wrap gap-2">
            <For each={props.query?.data?.change_type}>
              {(type) => (
                <mark class="leading-none font-medium text-[0.8em] py-[0.25em] px-[0.5em] rounded-md bg-accent-1 border-accent-6 text-accent-11 border">
                  {type}
                </mark>
              )}
            </For>
          </p>
          <div
            class="-mx-3 xs:-mx-4 divide-y divide-neutral-6 border-t border-neutral-6"
            {...apiAccordionDetails().rootProps}
          >
            <div {...apiAccordionDetails().getItemProps({ value: 'text-transcription' })}>
              <h3>
                <button
                  class="disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-neutral-11 text-2xs flex w-full p-3"
                  {...apiAccordionDetails().getTriggerProps({
                    disabled: props.query?.data?.transcription_plain_text?.trim()?.length === 0,
                    value: 'text-transcription',
                  })}
                >
                  Plain-text transcription{' '}
                  <Show when={props.query?.data?.transcription_plain_text?.trim()?.length === 0}>
                    <span class="italic">(not provided)</span>
                  </Show>
                </button>
              </h3>
              <div
                class="pb-2 whitespace-pre px-4"
                {...apiAccordionDetails().getContentProps({ value: 'text-transcription' })}
              >
                {props.query?.data?.transcription_plain_text}
              </div>
            </div>
            <div {...apiAccordionDetails().getItemProps({ value: 'files' })}>
              <h3>
                <button
                  class="font-semibold text-neutral-11 text-2xs flex w-full p-3"
                  {...apiAccordionDetails().getTriggerProps({ value: 'files' })}
                >
                  Files
                </button>
              </h3>
              <div class="pb-2 px-4" {...apiAccordionDetails().getContentProps({ value: 'files' })}>
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
                          props.query?.data.srt_file_uri !== null &&
                          (props.query?.data.srt_file_uri?.length as number) > 0
                        }
                      >
                        <a
                          class="text-[0.75em] link"
                          href={web3UriToUrl(props.query?.data.srt_file_uri as string)}
                          target="_blank"
                        >
                          Open in a new tab
                        </a>
                        <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                        <button
                          type="button"
                          onClick={async () => {
                            await downloadFile({
                              filename: `${props.query?.data.slug}.srt`,
                              uri: web3UriToUrl(props.query?.data.srt_file_uri as string),
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
                      <p class="italic text-neutral-11 text-[0.85em] pb-2">Synchronized captions for web video files</p>
                      <Show
                        fallback={<p class="font-medium text-neutral-8 italic text-2xs">No file provided</p>}
                        when={
                          props.query?.data.vtt_file_uri !== null &&
                          (props.query?.data.vtt_file_uri?.length as number) > 0
                        }
                      >
                        <a
                          class="text-[0.75em] link"
                          href={web3UriToUrl(props.query?.data.vtt_file_uri as string)}
                          target="_blank"
                        >
                          Open in a new tab
                        </a>
                        <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                        <button
                          type="button"
                          onClick={async () => {
                            await downloadFile({
                              filename: `${props.query?.data.slug}.vtt`,
                              uri: web3UriToUrl(props.query?.data.vtt_file_uri as string),
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
                          props.query?.data.lrc_file_uri !== null &&
                          (props.query?.data.lrc_file_uri?.length as number) > 0
                        }
                      >
                        <a
                          class="text-[0.75em] link"
                          href={web3UriToUrl(props.query?.data.lrc_file_uri as string)}
                          target="_blank"
                        >
                          Open in a new tab
                        </a>
                        <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                        <button
                          type="button"
                          onClick={async () => {
                            await downloadFile({
                              filename: `${props.query?.data.slug}.lrc`,
                              uri: web3UriToUrl(props.query?.data.lrc_file_uri as string),
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
              </div>
            </div>
          </div>
          <Show when={currentUser()?.address && props?.query?.data?.state === 0}>
            <div class="border-t -mx-3 xs:-mx-4 px-4 border-neutral-5">
              <Switch>
                <Match when={!currentUser()?.address}>
                  <p class="italic text-center text-neutral-9 text-2xs">Sign-in to reveal more actions</p>
                </Match>
                <Match
                  //@ts-ignore
                  when={isAddress(currentUser()?.address) && currentNetwork()?.id !== CHAINS_ALIAS[params.chain]}
                >
                  <div class="animate-appear text-start xs:text-center mt-6 mb-4 font-medium text-2xs bg-secondary-3 py-2 rounded-md mx-auto w-fit-content px-4 text-secondary-11">
                    <p>You're on a different network than the original request - switch to the right network below.</p>
                    <Button
                      disabled={mutationSwitchNetwork.isLoading}
                      isLoading={mutationSwitchNetwork.isLoading}
                      onClick={async () => {
                        //@ts-ignore
                        await mutationSwitchNetwork.mutateAsync(CHAINS_ALIAS[params.chain])
                      }}
                      intent="neutral-on-light-layer"
                      scale="xs"
                      class="mx-auto mt-2 flex items-center"
                    >
                      <span
                        classList={{
                          'pis-1ex': mutationSwitchNetwork.isLoading,
                        }}
                      >
                        Switch network
                      </span>
                    </Button>
                  </div>
                </Match>
                <Match
                  when={
                    currentUser()?.address &&
                    currentNetwork()?.id === CHAINS_ALIAS[params.chain] &&
                    props?.query?.data?.state === 0
                  }
                >
                  <div class="pt-4 flex gap-y-4 gap-x-2 flex-col xs:flex-row">
                    <Button
                      onClick={async () =>
                        await mutationWriteAcceptRevision.mutateAsync({
                          idRevision: props.query?.data?.id_revision,
                        })
                      }
                      class="flex items-center"
                      type="button"
                      isLoading={[
                        mutationTxWaitAcceptRevision?.isLoading,
                        mutationWriteAcceptRevision.isLoading,
                      ].includes(true)}
                      disabled={
                        !props.query?.data?.reviewers?.includes(currentUser()?.address) ||
                        [
                          mutationTxWaitAcceptRevision.isSuccess,
                          mutationTxWaitRejectRevision.isSuccess,
                          mutationTxWaitAcceptRevision?.isLoading,
                          mutationTxWaitRejectRevision.isLoading,
                          mutationWriteRejectRevision.isLoading,
                          mutationWriteAcceptRevision.isLoading,
                        ].includes(true)
                      }
                      scale="xs"
                      intent="primary-faint"
                    >
                      <span
                        classList={{
                          'pis-1ex': [
                            mutationTxWaitAcceptRevision?.isLoading,
                            mutationWriteAcceptRevision.isLoading,
                          ].includes(true),
                        }}
                      >
                        <Switch fallback="Accept">
                          <Match when={mutationWriteAcceptRevision.isLoading}>Sign message...</Match>
                          <Match when={mutationTxWaitAcceptRevision.isLoading}>Accepting...</Match>
                          <Match when={mutationTxWaitAcceptRevision.isError}>Try accepting again</Match>
                          <Match when={mutationTxWaitAcceptRevision.isSuccess}>Accepted !</Match>
                        </Switch>
                      </span>
                    </Button>

                    <Button
                      onClick={async () =>
                        await mutationWriteRejectRevision.mutateAsync({
                          idRevision: props.query?.data?.id_revision,
                        })
                      }
                      type="button"
                      class="flex items-center"
                      isLoading={[
                        mutationTxWaitRejectRevision.isLoading,
                        mutationWriteRejectRevision.isLoading,
                      ].includes(true)}
                      disabled={
                        !props.query?.data?.reviewers?.includes(currentUser()?.address) ||
                        [
                          mutationTxWaitAcceptRevision.isSuccess,
                          mutationTxWaitRejectRevision.isSuccess,
                          mutationTxWaitAcceptRevision?.isLoading,
                          mutationTxWaitRejectRevision.isLoading,
                          mutationWriteRejectRevision.isLoading,
                          mutationWriteAcceptRevision.isLoading,
                        ].includes(true)
                      }
                      scale="xs"
                      intent="negative-ghost"
                    >
                      <span
                        classList={{
                          'pis-1ex': [
                            mutationTxWaitRejectRevision.isLoading,
                            mutationWriteRejectRevision.isLoading,
                          ].includes(true),
                        }}
                      >
                        <Switch fallback="Reject">
                          <Match when={mutationWriteRejectRevision.isLoading}>Sign message...</Match>
                          <Match when={mutationTxWaitRejectRevision.isLoading}>Rejecting...</Match>
                          <Match when={mutationTxWaitRejectRevision.isError}>Try rejecting again</Match>
                          <Match when={mutationTxWaitRejectRevision.isSuccess}>Rejected !</Match>
                        </Switch>
                      </span>
                    </Button>
                  </div>
                </Match>
              </Switch>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}

export default RevisionDetails
