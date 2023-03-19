import { createMemo, createUniqueId } from 'solid-js'
import * as accordion from '@zag-js/accordion'
import { useMachine, normalizeProps } from '@zag-js/solid'

export function useDetails() {
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

  return {
    apiAccordionDetails,
    downloadFile,
  }
}

export default useDetails
