import { createQuery } from '@tanstack/solid-query'
import { useSearchParams } from 'solid-start'
import { getTranscriptionsBoard } from '~/services'

export function useBoard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryTranscriptionsBoard = createQuery(
    () => ['transcription-board', searchParams?.cursor, searchParams?.sortOrder],
    async () => {
      return await getTranscriptionsBoard({
        cursor: searchParams?.cursor ?? undefined,
        sortOrder: (searchParams?.sortOrder as 'asc' | 'desc') ?? 'desc',
      })
    },
    {
      refetchOnWindowFocus: true,
    },
  )

  return {
    searchParams,
    setSearchParams,
    queryTranscriptionsBoard,
  }
}
