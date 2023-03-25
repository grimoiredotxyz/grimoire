import { Title, useSearchParams } from 'solid-start'
import { TranscriptionsBoard } from '~/components/pages/TranscriptionsBoard'

export default function Page() {
  return (
    <>
      <Title> Transcriptions | Grimoire</Title>
      <TranscriptionsBoard />
    </>
  )
}
