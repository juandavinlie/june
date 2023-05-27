import { Box } from "@mui/material"
import { ShopifyProduct } from "../models/ShopifyProduct"

interface ConversationShopifyProductCardProps {
    product: ShopifyProduct
}

const ConversationShopifyProductCard = ({ product }: ConversationShopifyProductCardProps) => {
  return <Box border="0.5px solid #D3D3D3" borderRadius="5px" p="2px">{product.productId}</Box>
}

export default ConversationShopifyProductCard
