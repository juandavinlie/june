import { Box } from "@mui/material"
import Popup from "../Popup"

import shopifyLogo from "../../../public/shopify.png"

interface AddStorePopupProps {
  removePopup: () => void
}

const AddStorePopup = ({ removePopup }: AddStorePopupProps) => {
  const integrations = [["Shopify", shopifyLogo]]

  return (
    <Popup removePopup={removePopup}>
      <Box display="flex" gap="10px">
        {integrations.map((integration: any, idx: number) => {
          return (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100px"
              width="300px"
              bgcolor="white"
              borderRadius="10px"
              sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
              onClick={() => {}}
              key={idx}
            >
              {integration[0]}
            </Box>
          )
        })}
      </Box>
    </Popup>
  )
}

export default AddStorePopup
