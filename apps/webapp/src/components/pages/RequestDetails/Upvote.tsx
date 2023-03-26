import { Match, splitProps, Switch } from 'solid-js'
import { deriveEthAddressFromPublicKey } from '~/helpers'
import { useAuthentication } from '~/hooks'
import { Button, ButtonProps } from '~/ui'
import useRequestActions from './useRequestActions'

interface UpvoteProps extends ButtonProps {
  idRequest: string
  voters: any
}
export const Upvote = (props: UpvoteProps) => {
  const { currentUser } = useAuthentication()
  const { mutationUpvoteRequest } = useRequestActions()
  const [local, buttonProps] = splitProps(props, ['idRequest', 'voters'])

  return (
    <Button
      isLoading={mutationUpvoteRequest.isLoading}
      onClick={async () => await mutationUpvoteRequest.mutateAsync({ idRequest: local.idRequest })}
      disabled={
        !currentUser()?.address ||
        mutationUpvoteRequest.isLoading ||
        mutationUpvoteRequest.isSuccess ||
        Object.keys(local?.voters ?? {}).filter(
          (pubKey) =>
            deriveEthAddressFromPublicKey(pubKey) === currentUser()?.address.toLowerCase() ||
            deriveEthAddressFromPublicKey(pubKey) === currentUser()?.address,
        )?.length > 0
      }
      type="button"
      {...buttonProps}
    >
      <span
        classList={{
          'pis-1ex': mutationUpvoteRequest.isLoading,
        }}
      >
        <Switch fallback="Upvote">
          <Match when={mutationUpvoteRequest.isError}>Upvoted !</Match>
          <Match when={mutationUpvoteRequest.isLoading}>Casting vote...</Match>
          <Match
            when={
              mutationUpvoteRequest.isSuccess ||
              Object.keys(local?.voters ?? {}).filter(
                (pubKey) => deriveEthAddressFromPublicKey(pubKey) === currentUser()?.address?.toLowerCase(),
              )?.length > 0
            }
          >
            Upvoted !
          </Match>
        </Switch>
      </span>
    </Button>
  )
}

export default Upvote
