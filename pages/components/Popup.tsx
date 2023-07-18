import { Box, useMediaQuery } from "@mui/material"
import { ReactNode, useEffect, useState } from "react"

import CloseSharpIcon from "@mui/icons-material/CloseSharp"

interface PopupProps {
  children: ReactNode
  removePopup: () => void
}

const Popup = ({ children, removePopup }: PopupProps) => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  
  const getTopMargin = () => {
    return dimensions.height * 0.5 - 375
  }
  const getLeftMargin = () => {
    return 256 + (dimensions.width - 256) * 0.5 - 375
  }

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
    <Box>
      <Box
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
        onClick={removePopup}
        zIndex={0}
      />
      <Box
        position="fixed"
        width="750px"
        height="750px"
        top={getTopMargin()}
        left={getLeftMargin()}
        borderRadius="10px"
        bgcolor="white"
        p="15px"
        zIndex={10}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Popup
