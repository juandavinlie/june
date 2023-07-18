import { Box } from "@mui/material"
import { ReactNode } from "react"

interface BorderedBoxProps {
  children: ReactNode
}

const BorderedBox = ({ children }: BorderedBoxProps) => {
  return (
    <Box display="flex" flexDirection="column" width="100%" height="100vh">
      <Box display="flex" p="20px">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          width="70%"
          maxWidth="500px"
          gap="30px"
          boxShadow="2"
          borderRadius="15px"
          p="20px"
          bgcolor="white"
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default BorderedBox