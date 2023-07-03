import "../styles/globals.css"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import type { AppProps } from "next/app"
import { ThemeProvider } from "@emotion/react"
import { themeSettings } from "../theme"
import { Provider } from "react-redux"
import { persistor, store } from "@/redux/config"
import { PersistGate } from "redux-persist/integration/react"
import SideBarLayout from "./components/SideBarLayout"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import Head from "next/head"

export default function App({ Component, pageProps, ...appProps }: AppProps) {
  const getContent = () => {
    if (
      appProps.router.pathname.startsWith("/login") ||
      appProps.router.pathname.startsWith("/conversation")
    ) {
      return <Component {...pageProps} />
    }
    return (
      <SideBarLayout>
        <Component {...pageProps} />
      </SideBarLayout>
    )
  }
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      {/* <Head>
        <link rel="stylesheet" href="/styles/globals.css" />
      </Head> */}
      <ThemeProvider theme={themeSettings}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {getContent()}
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </SessionContextProvider>
  )
}
