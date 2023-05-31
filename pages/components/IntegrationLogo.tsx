import { Box } from "@mui/material"

interface LogoProps {
  integration: string
  logoSrc: string
}

const IntegrationLogo = ({ integration, logoSrc }: LogoProps) => {
  return integration === "shopify" ? (
    <Box>
      <img width="auto" height="30px" src={logoSrc} />
    </Box>
  ) : (
    <></>
  )
}

export default IntegrationLogo
