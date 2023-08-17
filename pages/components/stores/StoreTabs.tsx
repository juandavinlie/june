import { Box, Tabs } from "@mui/material"
import { StyledTab } from "../../components/stores/StyledTab"
import { useContext, useState } from "react"
import StoreProductsTab from "./StoreProductsTab"
import StoreSummaryTab from "./StoreSummaryTab"
import { StoreProductsContext } from "@/pages/stores/[storeId]"

const StoreTabs = () => {
  const bodies = [
    <StoreSummaryTab key="summary" />,
    <StoreProductsTab key="products" />,
  ]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { isLoadingProducts, products } = useContext(StoreProductsContext)

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
          <StyledTab label="Overview" />
          <StyledTab label={isLoadingProducts || !products ? "Products" : `Products (${products.length})`} />
        </Tabs>
      </Box>
      <Box height="auto" width="100%" paddingTop="40px">
        {bodies[selectedIndex]}
      </Box>
    </Box>
  )
}

export default StoreTabs
