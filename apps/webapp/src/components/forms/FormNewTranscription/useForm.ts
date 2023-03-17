import { createForm } from '@felte/solid'
import { validator } from '@felte/validator-zod'
import { z } from 'zod'
import * as tabs from '@zag-js/tabs'
import * as combobox from '@zag-js/combobox'
import * as accordion from '@zag-js/accordion'
import * as tagsInput from '@zag-js/tags-input'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createSignal, createUniqueId } from 'solid-js'
import { schema } from './schema'
import { LOCALES } from '~/config/languages'
import { isAddress } from 'ethers/lib/utils.js'

const comboboxLanguageData = Object.keys(LOCALES).map((locale: string) => ({
  //@ts-ignore
  label: LOCALES[locale],
  value: locale,
  disabled: false,
}))

export function useForm(args: {
  onSubmit: (values: z.infer<typeof schema>) => void
  initialValues: z.infer<typeof schema>
}): {
  comboboxLanguageOptions: any
  formNewTranscription: any
  stateMachineAccordion: any
  stateMachineCollaborators: any
  stateMachineComboboxLanguage: any
  stateMachineKeywords: any
  stateMachineSourcesMediaUris: any
  stateMachineTabs: any
} {
  // Form state manager
  const storeForm = createForm<z.infer<typeof schema>>({
    onSubmit: args.onSubmit,
    extend: validator({ schema }),
    initialValues: args?.initialValues,
  })

  // Combobox language state machine
  const [comboboxLanguageOptions, setComboboxLanguageOptions] = createSignal(comboboxLanguageData)

  const [stateComboboxLanguage, sendComboboxLanguage] = useMachine(
    combobox.machine({
      id: createUniqueId(),
      loop: true,
      placeholder: 'Type or select the language of your transcription...',
      onOpen() {
        setComboboxLanguageOptions(comboboxLanguageData)
      },
      onInputChange({ value }) {
        const filtered = comboboxLanguageData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setComboboxLanguageOptions(filtered.length > 0 ? filtered : comboboxLanguageData)
      },
      onSelect(details) {
        storeForm.setFields('language', details?.value as string)
      },
    }),
  )

  const apiComboboxLanguage = createMemo(() =>
    combobox.connect(stateComboboxLanguage, sendComboboxLanguage, normalizeProps),
  )

  // Source material
  const [stateTagsSources, sendTagsSources] = useMachine(
    tagsInput.machine({
      id: createUniqueId(),
      addOnPaste: true,
      blurBehavior: 'clear',
      validate(details) {
        return !details.values.includes(details.inputValue) // prevent duplicate tags
      },
      onChange(tags) {
        storeForm?.setData('source_media_uris', tags.values)
      },
    }),
  )
  const apiSourcesMediaUris = createMemo(() => tagsInput.connect(stateTagsSources, sendTagsSources, normalizeProps))

  // Keywords input
  const [stateTagsKeywords, sendTagsKeywords] = useMachine(
    tagsInput.machine({
      id: createUniqueId(),
      blurBehavior: 'clear',
      validate(details) {
        return !details.values.includes(details.inputValue) // prevent duplicate tags
      },
      onChange(tags) {
        storeForm?.setData('keywords', tags.values)
      },
    }),
  )

  const apiKeywords = createMemo(() => tagsInput.connect(stateTagsKeywords, sendTagsKeywords, normalizeProps))

  // Collaborators input
  const [stateTagsCollaborators, sendTagsCollaborators] = useMachine(
    tagsInput.machine({
      id: createUniqueId(),
      blurBehavior: 'clear',
      addOnPaste: true,
      validate(details) {
        return !details.values.includes(details.inputValue) && isAddress(details.inputValue) // prevent duplicate, check if address is a valid ethereum address
      },
      onChange(tags) {
        storeForm?.setData('collaborators', tags.values)
      },
    }),
  )

  const apiTagsCollaborators = createMemo(() =>
    tagsInput.connect(stateTagsCollaborators, sendTagsCollaborators, normalizeProps),
  )

  // Tabs state machine
  // To manage whether to show the karaoke preview or not
  const [stateTabs, sendTabs] = useMachine(
    tabs.machine({
      id: createUniqueId(),
      value: 'text-version',
    }),
  )
  const apiTabs = createMemo(() => tabs.connect(stateTabs, sendTabs, normalizeProps))

  // Accordion state machine
  // To manage the current step in the form
  const [stateAccordion, sendAccordion] = useMachine(
    accordion.machine({
      id: createUniqueId(),
      collapsible: false,
      multiple: false,
      value: [],
    }),
  )
  const apiAccordion = createMemo(() => accordion.connect(stateAccordion, sendAccordion, normalizeProps))

  return {
    comboboxLanguageOptions,
    formNewTranscription: storeForm,
    stateMachineAccordion: apiAccordion,
    stateMachineComboboxLanguage: apiComboboxLanguage,
    stateMachineTabs: apiTabs,
    stateMachineKeywords: apiKeywords,
    stateMachineSourcesMediaUris: apiSourcesMediaUris,
    stateMachineCollaborators: apiTagsCollaborators,
  }
}
