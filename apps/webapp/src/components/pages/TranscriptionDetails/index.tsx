import { For, Show, splitProps } from 'solid-js'
import { LOCALES, ROUTE_TRANSCRIPTION_REVISION_NEW } from '~/config'
import type { Transcription } from '~/services'
import type { Resource } from 'solid-js'
import useDetails from './useDetails'
import { format, isDate } from 'date-fns'
import { web3UriToUrl } from '~/helpers'
import { IconDocumentArrowDown, Identity } from '~/ui'
import { callToAction } from '~/design-system'
import { A } from '@solidjs/router'

interface TranscriptionDetailsProps {
  transcription: Resource<Transcription>
}
export const TranscriptionDetails = (props: TranscriptionDetailsProps) => {
  const [local] = splitProps(props, ['transcription'])
  const { apiAccordionDetails, downloadFile } = useDetails()

  return (
    <>
      <div class="border-b border-neutral-4">
        <div class="container mx-auto pb-6">
          <h1 class="text-2xl text-accent-12 font-bold">{local.transcription()?.title}</h1>
          <section class="text-2xs pt-3">
            <p class="text-neutral-11">
              Original media title:{' '}
              <span class="font-medium text-accent-11">"{local.transcription()?.source_media_title}"</span>
            </p>
            <p class="text-neutral-11 pt-1">
              Language: <span class="font-medium text-accent-11">{LOCALES?.[local.transcription()?.language]}</span>
            </p>
            <div class="flex flex-wrap pt-1">
              <span class="text-neutral-11">Keywords:&nbsp;</span>
              <ul class="flex flex-wrap gap-2">
                <For each={local.transcription()?.keywords}>
                  {(keyword) => (
                    <li class="leading-none font-medium text-[0.8em] py-[0.25em] px-[0.5em] rounded-md bg-accent-1 border-accent-6 text-accent-11 border">
                      {keyword}
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </section>
        </div>
      </div>
      <div class="flex w-full pt-8 relative container gap-x-12 mx-auto flex-col md:flex-row-reverse">
        <div class="w-full md:w-72 md:sticky md:h-[fit-content] md:top-14">
          <section>
            <div class="w-full border bg-accent-1 divide-y divide-neutral-6 rounded-md border-neutral-7 mb-8">
              <div {...apiAccordionDetails().getItemProps({ value: 'contribute' })}>
                <div class="text-2xs flex relative p-2 font-bold focus-within:ring focus-within:bg-neutral-2">
                  <h2>Contribute</h2>
                  <button
                    class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                    {...apiAccordionDetails().getTriggerProps({ value: 'contribute' })}
                  >
                    Toggle "Contribute" section
                  </button>
                </div>

                <div
                  class="text-ellispis overflow-hidden pb-6 px-3 text-2xs space-y-1"
                  {...apiAccordionDetails().getContentProps({ value: 'contribute' })}
                >
                  <p class="text-neutral-11 pt-1 pb-2 text-2xs">
                    You can contribute to making online media more accessible directly on Grimoire.
                  </p>
                  <A
                    href={ROUTE_TRANSCRIPTION_REVISION_NEW.replace('[idTranscription]', local.transcription()?.id)}
                    class={callToAction({
                      intent: 'primary-outline',
                      scale: 'sm',
                      class: 'w-full block text-center',
                    })}
                  >
                    Help improve this transcription
                  </A>
                </div>
              </div>

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
                    <blockquote class="italic text-accent-10">"{local.transcription()?.notes}"</blockquote>
                    <figcaption class="text-2xs font-medium pt-2 text-neutral-10">
                      <Identity address={local.transcription()?.creator as `0x${string}`} shortenOnFallback={true} />
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
                    <For each={local.transcription()?.contributors}>
                      {(contributor) => <li class="text-ellispis overflow-hidden">{contributor}</li>}
                    </For>
                  </ul>
                </div>
              </div>

              <div {...apiAccordionDetails().getItemProps({ value: 'activity' })}>
                <div class="text-2xs flex relative p-2 font-bold focus-within:ring focus-within:bg-neutral-2">
                  <h2>Activity</h2>
                  <button
                    class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                    {...apiAccordionDetails().getTriggerProps({ value: 'activity' })}
                  >
                    Toggle "Activity" section
                  </button>
                </div>

                <div
                  class="pb-6 px-3 text-2xs space-y-1"
                  {...apiAccordionDetails().getContentProps({ value: 'activity' })}
                >
                  <p class="text-neutral-11">
                    Created:&nbsp;
                    <Show fallback="--" when={isDate(local.transcription()?.created_at_datetime)}>
                      <span class="font-medium text-accent-11">
                        {format(local.transcription()?.created_at_datetime as Date, 'MMMM do yyyy, pppp')}
                      </span>
                    </Show>
                  </p>
                  <p class="text-neutral-11">
                    Last update:&nbsp;
                    <Show fallback="--" when={isDate(local.transcription()?.last_updated_at_datetime)}>
                      <span class="font-medium text-accent-11">
                        {format(local.transcription()?.last_updated_at_datetime as Date, 'MMMM do yyyy, pppp')}
                      </span>
                    </Show>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="grow">
          <div class="max-w-prose w-full">
            <section>
              <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Plain-text transcription</h2>
              <Show
                fallback={
                  <>
                    <p class="italic text-neutral-8">No plain-text transcription was provided.</p>
                  </>
                }
                when={
                  local.transcription()?.transcription_plain_text?.length > 0 &&
                  local.transcription()?.transcription_plain_text !== null
                }
              >
                <div class="whitespace-pre-line">{local.transcription()?.transcription_plain_text}</div>
              </Show>
            </section>
            <section class="pt-8">
              <h2 class="pb-1 text-2xs uppercase tracking-wide text-accent-9 font-bold">Files</h2>
              <p class="text-neutral-11 text-2xs pb-4">
                You can preview the files in a new tab or download them for free.
              </p>
              <ul class="grid xs:grid-cols-3 gap-3">
                <li class="flex flex-col p-3 items-center justify-center bg-neutral-1 border border-neutral-6 rounded-md">
                  <Show
                    when={
                      local.transcription()?.srt_file_uri !== null &&
                      (local.transcription()?.srt_file_uri?.length as number) > 0
                    }
                  >
                    <IconDocumentArrowDown class="w-8 text-interactive-12 h-8" />
                    <div class="text-2xs text-center">
                      <p class="font-mono font-bold text-interactive-11">.srt</p>
                      <p class="italic text-neutral-11 text-[0.85em] pb-2">Synchronized captions for video files</p>
                      <a
                        class="text-[0.75em] link"
                        href={web3UriToUrl(local.transcription()?.srt_file_uri as string)}
                        target="_blank"
                      >
                        Open in a new tab
                      </a>
                      <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                      <button
                        type="button"
                        onClick={async () => {
                          await downloadFile({
                            filename: `${local.transcription()?.slug}.srt`,
                            uri: web3UriToUrl(local.transcription()?.srt_file_uri as string),
                          })
                        }}
                        class={callToAction({
                          intent: 'interactive-faint',
                          scale: 'xs',
                        })}
                      >
                        Download
                      </button>
                    </div>
                  </Show>
                </li>
                <li class="flex flex-col p-3 items-center justify-center bg-neutral-1 border border-neutral-6 rounded-md">
                  <Show
                    when={
                      local.transcription()?.vtt_file_uri !== null &&
                      (local.transcription()?.vtt_file_uri?.length as number) > 0
                    }
                  >
                    <IconDocumentArrowDown class="w-8 text-interactive-12 h-8" />
                    <div class="text-2xs text-center">
                      <p class="font-mono font-bold text-interactive-11">.vtt</p>
                      <p class="italic text-neutral-11 text-[0.85em] pb-2">Synchronized captions for web video files</p>
                      <a
                        class="text-[0.75em] link"
                        href={web3UriToUrl(local.transcription()?.vtt_file_uri as string)}
                        target="_blank"
                      >
                        Open in a new tab
                      </a>
                      <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                      <button
                        type="button"
                        onClick={async () => {
                          await downloadFile({
                            filename: `${local.transcription()?.slug}.vtt`,
                            uri: web3UriToUrl(local.transcription()?.vtt_file_uri as string),
                          })
                        }}
                        class={callToAction({
                          intent: 'interactive-faint',
                          scale: 'xs',
                        })}
                      >
                        Download
                      </button>
                    </div>
                  </Show>
                </li>
                <li class="flex flex-col p-3 items-center justify-center bg-neutral-1 border border-neutral-6 rounded-md">
                  <Show
                    when={
                      local.transcription()?.lrc_file_uri !== null &&
                      (local.transcription()?.lrc_file_uri?.length as number) > 0
                    }
                  >
                    <IconDocumentArrowDown class="w-8 text-interactive-12 h-8" />
                    <div class="text-2xs text-center">
                      <p class="font-mono font-bold text-interactive-11">.lrc</p>
                      <p class="italic text-neutral-11 text-[0.85em] pb-2">Synchronized captions for audio files</p>
                      <a
                        class="text-[0.75em] link"
                        href={web3UriToUrl(local.transcription()?.lrc_file_uri as string)}
                        target="_blank"
                      >
                        Open in a new tab
                      </a>
                      <p class="text-[0.65em] text-neutral-9 py-1">or</p>
                      <button
                        type="button"
                        onClick={async () => {
                          await downloadFile({
                            filename: `${local.transcription()?.slug}.lrc`,
                            uri: web3UriToUrl(local.transcription()?.lrc_file_uri as string),
                          })
                        }}
                        class={callToAction({
                          intent: 'interactive-faint',
                          scale: 'xs',
                        })}
                      >
                        Download
                      </button>
                    </div>
                  </Show>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default TranscriptionDetails
