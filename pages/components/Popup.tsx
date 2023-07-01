import { Box } from "@mui/material"
import { ReactNode } from "react"

import CloseSharpIcon from "@mui/icons-material/CloseSharp"

interface PopupProps {
  children: ReactNode
  removePopup: () => void
}

const Popup = ({ children, removePopup }: PopupProps) => {
  return (
    <Box
      display="flex"
      position="absolute"
      top="0"
      bottom="0"
      left="0"
      right="0"
      justifyContent="center"
      alignItems="center"
      sx={{
        bgcolor: "black",
        opacity: 0.6,
      }}
      zIndex={0}
    >
      <Box
        position="absolute"
        top="100px"
        right="100px"
        sx={{ "&:hover": { cursor: "pointer" } }}
        onClick={removePopup}
      >
        <CloseSharpIcon fontSize="large" style={{ color: "white" }} />
      </Box>
      <Box zIndex={10}>{children}</Box>
    </Box>
  )
}

export default Popup
