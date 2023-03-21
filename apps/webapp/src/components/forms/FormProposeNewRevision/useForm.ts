import { createForm } from '@felte/solid'
import { validator } from '@felte/validator-zod'
import { z } from 'zod'
import * as tabs from '@zag-js/tabs'
import * as accordion from '@zag-js/accordion'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'
import { schema } from './schema'

export function useForm(args: {
  onSubmit: (values: z.infer<typeof schema>) => void
  initialValues: z.infer<typeof schema>
}): {
  formProposeNewRevision: any
  stateMachineTabs: any
  stateMachineAccordion: any
} {
  // Form state manager
  const storeForm = createForm<z.infer<typeof schema>>({
    onSubmit: args.onSubmit,
    extend: validator({ schema }),
    initialValues: args?.initialValues,
  })

  // Tabs state machine
  // To show the text version or files upload screen
  const [stateTabs, sendTabs] = useMachine(
    tabs.machine({
      id: createUniqueId(),
      value: 'text-version',
      loop: true,
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
    formProposeNewRevision: storeForm,
    stateMachineAccordion: apiAccordion,
    stateMachineTabs: apiTabs,
  }
}
