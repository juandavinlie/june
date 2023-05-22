import SideBar from "./SideBar"
import { ReactNode } from "react"
import { Box, Divider, Typography } from "@mui/material"

interface HeaderLayoutProps {
  children: ReactNode
}

const HeaderLayout = ({ children }: HeaderLayoutProps) => {
  return (
    <Box width="80vw">
      <Box height="60px" display="flex" flexDirection="column" p="20px">
        <Typography>TITLE</Typography>
      </Box>
      <Divider color="#D3D3D3" />
      {children}
    </Box>
  )
}

export default HeaderLayout
