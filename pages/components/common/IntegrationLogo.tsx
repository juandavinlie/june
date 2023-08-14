import { Box } from "@mui/material"
import shopifyLogo from "../../../public/shopify.png"
import juneLogo from "../../../public/June-logo.png"

interface LogoProps {
  integration: string
  logoSrc: string
}

const getLogoSrc = (integration: string) => {
  if (integration === "shopify") {
    return shopifyLogo.src
  } else if (integration === "manual") {
    return juneLogo.src
  }
}

const IntegrationLogo = ({ integration }: LogoProps) => {
  return (
    <Box>
      <img width="auto" height="30px" src={getLogoSrc(integration)} />
    </Box>
  )
}

export default IntegrationLogo
