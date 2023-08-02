import { Box, Divider, Typography } from "@mui/material"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import BorderedBox from "../components/common/BorderedBox"
import { useContext, useEffect } from "react"
import { HeaderContext } from "../components/common/HeaderLayout"

const PreferencesPage = () => {
  const setHeaderTitle = useContext(HeaderContext)
  const user = useUser()

  useEffect(() => {
    setHeaderTitle([{ text: "Preferences", link: "/preferences" }])
  }, [])

  return user ? (
    <Box display="flex" p="20px">
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
    </Box>
  ) : (
    "Loading"
  )
}

export default PreferencesPage
