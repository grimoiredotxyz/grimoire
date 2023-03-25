import { createQuery } from '@tanstack/solid-query'
import { createEffect } from 'solid-js'
import { Title, useSearchParams } from 'solid-start'
import { getTranscriptionsBoard } from '~/services'

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams()

  const queryTranscriptionsBoard = createQuery(
    () => ['transcriptions-board', searchParams?.status, searchParams?.cursor, searchParams?.sortOrder],
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

  createEffect(() => {
    if (queryTranscriptionsBoard?.data) console.log(queryTranscriptionsBoard?.data)
  })

  return (
    <>
      <Title> Transcription | Grimoire</Title>
      transcriptions list
    </>
  )
}
