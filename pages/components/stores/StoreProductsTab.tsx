import { Box, Button, Typography } from "@mui/material"
import AddProductPopup from "./AddProductPopup"
import { Product } from "@/models/Product"
import ProductCard from "./shopify/ProductCard"

import LoadingWidget from "@/pages/components/common/LoadingWidget"
import emptyLogo from "../../../public/box.png"
import {
  StoreProductsHook,
} from "@/pages/hooks/stores/useStoreProducts"
import { useContext, useState } from "react"
import { Store } from "@/models/Store"
import { StoreContext, StoreProductsContext } from "@/pages/stores/[storeId]"

const StoreProductsTab = () => {
  const store: Store = useContext(StoreContext)
  const storeProductsHookObj: StoreProductsHook =
    useContext(StoreProductsContext)
  const { products, isLoadingProducts, getProducts } = storeProductsHookObj

  // ADDING PRODUCTS
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  return (
    <Box display="flex" flexDirection="column" gap="10px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="tabtitle">Products</Typography>
        {store.integration === "manual" && (
          <Box display="flex">
            <Button
              variant="outlined"
              onClick={() => {
                setIsAddingProduct(true)
              }}
            >
              Add product
            </Button>
          </Box>
        )}
      </Box>
      {isLoadingProducts ? (
        <LoadingWidget color="black" text="Loading store products..." />
      ) : products && products.length > 0 ? (
        products.map((product: Product, idx: number) => {
          return <ProductCard product={product} key={product.productId} />
        })
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="150px"
          border="0.5px solid gray"
          borderRadius="10px"
          gap="5px"
        >
          <img height="50%" src={emptyLogo.src} />
          No products added yet.
        </Box>
      )}
      {isAddingProduct && (
        <AddProductPopup
          store={store}
          removePopup={() => {
            getProducts()
            setIsAddingProduct(false)
          }}
        />
      )}
    </Box>
  )
}

export default StoreProductsTab
