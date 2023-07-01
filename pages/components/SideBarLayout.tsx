import SideBar from "./SideBar"
import { ReactNode, useEffect, useRef, useState } from "react"
import { Box } from "@mui/material"
import { useSessionContext, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import HeaderLayout from "./HeaderLayout"

interface SideBarLayoutProps {
  children: ReactNode
}

const SideBarLayout = ({ children }: SideBarLayoutProps) => {
  const user = useUser()
  const { isLoading } = useSessionContext()

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user])

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      })
    }

    window.addEventListener("resize", handleResize)
  }, [])

  return (
    user && (
      <Box display="flex">
        <SideBar />
        <Box
          position="relative"
          left="256px"
          width={`${dimensions.width - 256}px`}
          height="100vh"
        >
          <HeaderLayout>{children}</HeaderLayout>
        </Box>
      </Box>
    )
  )
}

export default SideBarLayout
