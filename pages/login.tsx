import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { Auth } from "@supabase/auth-ui-react"
import { Box, Button, Divider, TextField, Typography } from "@mui/material"
import GoogleIcon from "@mui/icons-material/Google"
import { useRouter } from "next/router"
import { useEffect } from "react"
import JuneTextLogo from "./components/common/JuneTextLogo"
import LoadingWidget from "./components/common/LoadingWidget"

const Login = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const stringify = (params: any) => {
    if (!params) {
      return ""
    }
    let queryString = "?"
    for (let [key, value] of Object.entries(params)) {
      queryString += `${key}=${value}&`
    }
    return queryString
  }

  let queryString = ""

  useEffect(() => {
    if (!router.isReady) return
    queryString = stringify(router.query)
  }, [router.isReady])

  return router.isReady ? (
    <Box display="flex" flexDirection="column" width="100%" height="100vh">
      <Box display="flex" p="30px">
        <JuneTextLogo />
      </Box>
      <Box display="flex" justifyContent="center" flexGrow="1" p="50px 0">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          minWidth="300px"
          width="30%"
          gap="30px"
        >
          <Box display="flex" flexDirection="column" gap="5px">
            <Typography variant="h4">Welcome to June</Typography>
            <Typography variant="h6">Sign in to your account</Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo:
                    `${process.env.NEXT_PUBLIC_SHOPIFY_HOST_SCHEME}://${process.env.NEXT_PUBLIC_SHOPIFY_HOST_NAME}/stores` +
                    queryString,
                },
              })
            }}
          >
            <GoogleIcon />
            <Box width="10px" />
            Continue with Google
          </Button>
        </Box>
      </Box>
    </Box>
  ) : (
    <LoadingWidget color="black" text="Loading..." />
  )
}

export default Login
// (
//   <Auth
//     supabaseClient={supabase}
//     appearance={{ theme: ThemeSupa }}
//     theme="light"
//     redirectTo="/stores"
//   />
// )
