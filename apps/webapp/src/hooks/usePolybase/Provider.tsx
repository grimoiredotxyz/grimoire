import { Polybase } from '@polybase/client'
import { createContext } from 'solid-js'

export const ContextPolybase = createContext()
export const ProviderPolybase = (props: any) => {
  const db = new Polybase({ defaultNamespace: import.meta.env.VITE_POLYBASE_NAMESPACE })
  const polybase = {
    db,
  }
  return <ContextPolybase.Provider value={polybase}>{props.children}</ContextPolybase.Provider>
}
