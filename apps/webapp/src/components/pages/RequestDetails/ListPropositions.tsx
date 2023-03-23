import { createQueries } from '@tanstack/solid-query'
import { formatDistanceToNow, fromUnixTime } from 'date-fns'
import { For, Show } from 'solid-js'
import { A, useParams } from 'solid-start'
import { CHAINS_ALIAS, ROUTE_TRANSCRIPTION_DETAILS } from '~/config'
import { web3UriToUrl } from '~/helpers'
import { Transcription } from '~/services'
import { Identity } from '~/ui'

export const ListPropositions = (props) => {
  const params = useParams()
  const queriesTranscriptionsProposals = createQueries({
    queries: props.query?.data?.map(
      (raw: {
        [0]: string // id
        [1]: number // created at epochtime
        [2]: number // last updated at epochtime
        [3]: `0x${string}` // creator
        [4]: Array<`0x${string}`> // contributors
        [5]: Array<string> // revisions metadata URIS
        [6]: string // metadata uri
        [7]: string // id request
        [8]: Array<string> // communities
      }) => ({
        queryKey: () => ['transcription', `${params.chain}/${raw[0]}`],
        queryFn: async () => {
          /**
             *     struct Transcription {
                        bytes32 transcription_id;
                        uint256 created_at;
                        uint256 last_updated_at;
                        address creator;
                        address[] contributors;
                        string[] revision_metadata_uris;
                        string metadata_uri;
                        bytes32 id_request;
                        string[] communities;
                        bool exists;
                    }
             */
          const chainId = CHAINS_ALIAS[params.chain]
          const id = raw[0]
          const createdAt = raw[1]
          const lastUpdatedAt = raw[2]
          const creator = raw[3]
          const contributors = raw[4]
          const revisionMetadataUris = raw[5]
          const metadataUri = raw[6]
          const idRequest = raw[7]
          const communities = raw[8]
          const uri = web3UriToUrl(metadataUri)
          const response = await fetch(uri)
          const metadata = await response.json()
          let data: Transcription = {
            chainId,
            slug: `${params.chain}/${id}`,
            transcription_id: id,
            id,
            communities,
            contributors: [...contributors, creator],
            created_at_epoch_timestamp: createdAt,
            created_at_datetime: fromUnixTime(createdAt),
            creator,
            id_request: idRequest,
            last_updated_at_epoch_timestamp: lastUpdatedAt,
            last_updated_at_datetime: fromUnixTime(lastUpdatedAt),
            metadata_uri: metadataUri,
            revision_metadata_uris: revisionMetadataUris,
            keywords: null,
            language: null,
            lrc_file_uri: null,
            notes: null,
            revision_must_be_approved_first: true,
            source_media_title: null,
            source_media_uris: null,
            srt_file_uri: null,
            title: null,
            transcription_plain_text: null,
            vtt_file_uri: null,
          }

          data = {
            ...data,
            ...metadata,
            contributors: metadata.contributors,
          }
          return data as Transcription
        },
      }),
    ),
  })

  return (
    <>
      <ul class="space-y-6">
        <For each={queriesTranscriptionsProposals}>
          {(query) => {
            return (
              <>
                <Show when={query?.data}>
                  <li class="relative border focus-within:ring-2 border-neutral-6 p-3 xs:p-4 rounded-md">
                    <p class="font-bold font-serif text-accent-12">{query?.data?.title}</p>
                    <p class="italic text-neutral-11 text-2xs">
                      <span class="not:last:after:content-[','] font-semibold text-accent-10">
                        <Show when={query?.data?.transcription_plain_text?.trim()?.length > 0}>
                          <span>Plain text transcription ;&nbsp;</span>
                        </Show>
                        <Show when={query?.data?.srt_file_uri?.trim()?.length > 0}>
                          <span>.srt file ;&nbsp;</span>
                        </Show>
                        <Show when={query?.data?.vtt_file_uri?.trim()?.length > 0}>
                          <span>.vtt file ;&nbsp;</span>
                        </Show>
                        <Show when={query?.data?.lrc_file_uri?.trim()?.length > 0}>
                          <span>.lrc file ;&nbsp;</span>
                        </Show>
                      </span>
                      proposed by <Identity shortenOnFallback={true} address={query?.data?.creator} />{' '}
                      {formatDistanceToNow(query.data.created_at_datetime, { addSuffix: true })}
                    </p>
                    <A
                      class="absolute z-0 inset-0 block w-full h-full opacity-0"
                      href={ROUTE_TRANSCRIPTION_DETAILS.replace(
                        '[chain]/transcription/[idTranscription]',
                        query?.data?.slug?.replace('/', '/transcription/'),
                      )}
                    >
                      View more details
                    </A>
                    <div class="space-y-4">
                      <span class="link block text-2xs" aria-hidden="true">
                        View detailed proposition
                      </span>
                    </div>
                  </li>
                </Show>
              </>
            )
          }}
        </For>
      </ul>

      <Show when={queriesTranscriptionsProposals.filter((query) => query.status === 'loading')?.length > 0}>
        <p>Loading details...</p>
      </Show>
    </>
  )
}

export default ListPropositions
