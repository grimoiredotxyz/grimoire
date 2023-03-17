import { ethers } from 'ethers'
import { createEffect, Match, Show, splitProps, Switch } from 'solid-js'
import {
  Button,
  FormTextarea,
  FormInput,
  IconFolderOpen,
  FormInputSwitch,
  Combobox,
  FormTagsInput,
  IconPencilSquare,
  IconArrowDownSquare,
} from '~/ui'
import FormField from '~/ui/FormField'
import { useAuthentication } from '~/hooks/useAuthentication'

interface FormNewTranscriptionProps {
  apiAccordion: any
  apiCollaborators: any
  apiComboboxLanguage: any
  apiTabs: any
  apiKeywords: any
  apiSourcesMediaUris: any
  comboboxLanguageOptions: any
  isError: boolean
  isLoading: boolean
  isSuccess: boolean
  storeForm: any
}

export const FormNewTranscription = (props: FormNewTranscriptionProps) => {
  //@ts-ignore
  const { currentUser, currentNetwork } = useAuthentication()
  const [local] = splitProps(props, ['storeForm', 'apiAccordion', 'apiTabs', 'isLoading', 'isError', 'isSuccess'])
  //@ts-ignore
  const { form } = local.storeForm

  return (
    <>
      {/* @ts-ignore */}
      <Show when={!ethers.utils.isAddress(currentUser()?.address)}>
        <p class="animate-appear text-start xs:text-center mt-6 mb-4 font-medium text-2xs bg-secondary-3 py-2 rounded-md mx-auto w-fit-content px-4 text-secondary-11">
          Sign-in to start creating transcriptions.
        </p>
      </Show>
      {/* @ts-ignore */}
      <form use:form>
        <div class="border bg-accent-1 divide-y divide-neutral-4 rounded-md border-neutral-4 mb-8">
          <fieldset
            {...local
              .apiAccordion()
              .getItemProps({ value: 'source', disabled: !ethers.utils.isAddress(currentUser()?.address) })}
          >
            <div class="flex relative p-3 font-bold focus-within:ring focus-within:bg-neutral-2">
              <span
                classList={{
                  'text-accent-11': local.apiAccordion().value.includes('source'),
                  'text-accent-6': !local.apiAccordion().value.includes('source'),
                }}
                class="pie-1ex"
              >
                #1.
              </span>
              <legend>Source media</legend>
              <button
                class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                {...local
                  .apiAccordion()
                  .getTriggerProps({ value: 'source', disabled: !ethers.utils.isAddress(currentUser()?.address) })}
              >
                Toggle "Source" section
              </button>
            </div>

            <div
              class="pb-6 px-3 sm:px-6 space-y-4"
              {...local
                .apiAccordion()
                .getContentProps({ value: 'source', disabled: !ethers.utils.isAddress(currentUser()?.address) })}
            >
              <FormField>
                <FormField.InputField>
                  <FormField.Label
                    hasError={local.storeForm.errors()?.source_media_uris?.length > 0 ? true : false}
                    for="source_media_uris"
                  >
                    Source material link
                  </FormField.Label>
                  <FormField.Description id="source_media_uris-description">
                    A link to the source material of your media (video/audio). Your link can be valid URI starting with{' '}
                    <code>ipfs://</code> (IPFS), <code>ar://</code> (Arweave), or a valid URL starting with{' '}
                    <code>https://</code>.{' '}
                  </FormField.Description>
                  <FormTagsInput
                    placeholder="Type or paste the source and press 'Enter'..."
                    classWrapper="w-full"
                    api={props.apiSourcesMediaUris}
                  />
                </FormField.InputField>
              </FormField>

              <FormField>
                <FormField.InputField>
                  <FormField.Label
                    hasError={local.storeForm.errors()?.source_media_title?.length > 0 ? true : false}
                    for="source_media_title"
                  >
                    Source material title
                  </FormField.Label>
                  <FormField.Description id="source_media_title-description">
                    The title of the source material.
                  </FormField.Description>
                  <FormInput
                    placeholder="eg: Rollups for noobs"
                    name="source_media_title"
                    id="source_media_title"
                    hasError={local.storeForm.errors()?.source_media_title?.length > 0 ? true : false}
                  />
                </FormField.InputField>
              </FormField>
            </div>
          </fieldset>
          <fieldset
            class="disabled:opacity-50 disabled:cursor-not-allowed"
            {...local.apiAccordion().getItemProps({
              value: 'info',
              disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
            })}
          >
            <div class="flex relative p-3 font-bold focus-within:ring focus-within:bg-neutral-2">
              <span
                classList={{
                  'text-accent-11': local.apiAccordion().value.includes('info'),
                  'text-accent-6': !local.apiAccordion().value.includes('info'),
                }}
                class="pie-1ex"
              >
                #2.
              </span>

              <legend>About</legend>
              <button
                class="absolute disabled:cursor-not-allowed z-10 inset-0 w-full h-full opacity-0"
                {...local.apiAccordion().getTriggerProps({
                  value: 'info',
                  disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                })}
              >
                Toggle "Info" section
              </button>
            </div>
            <div
              class="pt-1.5 space-y-4 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'info',
                disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
              })}
            >
              <FormField>
                <FormField.InputField>
                  <FormField.Label hasError={local.storeForm.errors()?.title?.length > 0 ? true : false} for="title">
                    Title
                  </FormField.Label>
                  <FormField.Description id="title-description">The title of your transcription.</FormField.Description>
                  <FormInput
                    placeholder="eg: Rollups for noobs"
                    name="title"
                    id="title"
                    hasError={local.storeForm.errors()?.title?.length > 0 ? true : false}
                  />
                </FormField.InputField>
              </FormField>

              <FormField>
                <FormField.InputField>
                  <Combobox
                    api={props.apiComboboxLanguage}
                    label={
                      <>
                        <FormField.Label
                          hasError={local.storeForm.errors()?.language?.length > 0 ? true : false}
                          for="language"
                        >
                          Language
                        </FormField.Label>
                        <FormField.Description id="language-description">
                          The language used in this transcription.
                        </FormField.Description>
                      </>
                    }
                    hasError={local.storeForm.errors()?.language?.length > 0 ? true : false}
                    options={props.comboboxLanguageOptions}
                  />
                </FormField.InputField>
              </FormField>

              <FormField>
                <FormField.InputField>
                  <FormField.Label
                    hasError={local.storeForm.errors()?.keywords?.length > 0 ? true : false}
                    for="keywords"
                  >
                    Key words
                  </FormField.Label>
                  <FormField.Description id="keywords-description">
                    Additional key words to describe your transcription.
                  </FormField.Description>
                  <FormTagsInput
                    placeholder="Type your tag and press 'Enter'..."
                    classWrapper="w-full"
                    api={props.apiKeywords}
                  />
                </FormField.InputField>
              </FormField>

              <FormField>
                <FormField.InputField>
                  <FormField.Label hasError={local.storeForm.errors()?.notes?.length > 0 ? true : false} for="notes">
                    Your notes about this transcription
                  </FormField.Label>
                  <FormField.Description id="notes-description">
                    Any additional information you want to provide about this transcription.
                  </FormField.Description>
                  <FormTextarea
                    placeholder="eg: Translation of a community call held in English about xyz on March 11th  2023"
                    name="notes"
                    id="notes"
                    rows="5"
                    hasError={local.storeForm.errors()?.notes?.length > 0 ? true : false}
                  />
                </FormField.InputField>
              </FormField>
            </div>
          </fieldset>

          <fieldset
            class="disabled:opacity-50 disabled:cursor-not-allowed"
            {...local.apiAccordion().getItemProps({
              value: 'files',
              disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
            })}
          >
            <div class="flex relative p-3 font-bold focus-within:ring focus-within:bg-neutral-2">
              <span
                classList={{
                  'text-accent-11': local.apiAccordion().value.includes('files'),
                  'text-accent-6': !local.apiAccordion().value.includes('files'),
                }}
                class="pie-1ex"
              >
                #3.
              </span>
              <legend>Transcription & captions</legend>
              <button
                class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                {...local.apiAccordion().getTriggerProps({
                  value: 'transcription',
                  disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                })}
              >
                Toggle "Transcription" section
              </button>
            </div>
            <div
              class="pt-1.5 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'transcription',
                disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
              })}
            >
              <p class="text-2xs text-neutral-11">
                To make your transcription accessible, you can type the plain text version and/or upload 3 different
                type of files: <code class="text-accent-11 font-semibold">.srt</code> and{' '}
                <code class="text-accent-11 font-semibold">.vtt</code> for videos, and{' '}
                <code class="text-accent-11 font-semibold">.lrc</code> for audio.
              </p>
              <p class="text-2xs pt-2 pb-4 text-neutral-11">
                Type the plain text version in the{' '}
                <span class="text-accent-11 font-semibold">"Plain-text version"</span> tab, and upload your files in the{' '}
                <span class="text-accent-11 font-semibold">"Files"</span> tab below.
              </p>
              <div class="border rounded-md border-accent-5 overflow-hidden" {...local.apiTabs().rootProps}>
                <div class="flex divide-i divide-accent-5 border-b border-accent-5" {...local.apiTabs().tablistProps}>
                  <button
                    class="flex items-center bg-accent-1 not:data-[selected]:bg-transparent data-[selected]:bg-white py-2 px-4 font-semibold text-2xs disabled:opacity-50 p-8"
                    {...local.apiTabs().getTriggerProps({
                      value: 'text-version',
                      disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                    })}
                  >
                    <IconPencilSquare stroke-width="2" class="w-[1.2rem] h-[1.2rem] mie-1ex" />
                    Plain-text version
                  </button>
                  <button
                    class="grow-[1] flex items-center bg-accent-1 not:data-[selected]:bg-transparent data-[selected]:bg-white py-2 px-4 font-semibold text-2xs disabled:opacity-50"
                    {...local.apiTabs().getTriggerProps({
                      value: 'files',
                      disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                    })}
                  >
                    <IconArrowDownSquare stroke-width="2" class="w-[1.2rem] h-[1.2rem] mie-1ex" />
                    Files
                  </button>
                </div>
                <div
                  class="p-0.5 xs:p-4 bg-white"
                  {...local.apiTabs().getContentProps({
                    value: 'text-version',
                    disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                  })}
                >
                  <div class="space-y-4 p-3">
                    <FormField>
                      <FormField.InputField>
                        <FormField.Label
                          hasError={local.storeForm.errors()?.transcription_plain_text?.length > 0 ? true : false}
                          for="transcription_plain_text"
                        >
                          Plain-text version
                        </FormField.Label>
                        <FormField.Description id="transcription_plain_text-description">
                          A plain text transcription of your media.
                        </FormField.Description>
                        <FormTextarea
                          placeholder="eg: Hi everyone, today we will discuss what rollups are, starting from the beginning..."
                          name="transcription_plain_text"
                          id="transcription_plain_text"
                          rows="10"
                          hasError={local.storeForm.errors()?.transcription_plain_text?.length > 0 ? true : false}
                        />
                      </FormField.InputField>
                    </FormField>
                    <div class="flex flex-col space-y-2 text-start xs:text-center mt-6 mb-4 font-medium text-2xs bg-accent-3 py-6 rounded-md mx-auto w-fit-content px-4 text-accent-11">
                      <p>Don't forget to add your files (.srt, .vtt, .lrc) in the "Files" tab !</p>
                      <Button
                        class="mx-auto"
                        scale="xs"
                        type="button"
                        intent="neutral-on-light-layer"
                        {...local.apiTabs().getTriggerProps({
                          value: 'files',
                        })}
                      >
                        Open "Files" tab
                      </Button>
                    </div>
                  </div>
                </div>
                <div
                  class="p-0.5 xs:p-4 bg-white"
                  {...local.apiTabs().getContentProps({
                    value: 'files',
                    disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                  })}
                >
                  <div class="space-y-4 p-3">
                    <div class="relative text-center">
                      <FormField>
                        <FormField.Label
                          hasError={local.storeForm.errors()?.srt_file?.length > 0 ? true : false}
                          for="srt_file"
                        >
                          SRT file (captions for video files)
                        </FormField.Label>
                        <p class="text-start pb-4 text-neutral-11 text-2xs">
                          SRT (SubRip Text) files are a commonly used subtitle format. They contain the timing
                          information and text for each subtitle in a video. They can be edited with a basic text
                          editor.
                        </p>
                        <div class="bg-accent-1 border-accent-6 border-dashed border-2 focus-within:ring-4 p-6 rounded-md">
                          <input
                            onChange={(e) => {
                              // local URI
                              //@ts-ignore
                              if (e.currentTarget.files[0] && e.currentTarget.files[0] !== null) {
                                //@ts-ignore
                                const src = URL.createObjectURL(e.currentTarget.files[0])
                                local.storeForm.setData('srt_uri', src)
                              }
                            }}
                            accept=".srt"
                            class="absolute opacity-0 w-full h-full z-10 inset-0"
                            type="file"
                            id="srt_file"
                            name="srt_file"
                          />
                          <Show when={!local.storeForm?.data()?.srt_uri}>
                            <span class="block mb-1.5 text-2xl" aria-hidden="true">
                              🎞️📺📄
                            </span>
                            <span class="italic text-xs text-accent-9">
                              Pick the <code>.srt</code> file
                            </span>
                          </Show>
                          <Show when={!local.storeForm?.data()?.srt_uri && !local.storeForm?.data()?.srt_file}>
                            <IconFolderOpen class="mx-auto text-accent-9 text-opacity-50 mt-4 h-8 w-8" />
                          </Show>
                          <Show when={local.storeForm.data()?.srt_uri}>
                            <span class="block mb-1.5 text-2xl" aria-hidden="true">
                              🎥💻📄
                            </span>
                            <br />
                            <Show when={local.storeForm.data()?.srt_file && local.storeForm.data()?.srt_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">SRT file picked</span>
                              <code class="block font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.srt_file?.name}
                              </code>
                            </Show>
                            <Show when={!local.storeForm?.data()?.srt_file && local.storeForm.data()?.srt_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">
                                SRT file available at this URI:
                              </span>
                              <code class="block italic pb-1.5 font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.srt_uri}
                              </code>
                            </Show>
                          </Show>
                        </div>
                      </FormField>
                    </div>

                    <div class="relative text-center">
                      <FormField>
                        <FormField.Label
                          hasError={local.storeForm.errors()?.vtt_file?.length > 0 ? true : false}
                          for="vtt_file"
                        >
                          VTT file (captions for video files)
                        </FormField.Label>
                        <p class="text-start pb-4 text-neutral-11 text-2xs">
                          VTT (WebVTT) files are used for web-based videos and can include styling and positioning
                          information in addition to the text and timing information. They can be edited with a basic
                          text editor.
                        </p>
                        <div class="bg-accent-1 border-accent-6 border-dashed border-2 focus-within:ring-4 p-6 rounded-md">
                          <input
                            onChange={(e) => {
                              // local URI
                              //@ts-ignore
                              if (e.currentTarget.files[0] && e.currentTarget.files[0] !== null) {
                                //@ts-ignore
                                const src = URL.createObjectURL(e.currentTarget.files[0])
                                local.storeForm.setData('vtt_uri', src)
                              }
                            }}
                            accept=".vtt"
                            class="absolute opacity-0 w-full h-full z-10 inset-0"
                            type="file"
                            id="vtt_file"
                            name="vtt_file"
                          />
                          <Show when={!local.storeForm?.data()?.vtt_uri}>
                            <span class="block mb-1.5 text-2xl" aria-hidden="true">
                              📄
                            </span>
                            <span class="italic text-xs text-accent-9">
                              Pick the <code>.vtt</code> file
                            </span>
                          </Show>
                          <Show when={!local.storeForm?.data()?.vtt_uri && !local.storeForm?.data()?.vtt_file}>
                            <IconFolderOpen class="mx-auto text-accent-9 text-opacity-50 mt-4 h-8 w-8" />
                          </Show>
                          <Show when={local.storeForm.data()?.vtt_uri}>
                            <span class="block mb-1.5 text-2xl" aria-hidden="true">
                              📄
                            </span>
                            <br />
                            <Show when={local.storeForm.data()?.vtt_file && local.storeForm.data()?.vtt_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">VTT file picked</span>
                              <code class="block font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.vtt_file?.name}
                              </code>
                            </Show>
                            <Show when={!local.storeForm?.data()?.vtt_file && local.storeForm.data()?.vtt_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">
                                VTT file available at this URI:
                              </span>
                              <code class="block italic pb-1.5 font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.vtt_uri}
                              </code>
                            </Show>
                          </Show>
                        </div>
                      </FormField>
                    </div>

                    <div class="relative text-center">
                      <FormField>
                        <FormField.Label
                          hasError={local.storeForm.errors()?.lrc_file?.length > 0 ? true : false}
                          for="lrc_file"
                        >
                          LRC file (captions for audio files)
                        </FormField.Label>
                        <p class="text-start pb-4 text-neutral-11 text-2xs">
                          LRC (Lyric File) files are a subtitle format used primarily for displaying song lyrics. They
                          contain timing information and the lyrics for each line of the song, along with optional tags
                          for things like karaoke-style highlighting of the text. They can be edited with a basic text
                          editor.
                        </p>
                        <div class="bg-accent-1 border-accent-6 border-dashed border-2 focus-within:ring-4 p-6 rounded-md">
                          <input
                            onChange={(e) => {
                              // local URI
                              //@ts-ignore
                              if (e.currentTarget.files[0] && e.currentTarget.files[0] !== null) {
                                //@ts-ignore
                                const src = URL.createObjectURL(e.currentTarget.files[0])
                                local.storeForm.setData('lrc_uri', src)
                              }
                            }}
                            accept=".lrc"
                            class="absolute opacity-0 w-full h-full z-10 inset-0"
                            type="file"
                            id="lrc_file"
                            name="lrc_file"
                          />
                          <Show when={!local.storeForm?.data()?.lrc_uri}>
                            <span class="block mb-1.5 text-2xl" aria-hidden="true">
                              📄
                            </span>
                            <span class="italic text-xs text-accent-9">
                              Pick the <code>.lrc</code> file
                            </span>
                          </Show>
                          <Show when={!local.storeForm?.data()?.lrc_uri && !local.storeForm?.data()?.lrc_file}>
                            <IconFolderOpen class="mx-auto text-accent-9 text-opacity-50 mt-4 h-8 w-8" />
                          </Show>
                          <Show when={local.storeForm.data()?.lrc_uri}>
                            <span class="block mb-1.5 text-2xl" aria-hidden="true">
                              📻🎙️📄
                            </span>
                            <br />
                            <Show when={local.storeForm.data()?.lrc_file && local.storeForm.data()?.lrc_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">LRC file picked</span>
                              <code class="block font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.lrc_file?.name}
                              </code>
                            </Show>
                            <Show when={!local.storeForm?.data()?.lrc_file && local.storeForm.data()?.lrc_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">
                                LRC file available at this URI:
                              </span>
                              <code class="block italic pb-1.5 font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.lrc_uri}
                              </code>
                            </Show>
                          </Show>
                        </div>
                      </FormField>
                    </div>
                  </div>

                  <div class="flex flex-col space-y-2 text-start xs:text-center mt-6 mb-4 font-medium text-2xs bg-accent-3 py-6 rounded-md mx-auto w-fit-content px-4 text-accent-11">
                    <p>Don't forget to add the written transcription in the "Plain-text version" tab !</p>
                    <Button
                      class="mx-auto"
                      scale="xs"
                      type="button"
                      intent="neutral-on-light-layer"
                      {...local.apiTabs().getTriggerProps({
                        value: 'text-version',
                      })}
                    >
                      Open "Plain-text version tab"
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset
            class="disabled:opacity-50 disabled:cursor-not-allowed"
            {...local.apiAccordion().getItemProps({
              value: 'contribute',
              disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
            })}
          >
            <div class="flex relative p-3 font-bold focus-within:ring focus-within:bg-neutral-2">
              <span
                classList={{
                  'text-accent-11': local.apiAccordion().value.includes('contribute'),
                  'text-accent-6': !local.apiAccordion().value.includes('contribute'),
                }}
                class="pie-1ex"
              >
                #4.
              </span>
              <legend>Workflow & contributions</legend>
              <button
                class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                {...local.apiAccordion().getTriggerProps({
                  value: 'contributions',
                  disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
                })}
              >
                Toggle "Worflow & Contributions" section
              </button>
            </div>
            <div
              class="pt-1.5 space-y-4 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'contributions',
                disabled: !ethers.utils.isAddress(currentUser()?.address) ? true : false,
              })}
            >
              <FormField>
                <FormField.InputField>
                  <FormField.Label
                    hasError={local.storeForm.errors()?.collaborators?.length > 0 ? true : false}
                    for="collaborators"
                  >
                    Collaborators
                  </FormField.Label>
                  <FormField.Description id="tags-collaborators">
                    Add the Ethereum address of your collaborators (whitelisted people that will be allowed to review
                    and accept transcriptions).
                  </FormField.Description>
                  <FormTagsInput
                    placeholder="Paste a valid Ethereum address and press 'Enter'..."
                    classWrapper="w-full"
                    api={props.apiCollaborators}
                  />
                </FormField.InputField>
              </FormField>
              <FormField>
                <FormField.InputField>
                  <FormInputSwitch
                    id="revision_must_be_approved_first"
                    name="revision_must_be_approved_first"
                    label="Revisions must be me or my collaborators first"
                    helpText="Enabling this options means that for a revision to be accepted, it must be reviewed by you or another address you designated as a collaborator."
                    hasError={local.storeForm.errors()?.revision_must_be_approved_first?.length > 0 ? true : false}
                    checked={local.storeForm.data()?.revision_must_be_approved_first}
                  />
                </FormField.InputField>
              </FormField>
            </div>
          </fieldset>
        </div>
        <input disabled hidden name="source_media_uris" />
        <input disabled hidden name="language" />
        <input disabled hidden name="keywords" />
        <input disabled hidden name="lrc_uri" />
        <input disabled hidden name="vtt_uri" />
        <input disabled hidden name="srt_uri" />
        <input disabled hidden name="collaborators" />

        <Button disabled={local.isLoading} type="submit">
          <Switch fallback="Create">
            <Match when={local.isError}>Try again</Match>
            <Match when={local.isLoading}>Creating...</Match>
            <Match when={local.isSuccess}>Create a new one</Match>
          </Switch>
        </Button>
      </form>
    </>
  )
}

export default FormNewTranscription
