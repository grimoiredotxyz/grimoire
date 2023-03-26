import { createQuery } from '@tanstack/solid-query'
import * as accordion from '@zag-js/accordion'
import * as tabs from '@zag-js/tabs'
import * as popover from '@zag-js/popover'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'
import { useParams } from 'solid-start'
import { getOnchainTranscriptionProposedRevisions } from '~/services'

export function useDetails() {
  const params = useParams()
  const [stateAccordionDetails, sendAccordionDetails] = useMachine(
    accordion.machine({
      id: createUniqueId(),
      multiple: false,
      value: ['contribute'],
    }),
  )
  const apiAccordionDetails = createMemo(() =>
    accordion.connect(stateAccordionDetails, sendAccordionDetails, normalizeProps),
  )

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

  async function downloadFile(args: { filename: string; uri: string }) {
    const a = document.createElement('a')
    const text = await fetch(args.uri)
    const file = await text.blob()

    const blob = new Blob([file], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = args.filename
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 0)
  }

  const queryListReceivedProposedRevisions = createQuery(
    () => ['transcription-proposed-revisions', `${params.chain}/${params.idTranscription}`],
    async () => {
      return await getOnchainTranscriptionProposedRevisions({
        idTranscription: params.idTranscription,
        chainAlias: params.chain,
        status: 0,
      })
    },
    {
      get enabled() {
        return params?.chain && params?.idTranscription ? true : false
      },
      refetchOnWindowFocus: true,
    },
  )

  const queryListAcceptedRevisions = createQuery(
    () => ['transcription-accepted-revisions', `${params.chain}/${params.idTranscription}`],
    async () => {
      return await getOnchainTranscriptionProposedRevisions({
        idTranscription: params.idTranscription,
        chainAlias: params.chain,
        status: 1,
      })
    },
    {
      get enabled() {
        return params?.chain && params?.idTranscription ? true : false
      },
      refetchOnWindowFocus: true,
    },
  )

  return {
    apiAccordionDetails,
    apiPopoverActions,
    apiTabs,
    downloadFile,
    queryListReceivedProposedRevisions,
    queryListAcceptedRevisions,
  }
}

export default useDetails
