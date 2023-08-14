import { Box, Tabs } from "@mui/material"
import { StyledTab } from "../../components/stores/StyledTab"
import { useState } from "react"
import StoreProductsTab from "./StoreProductsTab"
import StoreSummaryTab from "./StoreSummaryTab"

const StoreTabs = () => {
  const bodies = [
    <StoreSummaryTab key="summary" />,
    <StoreProductsTab key="products" />,
  ]
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newIndex: number) => {
    setSelectedIndex(newIndex)
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedIndex}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <StyledTab label="Summary" />
          <StyledTab label="Products" />
        </Tabs>
      </Box>
      <Box height="auto" width="100%" paddingTop="40px">
        {bodies[selectedIndex]}
      </Box>
    </Box>
  )
}

export default StoreTabs
