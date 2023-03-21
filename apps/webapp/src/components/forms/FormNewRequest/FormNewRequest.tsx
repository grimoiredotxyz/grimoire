import { isAddress } from 'viem'
import { Match, Show, splitProps, Switch } from 'solid-js'
import { Button, FormTextarea, FormInput, FormTagsInput, Combobox } from '~/ui'
import FormField from '~/ui/FormField'
import { useAuthentication } from '~/hooks/useAuthentication'

interface FormNewRequestProps {
  apiAccordion: any
  apiCollaborators: any
  apiKeywords: any
  apiComboboxLanguage: any
  apiSourcesMediaUris: any
  isError: boolean
  isLoading: boolean
  isSuccess: boolean
  storeForm: any
  comboboxLanguageOptions: any
}

export const FormNewRequest = (props: FormNewRequestProps) => {
  //@ts-ignore
  const { currentUser } = useAuthentication()
  const [local] = splitProps(props, ['storeForm', 'apiAccordion', 'isLoading', 'isError', 'isSuccess'])
  //@ts-ignore
  const { form } = local.storeForm

  return (
    <>
      {/* @ts-ignore */}
      <Show when={!isAddress(currentUser()?.address)}>
        <p class="animate-appear text-start xs:text-center mt-6 mb-4 font-medium text-2xs bg-secondary-3 py-2 rounded-md mx-auto w-fit-content px-4 text-secondary-11">
          Sign-in to start creating requests.
        </p>
      </Show>
      {/* @ts-ignore */}
      <form use:form>
        <div class="border bg-accent-1 divide-y divide-neutral-4 rounded-md border-neutral-4 mb-8">
          <fieldset
            {...local.apiAccordion().getItemProps({ value: 'about', disabled: !isAddress(currentUser()?.address) })}
          >
            <div class="flex relative p-3 font-bold focus-within:ring focus-within:bg-neutral-2">
              <span
                classList={{
                  'text-accent-11': local.apiAccordion().value.includes('about'),
                  'text-accent-6': !local.apiAccordion().value.includes('about'),
                }}
                class="pie-1ex"
              >
                #1.
              </span>
              <legend>About</legend>
              <button
                class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                {...local
                  .apiAccordion()
                  .getTriggerProps({ value: 'about', disabled: !isAddress(currentUser()?.address) })}
              >
                Toggle "About" section
              </button>
            </div>

            <div
              class="pb-6 px-3 sm:px-6 space-y-4"
              {...local
                .apiAccordion()
                .getContentProps({ value: 'about', disabled: !isAddress(currentUser()?.address) })}
            >
              <FormField>
                <FormField.InputField>
                  <FormField.Label
                    hasError={local.storeForm.errors()?.source_media_uris?.length > 0 ? true : false}
                    for="source_media_uris"
                  >
                    Source material links
                  </FormField.Label>
                  <FormField.Description id="source_media_uris-description">
                    Link(s) to the source material of your media (video/audio). Your link can be valid URI starting with{' '}
                    <code>ipfs://</code> (IPFS), <code>ar://</code> (Arweave), or a valid URL starting with{' '}
                    <code>https://</code>.{' '}
                    <span class="font-bold">
                      Other users will use this link to create transcriptions, make sure the content (audio/video) can
                      be reached from the link(s) you provided.
                    </span>
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
                          The language for this transcription
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
                    Your notes about this request
                  </FormField.Label>
                  <FormField.Description id="notes-description">
                    Any additional information you want to provide about this request.
                  </FormField.Description>
                  <FormTextarea
                    placeholder="eg: Please remove any 'umm', and provide a .lrc file."
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
              value: 'contribute',
              disabled: !isAddress(currentUser()?.address) ? true : false,
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
                #2.
              </span>
              <legend>Workflow & contributions</legend>
              <button
                class="disabled:cursor-not-allowed absolute inset-0 w-full h-full opacity-0"
                {...local.apiAccordion().getTriggerProps({
                  value: 'contributions',
                  disabled: !isAddress(currentUser()?.address) ? true : false,
                })}
              >
                Toggle "Worflow & Contributions" section
              </button>
            </div>
            <div
              class="pt-1.5 space-y-4 pb-6 px-3 sm:px-6"
              {...local.apiAccordion().getContentProps({
                value: 'contributions',
                disabled: !isAddress(currentUser()?.address) ? true : false,
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
            </div>
          </fieldset>
        </div>
        <input disabled hidden name="source_media_uris" />
        <input disabled hidden name="collaborators" />
        <input disabled hidden name="language" />
        <input disabled hidden name="keywords" />

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

export default FormNewRequest
