import SideBar from "./SideBar"
import { ReactNode, useEffect } from "react"
import { Box } from "@mui/material"
import { useSessionContext, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"

interface SideBarLayoutProps {
  children: ReactNode
}

const SideBarLayout = ({ children }: SideBarLayoutProps) => {
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
      <Box display="flex">
        <SideBar />
        <Box position="relative" left="256px">
          {children}
        </Box>
      </Box>
    )
  )
}

export default SideBarLayout
