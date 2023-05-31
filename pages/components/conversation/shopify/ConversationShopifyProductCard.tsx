import { Box, Divider, Typography } from "@mui/material"
import { useState } from "react"
import { ShopifyProduct } from "../../../models/ShopifyProduct"

interface ConversationShopifyProductCardProps {
  product: ShopifyProduct
}

const ConversationShopifyProductCard = ({
  product,
}: ConversationShopifyProductCardProps) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  return (
    <Box
      display="flex"
      border="0.5px solid #D3D3D3"
      borderRadius="5px"
      gap="10px"
      p="10px"
    >
      {product.image !== null && (
        <img width="auto" height="300px" src={product.image} />
      )}
      <Box display="flex" width="100%" flexDirection="column" gap="10px">
        <Typography variant="h6">{`(id: ${product.productId})`}</Typography>
        <Typography variant="h4">{product.name}</Typography>
        <Typography>
          {product.description ? product.description : "No Description"}
        </Typography>
        <Divider />
        <Box
          display="flex"
          flexDirection="column"
          gap="5px"
          height="45%"
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
                border={`${
                  idx === selectedVariantIdx ? "2px" : "0.5px"
                } solid ${idx === selectedVariantIdx ? "black" : "#D3D3D3"}`}
                borderRadius="7px"
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                    bgcolor: "#D3D3D3",
                  },
                }}
                onClick={() => {
                  setSelectedVariantIdx(idx)
                }}
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
        <Divider />
        <Box display="flex" justifyContent="flex-end" gap="5px">
          <Typography>Price:</Typography>
          <Typography>
            {product.productVariants[selectedVariantIdx].price}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ConversationShopifyProductCard
