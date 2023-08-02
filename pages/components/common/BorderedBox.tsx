import { Box } from "@mui/material"
import { ReactNode } from "react"

interface BorderedBoxProps {
  children: ReactNode
}

const BorderedBox = ({ children }: BorderedBoxProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      width="100%"
      gap="30px"
      boxShadow="2"
      borderRadius="15px"
      p="20px"
      bgcolor="white"
    >
      {children}
    </Box>
  )
}

export default BorderedBox
