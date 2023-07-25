import { Box, Divider, Typography } from "@mui/material"
import { ShopifyProduct } from "../../../../models/ShopifyProduct"
import { useContext } from "react"
import { ScreenContext } from "@/pages/_app"

interface ShopifyProductCardProps {
  product: ShopifyProduct
}

const ShopifyProductCard = ({ product }: ShopifyProductCardProps) => {
  const isMobileScreen = useContext(ScreenContext)
  return (
    <Box
      display="flex"
      border="1px solid #D3D3D3"
      gap="5px"
      p="5px"
      height="300px"
      borderRadius="5px"
    >
      {product.image && <img src={product.image} height="100%" />}
      <Box display="flex" flexDirection="column" gap="5px" width="100%">
        <Typography variant="h6">{`id: ${product.productId}`}</Typography>
        <Typography>{product.name}</Typography>
        <Typography variant="h5">{product.description}</Typography>
        <Divider />
        <Box
          display="flex"
          flexDirection="column"
          height="150px"
          width="100%"
          gap="5px"
          sx={{
            overflowX: "hidden",
          }}
        >
          {product.productVariants.map((variant: any, idx) => {
            return (
              <Box
                display="flex"
                justifyContent="space-between"
                p="10px"
                border="0.5px solid #D3D3D3"
                borderRadius="7px"
                key={idx}
              >
                <Box display="flex" alignItems="flex-end" gap="5px">
                  <Typography>{variant.title}</Typography>
                  <Typography variant="h6">{`Stock: ${variant.inventory_quantity}`}</Typography>
                </Box>
                <Typography>{variant.price}</Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default ShopifyProductCard
