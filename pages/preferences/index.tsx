import { Box, Divider, Typography } from "@mui/material"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"

const PreferencesPage = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const user = useUser()

  return user ? (
    <Box display="flex" flexDirection="column" width="100%" height="100vh">
      <Box display="flex" p="20px">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          width="70%"
          maxWidth="500px"
          gap="30px"
          boxShadow="2"
          borderRadius="15px"
          p="20px"
        >
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
        </Box>
      </Box>
    </Box>
  ) : (
    "Loading"
  )
}

export default PreferencesPage
