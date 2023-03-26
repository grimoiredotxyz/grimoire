import { createQuery } from '@tanstack/solid-query'
import { Show } from 'solid-js'
import { usePolybase } from '~/hooks'

export const RevisionShortcut = (props) => {
  const { db } = usePolybase()

  const queryRevisionShortcut = createQuery(
    () => [
      'revision-attached-transcription',
      props?.revision?.id,
      props?.revision?.transcription?.id?.transcription?.id,
    ],
    async () => {
      const transcription = await db.collection('Transcription').record(props?.revision?.transcription?.id).get()
      return transcription
    },
    {
      refetchOnWindowFocus: false,
    },
  )
  return (
    <>
      <Show fallback="..." when={queryRevisionShortcut?.data?.data?.title}>
        {queryRevisionShortcut?.data?.data?.title}
      </Show>
    </>
  )
}

export default RevisionShortcut
