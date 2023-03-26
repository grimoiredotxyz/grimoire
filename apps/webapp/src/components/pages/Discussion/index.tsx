import { createQuery } from '@tanstack/solid-query'
import { Match, Show, Switch } from 'solid-js'
import { useAuthentication, usePushChat } from '~/hooks'
import { Button, IconEnvelope } from '~/ui'
import * as PushAPI from '@pushprotocol/restapi'

interface DiscussionProps {
  id: string
}
export const Discussion = (props: DiscussionProps) => {
  const { pushChatProfile, currentUser, mutationGetPushUser } = useAuthentication()
  const { getKeyAndSigner } = usePushChat()

  const queryChat = createQuery(
    () => ['chat', props.id],
    async () => {
      const { decryptedKey } = await getKeyAndSigner()

      // actual api
      const chats = await PushAPI.chat.chats({
        account: `eip155:${currentUser()?.address}`,
        toDecrypt: true,
        pgpPrivateKey: decryptedKey,
      })
      return await PushAPI.chat.conversationHash({
        account: `eip155:${currentUser()?.address}`,
        conversationId: `eip155:${props?.id}`,
      })
    },
    {
      refetchOnWindowFocus: false,
      get enabled() {
        return pushChatProfile()?.encryptedPrivateKey ? true : false
      },
    },
  )

  return (
    <div class="px-2 xs:px-4 py-8 flex flex-col bg-neutral-3 bg-opacity-50 border border-neutral-4 rounded-md">
      <p class="font-bold text-neutral-11 text-2xs text-center pb-6">
        Reminder: all group discussions created on Grimoire are public.
      </p>
      <Switch>
        <Match when={!pushChatProfile()}>
          <div class="text-center text-neutral-9 py-4">
            <IconEnvelope class="w-9 h-9 mx-auto text-neutral-9" />
            <p class="text-xs py-4">
              Click on the button below and sign the message in your wallet to access this group chat.
            </p>
            <Button
              class="flex m-auto items-center"
              isLoading={mutationGetPushUser.isLoading}
              disabled={mutationGetPushUser.isLoading}
              scale="sm"
              intent="interactive-faint"
              onClick={async () => mutationGetPushUser.mutateAsync()}
            >
              <span
                classList={{
                  'pis-1ex': mutationGetPushUser.isLoading,
                }}
              >
                <Switch fallback="Activate">
                  <Match when={mutationGetPushUser.isLoading}>Sign message...</Match>
                  <Match when={mutationGetPushUser.isSuccess}>Activated !</Match>
                </Switch>
              </span>
            </Button>
          </div>
        </Match>

        <Match when={pushChatProfile()}>
          <div class="bg-neutral-1 flex pis-2 pie-8 py-2 mie-auto xs:mis-auto rounded-full border border-neutral-6">
            <img
              class="rounded-full"
              alt="My profile picture"
              width="40"
              height="40"
              src={pushChatProfile()?.profilePicture}
            />
            <div class="pis-4 overflow-hidden text-ellipsis">
              <p class="text-[0.65rem] font-medium text-neutral-11">Your profile in this group chat:</p>
              <span class="font-bold block text-xs text-accent-12">{pushChatProfile()?.name}</span>
            </div>
          </div>
        </Match>
      </Switch>
      <Show when={pushChatProfile()}>
        <Switch>
          <Match when={queryChat?.isLoading}>
            <div class="flex border-t border-neutral-5 pt-8 mt-8 flex-col justify-center space-y-4">
              <p class="text-2xs text-neutral-9 text-center font-bold animate-pulse">Loading discussion...</p>
            </div>
          </Match>

          <Match when={queryChat?.data?.length === 0}>
            <p class="py-4 italic text-center text-neutral-9">No message yet</p>
          </Match>
          <Match when={queryChat?.data?.length > 0}>
            <p>Messages:</p>
          </Match>
          <Match when={queryChat?.data?.isError}>
            <p>The discussion couldn't be fetched. This group chat might not have been created or was deleted.</p>
          </Match>
        </Switch>
      </Show>
    </div>
  )
}

export default Discussion
