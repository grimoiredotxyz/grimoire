import { ethers } from 'ethers'
import { Match, Show, splitProps, Switch } from 'solid-js'
import { Button, FormTextarea, FormInput, IconFolderOpen, FormInputSwitch, IconCheck, Combobox, FormTagsInput } from '~/ui'
import FormField from '~/ui/FormField'
import { useAuthentication } from '~/hooks/useAuthentication'

interface FormNewTranscriptionProps {
  apiAccordion: any
  apiCollaborators: any
  apiComboboxLanguage: any
  apiTabs: any
  apiTags: any
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
            <div class="flex relative p-3 font-bold">
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
              class="pt-1.5 pb-6 px-3 sm:px-6"
              {...local
                .apiAccordion()
                .getContentProps({ value: 'source', disabled: !ethers.utils.isAddress(currentUser()?.address) })}
            >
              <div class="p-6 mb-6 bg-neutral-3 bg-opacity-5 border border-accent-5 overflow-hidden rounded-md">
                <span class="block text-center text-xs text-neutral-11 font-medium">Select the source NFT (ERC-721 or ERC-155) of your transcription</span>
                <div class="grid grid-cols-2 gap-4 w-full pb-8 pt-4">
                  <div
                  classList={{
                    "border-interactive-10 text-interactive-11": local.storeForm?.data()?.media_source_type === 'web3',
                    "border-neutral-7 text-neutral-11":  local.storeForm?.data()?.media_source_type !== 'web3',
                  }}
                  class="focus-within:ring-4 focus-within:ring-interactive-4 flex items-center justify-center rounded-lg border-2 aspect-square relative">
                    <Show when={local.storeForm?.data()?.media_source_type === 'web3'}>
                    <IconCheck class="w-6 h-6 absolute top-2 inline-end-2 pointer-events-none text-interactive-11" stroke-width="2"  />

                    </Show>
                    <label class="opacity-0 absolute cursor-pointer inset-0 w-full h-full">
                      <input name="media_source_type" value="web3" type="radio" />
                      NFT Media
                    </label>
                    <span class="p-3 font-medium text-center text-xs">NFT media (ERC-721 or ERC-1155)</span>
                  </div>
                  <div 
                  classList={{
                    "border-interactive-10 text-interactive-11": local.storeForm?.data()?.media_source_type === 'web2',
                    "border-neutral-7 text-neutral-11":  local.storeForm?.data()?.media_source_type !== 'web2',
                  }}
                  class="focus-within:ring-4 focus-within:ring-interactive-4 flex items-center justify-center rounded-lg border-2 aspect-square relative">
                                        <Show when={local.storeForm?.data()?.media_source_type === 'web2'}>
                    <IconCheck class="w-6 h-6 absolute top-2 inline-end-2 pointer-events-none text-interactive-11" stroke-width="2"  />

                    </Show>
                    <label class="opacity-0 absolute cursor-pointer inset-0 w-full h-full">
                      <input name="media_source_type" value="web2" type="radio" />
                      Web2 media
                    </label>
                    <span class="p-3 font-medium text-center text-xs">Web2 media (Twitter Space recording, Youtube video...)</span>
                  </div>
                </div>
                  
                <Switch fallback={<span class='text-2xs italic text-accent-9 block text-center'>Please select the type of media source first.</span>}>
                <Match when={local.storeForm?.data()?.media_source_type === 'web3'}>
                  <div class="flex flex-col space-y-4">
                  <FormField>
                  <FormField.InputField>
                    <FormField.Label hasError={local.storeForm.errors()?.source_media_contract?.length > 0 ? true : false} for="source_media_contract">
                      NFT contract address (ERC-721 or ERC-1155)
                    </FormField.Label>
                    <FormField.Description id="source_media_contract-description">The contract address of your source media. <span class="font-bold text-accent-11">Make sure this contract must exist on {currentNetwork()?.name}.</span></FormField.Description>
                    <FormInput
                      scale="sm"
                      placeholder="eg: 0x..."
                      name="source_media_contract"
                      id="source_media_contract"
                      hasError={local.storeForm.errors()?.source_media_contract?.length > 0 ? true : false}
                    />
                  </FormField.InputField>
                </FormField>
                <FormField>
                  <FormField.InputField>
                    <FormField.Label hasError={local.storeForm.errors()?.source_media_nft_id?.length > 0 ? true : false} for="source_media_nft_id">
                      NFT ID
                    </FormField.Label>
                    <FormField.Description id="source_media_nft_id-description">The title of your transcription.</FormField.Description>
                    <FormInput
                      scale="sm"
                      placeholder="eg: 36"
                      name="source_media_nft_id"
                      id="source_media_nft_id"
                      type="number"
                      hasError={local.storeForm.errors()?.source_media_nft_id?.length > 0 ? true : false}
                    />
                  </FormField.InputField>
                </FormField>
                <FormField>
                  <FormField.InputField>
                    <FormField.Label hasError={local.storeForm.errors()?.source_media_url?.length > 0 ? true : false} for="source_media_url">
                      NFT Metadata URI
                    </FormField.Label>
                    <FormField.Description id="source_media_url-description">A URL/URI to the NFT metadata.</FormField.Description>
                    <FormInput
                      placeholder="eg: ipfs:// ..."
                      name="source_media_url"
                      id="source_media_url"
                      hasError={local.storeForm.errors()?.source_media_url?.length > 0 ? true : false}
                    />
                  </FormField.InputField>
                </FormField>

