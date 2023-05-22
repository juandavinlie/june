import { Box } from "@mui/material"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"

const AccountPage = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()
  return (
    <Box
      onClick={async () => {
        const { error } = await supabase.auth.signOut()
        router.push("/")
      }}
    >
      Logout
    </Box>
  )
}

export default AccountPage
