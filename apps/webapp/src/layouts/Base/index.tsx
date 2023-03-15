import { useLocation } from 'solid-start'
import { A } from '@solidjs/router'
import { Match, Show, Switch } from 'solid-js'
import { ROUTE_LEADERBOARD, ROUTE_REQUEST_ACTIVE, ROUTE_SIGN_IN, ROUTE_TRANSCRIPTION_SEARCH } from '~/config'
import { useAuthentication, ToastProvider } from '~/hooks'
import { MenuCurrentUser } from './MenuCurrentUser'
import MenuActions from './MenuActions'
import { callToAction } from '~/design-system'
import { IconCaptions, IconFeed, IconTrophy } from '~/ui'

export const Base = (props: any) => {
  //@ts-ignore
  const { isAuthenticated } = useAuthentication()
  const location = useLocation()
  return (
    <ToastProvider>
      <div class="z-30 pointer-events-auto fixed w-fit-content inline-start-3 top-2">
        <Show when={isAuthenticated() === true}>
          <MenuActions />
        </Show>
      </div>
      <div class="z-30 fixed bottom-0 inline-start-0 md:pointer-events-none gap-4 w-full md:mx-auto max-w-screen-3xl xs:px-3 justify-center md:static md:pt-4 pb-3 flex">
        <nav class="pointer-events-auto transition-all w-full xs:w-auto text-2xs group xs:rounded-full xs:divide-i xs:divide-neutral-5 grid grid-cols-3 xs:flex xs:items-center bg-neutral-2 border-neutral-8 overflow-hidden border-t xs:border xs:hover:shadow">
          <A
            class="flex items-center justify-center text-accent-11 bg-accent-1 hover:bg-white hover:text-neutral-12 focus:bg-interactive-2 focus:text-interactive-11 font-medium pt-3 xs:py-1 px-[3ex]"
            href={ROUTE_REQUEST_ACTIVE}
          >
            <IconFeed class="w-6 h-6 xs:hidden" />
            <span class="sr-only xs:not-sr-only">Requests board</span>
          </A>
          <A
            class="flex items-center justify-center text-accent-11 bg-accent-1 hover:bg-white hover:text-neutral-12 focus:bg-interactive-2 focus:text-interactive-11 font-medium pt-3 xs:py-1 px-[3ex]"
            href={ROUTE_TRANSCRIPTION_SEARCH}
          >
            <IconCaptions class="w-6 h-6 xs:hidden" />
            <span class="sr-only xs:not-sr-only">Transcriptions</span>
          </A>
          <A
            class="flex items-center justify-center text-accent-11 bg-accent-1 hover:bg-white hover:text-neutral-12 focus:bg-interactive-2 focus:text-interactive-11 font-medium pt-3 xs:py-1 px-[3ex]"
            href={ROUTE_LEADERBOARD}
          >
            <IconTrophy class="w-6 h-6 xs:hidden" />
            <span class="sr-only xs:not-sr-only">Leaderboard</span>
          </A>
        </nav>
      </div>

      <div class="bg-neutral-2 md:bg-transparent z-10 top-0 fixed inline-end-3 w-full pt-4 pb-3">
        <div class="pointer-events-none w-full mx-auto max-w-screen-3xl px-3 justify-end flex">

        <Switch>
          <Match when={isAuthenticated()}>
            <MenuCurrentUser />
          </Match>
          <Match when={!isAuthenticated() && location.pathname !== ROUTE_SIGN_IN}>
            <A
              class={callToAction({
                class: 'hover:shadow pointer-events-auto max-w-42 overflow-hidden text-ellipsis',
                intent: 'neutral-outline',
                scale: 'xs',
              })}
              href={ROUTE_SIGN_IN}
            >
              Sign-in
            </A>
          </Match>
        </Switch>
        </div>

      </div>

      <div class="flex-grow flex flex-col px-4 pt-20 pb-40">{props.children}</div>
    </ToastProvider>
  )
}

export default Base
