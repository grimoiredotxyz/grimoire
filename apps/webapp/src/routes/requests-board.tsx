import { Title } from 'solid-start'
import { RequestsBoard } from '~/components/pages/RequestsBoard'

export default function Page() {
  return (
    <>
      <Title> Transcription requests | Grimoire</Title>
      <RequestsBoard />
    </>
  )
}
