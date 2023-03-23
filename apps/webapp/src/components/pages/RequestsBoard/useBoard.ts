import * as tabs from '@zag-js/tabs'
import { createMemo, createUniqueId, onMount } from 'solid-js'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { createQuery } from '@tanstack/solid-query'
import { useSearchParams } from 'solid-start'
import { getRequestsBoard } from '~/services'

export function useBoard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryRequestsBoard = createQuery(
    () => ['requests-board', searchParams?.status, searchParams?.cursor, searchParams?.sortOrder],
    async () => {
      return await getRequestsBoard({
        cursor: searchParams?.cursor ?? undefined,
        sortOrder: (searchParams?.sortOrder as 'asc' | 'desc') ?? 'desc',
      })
    },
    {
      refetchOnWindowFocus: true,
    },
  )
  // Tabs state machine
  const [stateTabs, sendTabs] = useMachine(
    tabs.machine({
      id: createUniqueId(),
      value: searchParams?.status ?? 'active',
      loop: true,
      onChange(tab) {
        setSearchParams({
          status: `${tab.value}`,
        })
      },
    }),
  )
  const apiTabs = createMemo(() => tabs.connect(stateTabs, sendTabs, normalizeProps))
  onMount(() => {
    if (!searchParams?.status)
      setSearchParams({
        status: 'active',
      })
  })
  return {
    apiTabs,
    searchParams,
    setSearchParams,
    queryRequestsBoard,
  }
}
