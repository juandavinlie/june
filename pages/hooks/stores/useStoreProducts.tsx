import { ManualProduct } from "@/models/ManualProduct"
import { Product } from "@/models/Product"
import { ShopifyProduct } from "@/models/ShopifyProduct"
import { addProductList } from "@/redux/UserStoresProductsSlice"
import { RootState } from "@/redux/config"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export interface StoreProductsHook {
  products: Product[]
  isLoadingProducts: boolean
  getProducts: () => void
}

export const useStoreProducts = (storeId: string) => {
  const dispatch = useDispatch()

  // PRODUCTS
  const products = useSelector(
    (state: RootState) =>
      state.userStoresProductsSliceReducer.productLists &&
      state.userStoresProductsSliceReducer.productLists[storeId]
  )

  // LOADING STATUSES
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // FETCHER
  const getProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await fetch(`/api/stores/${storeId}/products`, {
        method: "GET",
      })
      if (response.ok) {
        const data = await response.json()
        const integration = storeId.split("_")[0]
        let formattedProducts: Product[] = []
        if (integration === "shopify") {
          formattedProducts = data.map(
            (product: any) => new ShopifyProduct(product)
          )
        } else if (integration === "manual") {
          formattedProducts = data.map(
            (product: any) => new ManualProduct(product)
          )
        }
        dispatch(
          addProductList({
            storeId: storeId,
            productList: formattedProducts,
          })
        )
      }
    } catch (error) {
      // TODO: throw error here
    } finally {
      setIsLoadingProducts(false)
    }
  }

  return { products, isLoadingProducts, getProducts } as StoreProductsHook
}
