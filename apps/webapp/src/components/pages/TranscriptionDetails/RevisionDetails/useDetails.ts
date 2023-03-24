import { createMemo, createUniqueId } from 'solid-js'
import * as accordion from '@zag-js/accordion'
import { useMachine, normalizeProps } from '@zag-js/solid'

export function useDetails() {
  const [stateAccordionDetails, sendAccordionDetails] = useMachine(
    accordion.machine({ id: createUniqueId(), collapsible: true }),
  )
  const apiAccordionDetails = createMemo(() =>
    accordion.connect(stateAccordionDetails, sendAccordionDetails, normalizeProps),
  )
  return {
    apiAccordionDetails,
  }
}

export default useDetails
