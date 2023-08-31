import { ScreenContext } from "@/pages/_app"
import { Box, useMediaQuery } from "@mui/material"
import { ReactNode, useContext, useEffect, useState } from "react"

interface PopupProps {
  children: ReactNode
  removePopup: () => void
}

const Popup = ({ children, removePopup }: PopupProps) => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })

  const popupWidth = 750
  const popupHeight = 800

  const isMobileScreen = useContext(ScreenContext)

  const getTopMargin = () => {
    return 35
  }
  const getLeftMargin = () => {
    return 256 + (dimensions.width - 256) * 0.5 - popupWidth / 2
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="fixed"
      left="0"
      right="0"
      top="0"
      bottom="0"
    >
      <Box
        position="absolute"
        top="0"
        bottom="0"
        left="0"
        right="0"
        sx={{
          bgcolor: "black",
          opacity: 0.6,
        }}
        onClick={removePopup}
        zIndex={0}
      />
      <Box
        position="absolute"
        width={isMobileScreen ? "90%" : "70%"}
        maxWidth={popupWidth}
        maxHeight="80%"
        borderRadius="10px"
        bgcolor="white"
        p="20px"
        zIndex={10}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Popup
