import { createMemo, createUniqueId } from 'solid-js'
import * as tabs from '@zag-js/tabs'
import * as popover from '@zag-js/popover'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { useParams } from 'solid-start'
import getOnChainTranscriptionProposals from '~/services/grimoire/getOnchainTranscriptionProposals'
import { createQuery } from '@tanstack/solid-query'

export function useDetails() {
  const params = useParams()
  // Tabs state machine
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
  const queryListReceivedProposals = createQuery(
    () => ['transcriptions-proposals', `${params.chain}/${params.idRequest}`],
    async () => {
      return await getOnChainTranscriptionProposals({
        idRequest: params.idRequest,
        chainAlias: params.chain,
      })
    },
    {
      refetchOnWindowFocus: true,
    },
  )

  return {
    apiPopoverActions,
    apiTabs,
    queryListReceivedProposals,
  }
}

export default useDetails
