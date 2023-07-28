import SideBar from "./SideBar"
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Box } from "@mui/material"
import { useSessionContext, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import HeaderLayout from "./HeaderLayout"
import { ScreenContext } from "../../_app"

interface SideBarLayoutProps {
  children: ReactNode
}

export const SideBarContext = createContext<
  [boolean, (value: boolean) => void]
>([false, () => {}])

const SideBarLayout = ({ children }: SideBarLayoutProps) => {
  const user = useUser()
  const { isLoading } = useSessionContext()

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const router = useRouter()
  const isMobileScreen = useContext(ScreenContext)
  const [showSideBar, setShowSideBar] = useState(false)

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

  useEffect(() => {
    if (!isMobileScreen) {
      setShowSideBar(false)
    }
  }, [isMobileScreen])

  return (
    user && (
      <SideBarContext.Provider value={[showSideBar, setShowSideBar]}>
        <Box display="flex">
          {(!isMobileScreen || showSideBar) && <SideBar />}
          {isMobileScreen && showSideBar && (
            <Box
              position="fixed"
              top="0"
              bottom="0"
              left="0"
              right="0"
              zIndex="1"
              sx={{
                bgcolor: "black",
                opacity: 0.6,
              }}
              onClick={() => {
                setShowSideBar(false)
              }}
            />
          )}
          <Box
            position="relative"
            left={isMobileScreen ? "0" : "256px"}
            width={isMobileScreen ? "100%" : `${dimensions.width - 256}px`}
            height="100vh"
            zIndex="0"
          >
            <HeaderLayout>{children}</HeaderLayout>
          </Box>
        </Box>
      </SideBarContext.Provider>
    )
  )
}

export default SideBarLayout
