import { Box } from "@mui/material"
import { ReactNode } from "react"

interface BorderedBoxProps {
  children: ReactNode
}

const AddProductSectionBox = ({ children }: BorderedBoxProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      maxWidth="620px"
      gap="5px"
      boxShadow="1"
      borderRadius="10px"
      border="0.5px solid #D3D3D3"
      p="15px"
      bgcolor="white"
    >
      {children}
    </Box>
  )
}

export default AddProductSectionBox
