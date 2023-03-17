import { createForm } from '@felte/solid'
import { validator } from '@felte/validator-zod'
import { isAddress } from 'viem'
import { z } from 'zod'
import * as accordion from '@zag-js/accordion'
import * as tagsInput from '@zag-js/tags-input'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'
import { schema } from './schema'

export function useForm(args: {
  onSubmit: (values: z.infer<typeof schema>) => void
  initialValues: z.infer<typeof schema>
}): {
  formNewRequest: any
  stateMachineAccordion: any
  stateMachineCollaborators: any
  stateMachineSourcesMediaUris: any
} {
  // Form state manager
  const storeForm = createForm<z.infer<typeof schema>>({
    onSubmit: args.onSubmit,
    extend: validator({ schema }),
    initialValues: args?.initialValues,
  })

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
    formNewRequest: storeForm,
    stateMachineAccordion: apiAccordion,
    stateMachineSourcesMediaUris: apiSourcesMediaUris,
    stateMachineCollaborators: apiTagsCollaborators,
  }
}
