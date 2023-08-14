import { Box, Typography } from "@mui/material"
import shopifyLogo from "../../../public/shopify.png"
import juneLogo from "../../../public/June-logo.png"
import { useContext, useEffect } from "react"
import { ScreenContext } from "../../_app"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useRouter } from "next/router"
import { openInNewTab } from "@/utils"
import { HeaderContext } from "@/pages/components/common/HeaderLayout"

const AddStorePage = () => {
  const router = useRouter()
  const isMobileScreen = useContext(ScreenContext)
  const integrations = [
    ["Link with Shopify", shopifyLogo, "https://apps.shopify.com/june-ai"],
    ["Manual Entry", juneLogo, "/stores/add/manual"],
  ]

  const setHeaderTitle = useContext(HeaderContext)

  useEffect(() => {
    setHeaderTitle([{ text: "Stores", link: "/stores" }, { text: "Add", link: "/stores/add" }])
  }, [])

  return (
    <Box display="flex" flexDirection="column" gap="20px" p="20px">
      <Box
        display="grid"
        rowGap="1rem"
        gridTemplateColumns={`repeat(${!isMobileScreen ? 3 : 2}, 200px)`}
      >
        {integrations.map((integration: any, idx: number) => {
          return (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="150px"
              height="150px"
              boxShadow="2"
              borderRadius="5px"
              gap="5px"
              onClick={() => {
                if (idx === 0) {
                  openInNewTab(integration[2])
                } else {
                  router.push(integration[2])
                }
              }}
              sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
              key={idx}
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
