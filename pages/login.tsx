import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { Auth } from "@supabase/auth-ui-react"

const Login = () => {
  const supabase = useSupabaseClient()
  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="dark"
      redirectTo="/stores"
    />
  )
}

export default Login
