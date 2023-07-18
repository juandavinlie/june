import { Box, Typography } from "@mui/material"
import shopifyLogo from "../../../public/shopify.png"
import manualLogo from "../../../public/pencil.png"
import { useContext } from "react"
import { ScreenContext } from "../../_app"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useRouter } from "next/router"

const AddStorePage = () => {
  const router = useRouter()
  const isMobileScreen = useContext(ScreenContext)
  const integrations = [
    ["Link with Shopify", shopifyLogo, ""],
    ["Manual Entry", manualLogo, "/stores/add/manual"],
  ]
  return (
    <Box display="flex" flexDirection="column" gap="20px" p="20px">
      <Box
        display="flex"
        gap="5px"
        onClick={() => {
          router.push("/stores")
        }}
        sx={{ "&:hover": { cursor: "pointer" } }}
      >
        <ArrowBackIcon />
        <Typography>Back</Typography>
      </Box>
      <Typography variant="h5" textAlign="center">
        Select an Integration Method
      </Typography>
      <Box
        display="grid"
        rowGap="1rem"
        gridTemplateColumns={`repeat(${!isMobileScreen ? 3 : 2}, 200px)`}
      >
        {integrations.map((integration: any) => {
          return (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="150px"
              height="150px"
              boxShadow="2"
              gap="5px"
              onClick={() => {
                router.push(integration[2])
              }}
              sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
            >
              <img width="60%" height="60%" src={integration[1].src} />
              <Typography variant="h6">{integration[0]}</Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default AddStorePage
