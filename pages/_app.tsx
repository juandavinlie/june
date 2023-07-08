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
import { createContext, useState } from "react"
import { useMediaQuery } from "@mui/material"

export const ScreenContext = createContext<boolean>(false)

export default function App({ Component, pageProps, ...appProps }: AppProps) {
  const useMobileScreen = !useMediaQuery("(min-width:950px)")

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
      <ScreenContext.Provider value={useMobileScreen}>
        <ThemeProvider theme={themeSettings}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              {getContent()}
            </PersistGate>
          </Provider>
        </ThemeProvider>
      </ScreenContext.Provider>
    </SessionContextProvider>
  )
}
