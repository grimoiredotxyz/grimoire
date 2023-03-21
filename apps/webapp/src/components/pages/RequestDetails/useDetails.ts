import { createMemo, createUniqueId } from 'solid-js'
import * as tabs from '@zag-js/tabs'
import * as popover from '@zag-js/popover'
import { useMachine, normalizeProps } from '@zag-js/solid'

export function useDetails() {
  // Tabs state machine
  // To show details or proposals
  const [stateTabs, sendTabs] = useMachine(
    tabs.machine({
      id: createUniqueId(),
      value: 'about',
      loop: true,
    }),
  )
  const apiTabs = createMemo(() => tabs.connect(stateTabs, sendTabs, normalizeProps))

  const [statePopoverActions, sendPopoverActions] = useMachine(
    popover.machine({
      closeOnEsc: true,
      closeOnInteractOutside: true,
      id: createUniqueId(),
    }),
  )
  const apiPopoverActions = createMemo(() => popover.connect(statePopoverActions, sendPopoverActions, normalizeProps))

  return {
    apiPopoverActions,
    apiTabs,
  }
}

export default useDetails
