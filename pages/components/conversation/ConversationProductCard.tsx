import { Box, Divider, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { Product } from "../../../models/Product"
import { ScreenContext } from "@/pages/_app"
import { Variant } from "../stores/AddProductPopup"

interface ConversationProductCardProps {
  product: Product
}

const ConversationProductCard = ({ product }: ConversationProductCardProps) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const isMobileScreen = useContext(ScreenContext)
  return (
    <Box
      display="flex"
      flexDirection={isMobileScreen ? "column" : "row"}
      border="0.5px solid #D3D3D3"
      borderRadius="5px"
      gap="10px"
      p="10px"
    >
      {product.image !== null && (
        <img
          width={isMobileScreen ? "100%" : "20%"}
          src={product.image}
          style={{ objectFit: "contain" }}
        />
      )}
      <Box display="flex" width="100%" flexDirection="column" gap="10px">
        <Typography variant="h6">{`(id: ${product.productId})`}</Typography>
        <Typography variant="h4">{product.name}</Typography>
        <Typography
          dangerouslySetInnerHTML={{
            __html: product.description
              ? product.description
              : "No Description",
          }}
        />
        <Divider />
        <Box
          display="flex"
          flexDirection="column"
          gap="5px"
          height="auto"
          maxHeight="300px"
          sx={{
            overflowX: "hidden",
          }}
        >
          {product.productVariants.map((variant: Variant, idx: number) => {
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

export default ConversationProductCard
