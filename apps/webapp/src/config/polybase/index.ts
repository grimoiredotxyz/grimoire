import { Polybase } from '@polybase/client'

export const POLYBASE_DB = new Polybase({ defaultNamespace: import.meta.env.VITE_POLYBASE_NAMESPACE })
