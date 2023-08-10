import { Box } from "@mui/material"
import juneTextLogo from "../../../public/June-text-logo.png"
import Image from "next/image"

const JuneTextLogo = () => {
  return (
    <Box width="80px" height="28px" position="relative">
      <Image
        src={juneTextLogo.src}
        alt="June Logo"
        fill={true}
        style={{
          objectFit: "contain",
        }}
      />
    </Box>
  )
}

export default JuneTextLogo
