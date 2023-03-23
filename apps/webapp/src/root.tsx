// @refresh reload
import { QueryClientProvider } from '@tanstack/solid-query'
import { Suspense } from 'solid-js'
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start'
import { queryClient } from '~/config'
import { ProviderAuthentication, ProviderPolybase } from '~/hooks'
import { Base as LayoutBase } from './layouts/Base'
import './root.css'

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <ProviderPolybase>
                <ProviderAuthentication>
                  <LayoutBase>
                    <Routes>
                      <FileRoutes />
                    </Routes>
                  </LayoutBase>
                </ProviderAuthentication>
              </ProviderPolybase>
            </QueryClientProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  )
}
