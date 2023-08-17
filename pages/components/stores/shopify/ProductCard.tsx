import { Box, Divider, Typography } from "@mui/material"
import { ShopifyProduct } from "../../../../models/ShopifyProduct"
import { useContext } from "react"
import { Product } from "@/models/Product"
import { Variant } from "../AddProductPopup"
import { StoreContext } from "@/pages/stores/[storeId]"
import { Store } from "@/models/Store"
import { currencyLocale } from "@/utils"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const store: Store = useContext(StoreContext)

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
          {product.productVariants.map((variant: Variant, idx) => {
            const formatString = new Intl.NumberFormat(
              currencyLocale(store.currency),
              {
                style: "currency",
                currency: store.currency ? store.currency : "USD",
                minimumFractionDigits: 2,
              }
            )
            const priceFormattedString = formatString.format(variant.price!)
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
                  {/* <Typography variant="h6">{`Stock: ${variant.inventory_quantity}`}</Typography> */}
                </Box>
                <Typography>{`${priceFormattedString}`}</Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default ProductCard
