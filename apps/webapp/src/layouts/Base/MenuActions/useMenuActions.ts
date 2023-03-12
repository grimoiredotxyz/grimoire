import * as popover from '@zag-js/popover'
import * as accordion from '@zag-js/accordion'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'

export function useMenuActions() {
  const [statePopover, sendPopover] = useMachine(
    popover.machine({
      modal: true,
      closeOnEsc: true,
      closeOnInteractOutside: true,
      id: createUniqueId(),
    }),
  )
  const apiPopoverMenuActions = createMemo(() => popover.connect(statePopover, sendPopover, normalizeProps))

  const [stateAccordionContributions, sendAccordionContributions] = useMachine(
    accordion.machine({
      collapsible: true,
      id: createUniqueId(),
    }),
  )
  const apiAccordionMenuActions = createMemo(() =>
    accordion.connect(stateAccordionContributions, sendAccordionContributions, normalizeProps),
  )

  return {
    apiPopoverMenuActions,
    apiAccordionMenuActions,
  }
}

export default useMenuActions
