import * as menu from '@zag-js/menu'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createEffect, createMemo, createUniqueId } from 'solid-js'
import { useAuthentication } from '~/hooks'

export function useCurrentUser() {
  //@ts-ignore
  const { mutationDisconnect, currentUser } = useAuthentication()
  const [stateMenuCurrentUser, sendStateMenuCurrentUser] = useMachine(
    menu.machine({ id: createUniqueId(), 'aria-label': 'User actions' }),
  )
  const apiMenuCurrentUser = createMemo(() =>
    menu.connect(stateMenuCurrentUser, sendStateMenuCurrentUser, normalizeProps),
  )

  createEffect(() => {
    if (mutationDisconnect.isSuccess && !currentUser() && apiMenuCurrentUser().isOpen) {
      apiMenuCurrentUser().close()
    }
  })
  return {
    apiMenuCurrentUser,
  }
}

export default useCurrentUser
