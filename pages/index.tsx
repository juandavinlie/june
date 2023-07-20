import {
  useSessionContext,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react"
import { Box, Typography } from "@mui/material"
import { useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"

export default function Home() {
  const user = useUser()
  const { isLoading } = useSessionContext()

  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user])

  return (
    user && (
      <Box display="flex" flexDirection="column" gap="10px" p="30px">
        <Typography>Welcome to June.</Typography>
        <Typography
          variant="h6"
          sx={{ textDecoration: "underline", "&:hover": { cursor: "pointer" } }}
        >
          <Link href="/privacy">Take a look at our Privacy Policy.</Link>
        </Typography>
      </Box>
    )
  )
}
