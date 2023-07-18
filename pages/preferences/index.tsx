import { Box, Divider, Typography } from "@mui/material"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import BorderedBox from "../components/BorderedBox"

const PreferencesPage = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const user = useUser()

  return user ? (
    <BorderedBox>
      <Box display="flex" flexDirection="column" gap="5px">
        <Typography variant="h5">Account Information</Typography>
        <Divider />
        <Box display="flex">
          <Box width="250px">
            <Typography variant="h6">Email</Typography>
          </Box>
          <Typography variant="h6">{user!.email}</Typography>
        </Box>
      </Box>
    </BorderedBox>
  ) : (
    "Loading"
  )
}

export default PreferencesPage
