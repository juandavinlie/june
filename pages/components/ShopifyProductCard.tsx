import { Box, Typography } from "@mui/material"
import { ShopifyProduct } from "../models/ShopifyProduct"

interface ShopifyProductCardProps {
  product: ShopifyProduct
}

const ShopifyProductCard = ({ product }: ShopifyProductCardProps) => {
  return (
    <Box display="flex" height="50px" border="1px solid black" gap="5px">
      <Typography>{product.productId}</Typography>
      <Typography>{product.name}</Typography>
      <Typography>{product.description}</Typography>
    </Box>
  )
}

export default ShopifyProductCard
