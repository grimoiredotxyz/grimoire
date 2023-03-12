import { Switch, Match, Show, For } from 'solid-js'
import { Button, IconCheck, IconError, IconBrowser, IconSpinner } from '~/ui'
import { useAuthentication } from '~/hooks'
import { chains } from '~/config'

export const SignIn = () => {
  //@ts-ignore
  const { isReady, mutationSignIn, isAuthenticated, currentNetwork, mutationSwitchNetwork } = useAuthentication()

  return (
    <div class="max-w-screen-2xs mx-auto">
      <h1 class="text-2xl text-accent-12 font-serif font-bold">Make web3 content more accessible with Grimoire !</h1>
      <p class="mt-2 mb-6 text-neutral-11 font-medium">Grimoire is [REDACTED]</p>
      <div class="px-6 pt-8 bg-neutral-1 rounded-lg border border-neutral-6">
        <h2 class="text-lg flex-wrap flex items-center font-bold text-accent-12">
          <Switch>
            <Match when={mutationSignIn.isIdle || (mutationSignIn.isSuccess && isAuthenticated() === false)}>
              Sign-in to Grimoire
            </Match>
            <Match when={mutationSignIn.isLoading}>
              <IconSpinner class="animate-spin shrink-0 text-xl mie-1ex" />
              Signing you in, one moment...
            </Match>
            <Match when={isAuthenticated() === true && currentNetwork()?.unsupported === true}>
              <IconError class=" shrink-0 text-negative-10 w-6 mie-1ex stroke-2" />
              Connected - please switch network
            </Match>
            <Match
              when={mutationSignIn.isSuccess && isAuthenticated() === true && currentNetwork()?.unsupported === false}
            >
              <IconCheck class=" shrink-0 text-positive-10 w-6 mie-1ex stroke-2" />
              Connected !
            </Match>
            <Match when={mutationSignIn.isError}>
              <IconError class=" shrink-0 text-negative-10 w-6 mie-1ex stroke-2" />
              Oops, something went wrong.
            </Match>
          </Switch>
        </h2>
        <p class="text-xs text-neutral-11 pt-1 pb-2 ">
          <Switch>
            <Match when={mutationSignIn.isIdle || (mutationSignIn.isSuccess && isAuthenticated() === false)}>
              <span class="">You can connect to Grimoire using your in-browser wallet.</span>
            </Match>
            <Match when={mutationSignIn.isSuccess && isAuthenticated() === true}>
              <p>
                <Show
                  fallback="You're connected and ready to use Grimoire ! You can switch network below :"
                  when={currentNetwork()?.unsupported === true}
                >
                  You're connected but you're using an{' '}
                  <span class="text-negative-9 font-bold">unsupported network</span>. To use Grimoire, switch network
                  below :
                </Show>
              </p>
              <ul class="pt-6 flex flex-col space-y-3">
                <For each={chains}>
                  {(chain) => (
                    <li>
                      <Button
                        class="flex items-center justify-center w-full"
                        isLoading={mutationSwitchNetwork.isLoading}
                        onClick={async () => {
                          await mutationSwitchNetwork.mutateAsync(chain?.id)
                        }}
                        intent={`${chain?.network}-outline`}
                        disabled={mutationSwitchNetwork.isLoading || chain?.id === currentNetwork()?.id}
                      >
                        <span class="flex items-center pis-1ex">
                          <Show
                            when={chain?.id !== currentNetwork()?.id}
                            fallback={
                              <>
                                <Show when={!mutationSwitchNetwork?.isLoading}>
                                  <IconCheck class="shrink-0 mie-1ex w-4 h-4" />
                                </Show>
                                Connected to {chain?.name}
                              </>
                            }
                          >
                            Switch to {chain?.name}
                          </Show>
                        </span>
                      </Button>
                    </li>
                  )}
                </For>
              </ul>
            </Match>
            <Match when={mutationSignIn.isError}>
              <span class="">Please try connecting again.</span>
            </Match>
          </Switch>
        </p>

        <Show when={!mutationSignIn.isSuccess || (mutationSignIn.isSuccess && isAuthenticated() === false)}>
          <div class="pt-2">
            <div>
              <p class="text-center p-3  text-accent-8 font-bold text-2xs ">Continue with :</p>
              <div class="flex flex-col gap-4 justify-center items-center">
                <Button
                  isLoading={mutationSignIn.variables?.method === 'injected' && mutationSignIn.isLoading}
                  onClick={async () =>
                    await mutationSignIn.mutateAsync({
                      method: 'injected',
                    })
                  }
                  class="flex items-center"
                  intent="neutral-outline"
                  type="button"
                  disabled={mutationSignIn.isLoading || !isReady()}
                  title="Continue with a browser-extension wallet  (Coinbase, MetaMask, Tally Ho...)"
                >
                  <Show when={!(mutationSignIn.variables?.method === 'injected' && mutationSignIn.isLoading)}>
                    <IconBrowser class="w-6 h-6" />
                  </Show>
                  <span class="pis-1ex">Continue with browser wallet</span>
                </Button>
              </div>
            </div>
          </div>
        </Show>

        <p class="mt-6 px-6 border-t border-neutral-6 text-center py-3 -mx-6 rounded-b-md bg-neutral-4 text-neutral-9 text-[0.7rem]">
          Learn more about web3 wallets
        </p>
      </div>
    </div>
  )
}

export default SignIn
