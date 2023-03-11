import { useLocation } from 'solid-start'
import { A } from '@solidjs/router'
import { Match, Show, Switch } from 'solid-js'
import { ROUTE_REQUEST_ACTIVE, ROUTE_SIGN_IN, ROUTE_TRANSCRIPT_SEARCH } from '~/config'
import { callToAction } from '~/design-system'
import { useAuthentication, ToastProvider } from '~/hooks'
import { MenuCurrentUser } from './MenuCurrentUser'

export const Base = (props: any) => {
  //@ts-ignore
  const { isAuthenticated } = useAuthentication()
  const location = useLocation()
  return (
    <ToastProvider>
      <div class="gap-4 w-full max-w-screen-xl px-3 mx-auto pt-2 flex justify-end">
        <nav class="transition-all text-2xs group  rounded-full divide-i divide-neutral-5 flex items-center bg-white border-neutral-5 overflow-hidden border hover:shadow">
          <A
            class="border-b border-transparent text-neutral-11  hover:bg-accent-2 hover:text-accent-11 focus:bg-interactive-2 focus:text-interactive-11  font-medium py-1 px-[3ex]"
            href={ROUTE_REQUEST_ACTIVE}
          >
            Requests board
          </A>
          <A
            class="border-b border-transparent text-neutral-11  hover:bg-accent-2 hover:text-accent-11 focus:bg-interactive-2 focus:text-interactive-11  font-medium py-1 px-[3ex]"
            href={ROUTE_TRANSCRIPT_SEARCH}
          >
            Transcripts
          </A>
          <Show when={!isAuthenticated() && location.pathname !== ROUTE_SIGN_IN}>
            <A
              class="border-b border-transparent text-neutral-11 focus:bg-interactive-2 focus:text-interactive-11  hover:bg-accent-2 hover:text-accent-11  font-medium py-1 px-[3ex]"
              href={ROUTE_SIGN_IN}
            >
              Sign-in
            </A>
          </Show>
        </nav>
        <Show when={isAuthenticated()}>
          <MenuCurrentUser />
        </Show>
      </div>
      <div class="flex-grow flex flex-col px-4 pt-20 pb-40">{props.children}</div>
    </ToastProvider>
  )
}

export default Base
