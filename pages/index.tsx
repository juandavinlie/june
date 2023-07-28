import {
  useSessionContext,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react"
import { Box, Typography } from "@mui/material"
import { useContext, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { HeaderContext } from "./components/common/HeaderLayout"
import { openInNewTab } from "@/utils"

export default function Home() {
  const user = useUser()
  const setHeaderTitle = useContext(HeaderContext)
  const { isLoading } = useSessionContext()

  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }

    setHeaderTitle([{ text: "Home", link: "/" }])
  }, [isLoading, user])

  return (
    user && (
      <Box display="flex" flexDirection="column" gap="10px" p="30px">
        <Typography>Welcome to June.</Typography>
        <Typography
          variant="h6"
          sx={{ textDecoration: "underline", "&:hover": { cursor: "pointer" } }}
        >
          <Link href="/privacy" target="_blank" rel="noopener noreferrer">
            Take a look at our Privacy Policy.
          </Link>
        </Typography>
      </Box>
    )
  )
}
