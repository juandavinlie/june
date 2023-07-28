import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react"
import { Box, Divider, Typography } from "@mui/material"
import { useRouter } from "next/router"

import MenuIcon from "@mui/icons-material/Menu"
import { ScreenContext } from "../../_app"
import { SideBarContext } from "./SideBarLayout"
import { createContext } from "react"

interface HeaderLayoutProps {
  children: ReactNode
}

export interface Title {
  text: string
  link: string
}

export const HeaderContext = createContext<Dispatch<SetStateAction<Title[]>>>(
  () => {}
)

const HeaderLayout = ({ children }: HeaderLayoutProps) => {
  const router = useRouter()
  const [headerTitle, setHeaderTitle] = useState<Title[]>([
    { text: "June", link: "/" },
  ])
  const isMobileScreen = useContext(ScreenContext)
  const [showSideBar, setShowSideBar] = useContext(SideBarContext)

  return (
    <HeaderContext.Provider value={setHeaderTitle}>
      <Box width="auto">
        <Box
          height="68px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p="20px"
        >
          {isMobileScreen && (
            <MenuIcon
              onClick={() => {
                setShowSideBar(!showSideBar)
              }}
              sx={{ "&:hover": { cursor: "pointer" } }}
            />
          )}
          <Box display="flex">
            {headerTitle.map((title: Title, idx: number) => (
              <Box display="flex" p={idx !== 0 ? "0 10px" : "0"} gap="10px" key={idx}>
                <Box
                  onClick={() => {
                    router.push(title.link)
                  }}
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <Typography variant="title">{title.text}</Typography>
                </Box>
                {idx !== headerTitle.length - 1 && (
                  <Typography variant="h6">/</Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
        <Divider color="#D3D3D3" />
        {children}
      </Box>
    </HeaderContext.Provider>
  )
}

export default HeaderLayout
