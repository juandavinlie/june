import {
  useSessionContext,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react"
import { Box } from "@mui/material"
import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Home() {
  const user = useUser()
  const { isLoading } = useSessionContext()

  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user])

  return <Box>{user && <Box>Home</Box>}</Box>
}
