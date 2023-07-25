import { ReactNode, useContext, useState } from "react"
import { Box, Divider, Typography } from "@mui/material"
import { useRouter } from "next/router"

import MenuIcon from "@mui/icons-material/Menu"
import { ScreenContext } from "../../_app"
import { SideBarContext } from "./SideBarLayout"

interface HeaderLayoutProps {
  children: ReactNode
}

const HeaderLayout = ({ children }: HeaderLayoutProps) => {
  const router = useRouter()
  const paths = router.asPath.split("/").slice(1)
  const isMobileScreen = useContext(ScreenContext)
  const [showSideBar, setShowSideBar] = useContext(SideBarContext)

  return (
    <Box width="auto">
      <Box height="62px" display="flex" justifyContent={isMobileScreen ? "space-between" : "flex-end"} p="20px">
        {isMobileScreen && (
          <MenuIcon
            onClick={() => {
              setShowSideBar(!showSideBar)
            }}
            sx={{ "&:hover": { cursor: "pointer" } }}
          />
        )}
        <Typography>June</Typography>
      </Box>
      <Divider color="#D3D3D3" />
      {children}
    </Box>
  )
}

export default HeaderLayout