                  </div>
                </Match> 
                <Match when={local.storeForm?.data()?.media_source_type === 'web2'}>
                <FormField>
                  <FormField.InputField>
                    <FormField.Label hasError={local.storeForm.errors()?.source_media_url?.length > 0 ? true : false} for="source_media_url">
                      Media link
                    </FormField.Label>
                    <FormField.Description id="source_media_url-description">A link to your media.</FormField.Description>
                    <FormInput
                      type="url"
                      placeholder="eg: https://twitter.com/i/spaces/1mrGmkeLLzqxy"
                      name="source_media_url"
                      id="source_media_url"
                      hasError={local.storeForm.errors()?.source_media_url?.length > 0 ? true : false}
                    />
                  </FormField.InputField>
                </FormField>

                </Match> 
              </Switch>

              
              </div>

            </div>
          </fieldset>
          <fieldset
            class="disabled:opacity-50 disabled:cursor-not-allowed"
            {...local.apiAccordion().getItemProps({
              value: 'info',
              disabled:
                !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                  ? true
                  : false,
            })}
          >
            <div class="flex relative p-3 font-bold">
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
                  disabled:
                    !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                      ? true
                      : false,
                })}
              >
                Toggle "Info" section
              </button>
            </div>
            <div
              class="pt-1.5 space-y-4 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'info',
                disabled:
                  !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                    ? true
                    : false,
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
                    label={<>
                      <FormField.Label hasError={local.storeForm.errors()?.language?.length > 0 ? true : false} for="language">
                        Language
                      </FormField.Label>
                      <FormField.Description id="language-description">The language of your transcription.</FormField.Description>
                    </>}
                    hasError={local.storeForm.errors()?.language?.length > 0 ? true : false}
                    options={
                      props.comboboxLanguageOptions
                    }
                  />
                </FormField.InputField>
  
              </FormField>

              <FormField>
                <FormField.InputField>
                  <FormField.Label hasError={local.storeForm.errors()?.tags?.length > 0 ? true : false} for="tags">
                    Tags
                  </FormField.Label>
                  <FormField.Description id="tags-description">Additional tags to describe your transcription.</FormField.Description>
                  <FormTagsInput
                  placeholder="Type your tag and press 'Enter'..."
                  classWrapper='w-full'
                    api={props.apiTags}
                  />
                </FormField.InputField>
              </FormField>
            </div>
          </fieldset>

          <fieldset
            class="disabled:opacity-50 disabled:cursor-not-allowed"
            {...local.apiAccordion().getItemProps({
              value: 'files',
              disabled:
                !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                  ? true
                  : false,
            })}
          >
            <div class="flex relative p-3 font-bold">
              <span
                classList={{
                  'text-accent-11': local.apiAccordion().value.includes('files'),
                  'text-accent-6': !local.apiAccordion().value.includes('files'),
                }}
                class="pie-1ex"
              >
                #3.
              </span>
              <legend>Transcription</legend>
              <button
                class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                {...local.apiAccordion().getTriggerProps({
                  value: 'transcription',
                  disabled:
                    !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                      ? true
                      : false,
                })}
              >
                Toggle "Transcription" section
              </button>
            </div>
            <div
              class="pt-1.5 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'transcription',
                disabled:
                  !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                    ? true
                    : false,
              })}
            >
              <div class="border rounded-md border-accent-5 overflow-hidden" {...local.apiTabs().rootProps}>
                <div class="flex divide-i divide-accent-5 border-b border-accent-5" {...local.apiTabs().tablistProps}>
                  <button
                    class="flex items-center bg-accent-1 not:data-[selected]:bg-transparent data-[selected]:bg-white py-2 px-4 font-semibold text-2xs disabled:opacity-50 p-8"
                    {...local.apiTabs().getTriggerProps({
                      value: 'text-version',
                      disabled:
                        !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                          ? true
                          : false,
                    })}
                  >
                    <IconFolderOpen class="w-4 h-4 mie-1ex" />
                    Plain-text version
                  </button>
                  <button
                    class="grow-[1] flex items-center bg-accent-1 not:data-[selected]:bg-transparent data-[selected]:bg-white py-2 px-4 font-semibold text-2xs disabled:opacity-50"
                    {...local.apiTabs().getTriggerProps({
                      value: 'files',
                      disabled: !local.storeForm?.data()?.media_source_type
                        ? true
                        : false 
                    })}
                  >
                    Files
                  </button>
                </div>
                <div
                  class="p-0.5 xs:p-4 bg-white"
                  {...local.apiTabs().getContentProps({
                    value: 'text-version',
                    disabled:
                        !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                          ? true
                          : false,
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



                  </div>
                </div>
                <div
                  class="p-0.5 xs:p-4 bg-white"
                  {...local.apiTabs().getContentProps({
                    value: 'files',
                    disabled:
                    !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                    ? true
                    : false,
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
                        SRT (SubRip Text) files are a commonly used subtitle format. They contain the timing information and text for each subtitle in a video. They can be edited with a basic text editor.
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
                              📄
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
                              📄
                            </span>
                            <br />
                            <Show when={local.storeForm.data()?.srt_file && local.storeForm.data()?.srt_uri}>
                              <span class="block italic pb-1.5 text-xs text-accent-9">SRT file picked</span>
                              <code class="block font-bold text-sm text-accent-11">
                                {local.storeForm.data()?.srt_file?.name}
                              </code>
                            </Show>lyrics
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
                        VTT (WebVTT) files are used for web-based videos and can include styling and positioning information in addition to the text and timing information. They can be edited with a basic text editor.
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
                            </Show>lyrics
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
                        LRC (Lyric File) files are a subtitle format used primarily for displaying song lyrics. They contain timing information and the lyrics for each line of the song, along with optional tags for things like karaoke-style highlighting of the text. They can be edited with a basic text editor.
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
                              📄
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
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset
            class="disabled:opacity-50 disabled:cursor-not-allowed"
            {...local.apiAccordion().getItemProps({
              value: 'contribute',
              disabled:
                !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                  ? true
                  : false,
            })}
          >
            <div class="flex relative p-3 font-bold">
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
                  disabled:
                    !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                      ? true
                      : false,
                })}
              >
                Toggle "Worflow & Contributions" section
              </button>
            </div>
            <div
              class="pt-1.5 space-y-4 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'contributions',
                disabled:
                  !ethers.utils.isAddress(currentUser()?.address) || !local.storeForm?.data()?.media_source_type
                    ? true
                    : false,
              })}
            >
              <FormField>
                <FormField.InputField>
                  <FormField.Label hasError={local.storeForm.errors()?.collaborators?.length > 0 ? true : false} for="collaborators">
                    Collaborators
                  </FormField.Label>
                  <FormField.Description id="tags-collaborators">Add the Ethereum address of your collaborators (whitelisted people that will be allowed to review and accept transcriptions).</FormField.Description>
                  <FormTagsInput
                  placeholder="Paste a valid Ethereum address and press 'Enter'..."
                  classWrapper='w-full'
                    api={props.apiCollaborators}
                  />
                </FormField.InputField>
              </FormField>
              <FormField>
                <FormField.InputField>
                  <FormInputSwitch
                    id="revision_must_be_approved_first"
                    name="revision_must_be_approved_first"
                    label="Revisions must be approved by a core contributors first"
                    helpText="Enabling this options means that for a revision to be accepted, it must be reviewed by you or another core contributors."
                    hasError={local.storeForm.errors()?.revision_must_be_approved_first?.length > 0 ? true : false}
                    checked={local.storeForm.data()?.revision_must_be_approved_first}
                  />
                </FormField.InputField>
              </FormField>
              <input disabled hidden name="lrc_uri" />
              <input disabled hidden name="vtt_uri" />
            </div>
          </fieldset>
        </div>

        <Button
          disabled={
            local.isLoading
          }
          type="submit"
        >
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
