import { Box, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"
import { ShopifyProduct } from "@/pages/models/ShopifyProduct"
import { addProductList } from "@/redux/UserStoresProductsSlice"
import { Product } from "@/pages/models/Product"
import ShopifyProductCard from "@/pages/components/ShopifyProductCard"

const StorePage = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const store = useSelector(
    (state: RootState) =>
      state.userStoresSliceReducer.stores[router.query.storeId as string]
  )

  const products = useSelector(
    (state: RootState) =>
      state.userStoresProductsSliceReducer.productLists &&
      state.userStoresProductsSliceReducer.productLists[
        router.query.storeId as string
      ]
  )

  const getProducts = async () => {
    const response = await fetch(
      `/api/stores/${store.storeId as string}/products`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      let formattedProducts = []
      if (store.integration === "shopify") {
        formattedProducts = data.map(
          (product: any) => new ShopifyProduct(product)
        )
      }
      dispatch(
        addProductList({
          storeId: store.storeId,
          productList: formattedProducts,
        })
      )
    }
  }

  const [isLoadingHasEmbeddingsStatus, setIsLoadingHasEmbeddingsStatus] =
    useState(false)
  const [hasEmbeddings, setHasEmbeddings] = useState([false, null])

  const getHasEmbeddingsStatus = async () => {
    setIsLoadingHasEmbeddingsStatus(true)
    const response = await fetch(
      `/api/stores/${store.storeId as string}/has_embeddings`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      setHasEmbeddings([data.has_embeddings, data.last_embeddings_timestamp])
    }
    setIsLoadingHasEmbeddingsStatus(false)
  }

  const [isEmbedding, setIsEmbedding] = useState(false)

  const getIsEmbeddingStatus = async () => {
    const response = await fetch(
      `/api/stores/${store.storeId as string}/is_embedding`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      setIsEmbedding(data.is_embedding)
    }
  }

  const getEmbeddingStatuses = () => {
    getHasEmbeddingsStatus()
    getIsEmbeddingStatus()
  }

  const [isGettingEmbeddingStatuses, setIsGettingEmbeddingStatuses] =
    useState(false)

  const embedStoreData = async () => {
    console.log("Embedding store data")
    const response = await fetch(`/api/stores/${store.storeId}/embed`, {
      method: "POST",
    })
    if (response.ok) {
    }
  }

  useEffect(() => {
    if (!router.isReady) return
  }, [router.isReady])

  useEffect(() => {
    if (!store) return

    if (true) {
      getProducts()
    }

    getHasEmbeddingsStatus()
    getIsEmbeddingStatus()
  }, [store])

  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null)

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    if (isEmbedding) {
      setIsGettingEmbeddingStatuses(true)
      setIntervalId(setInterval(getEmbeddingStatuses, 5000))
    } else {
      setIsGettingEmbeddingStatuses(false)
    }
  }, [isEmbedding])

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer")
    if (newWindow) newWindow.opener = null
  }

  return store ? (
    <Box display="flex" flexDirection="column" p="20px" gap="10px">
      <Typography variant="h3">{store.name}</Typography>
      <Typography variant="h6">{store.integration}</Typography>
      <Box
        display="flex"
        flexDirection="column"
        border="1px solid #D3D3D3"
        p="10px"
        gap="5px"
      >
        <Typography>June Assistant</Typography>
        <Typography variant="h5">
          {isLoadingHasEmbeddingsStatus || isGettingEmbeddingStatuses
            ? "Loading..."
            : hasEmbeddings[0]
            ? `Last Updated at ${hasEmbeddings[1]}`
            : "No embeddings yet"}
        </Typography>
        <Box
          borderRadius="5px"
          border="0.5px solid #D3D3D3"
          p="5px"
          width="fit-content"
          onClick={() => {
            setIsEmbedding(true)
            embedStoreData()
          }}
          sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
        >
          Upload Store Data to June Assistant
        </Box>
        <Box
          borderRadius="5px"
          border="0.5px solid #D3D3D3"
          p="5px"
          width="fit-content"
          onClick={() => {
            openInNewTab(`/conversation/${store.storeId}`)
          }}
          sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
        >
          Click to talk with your June
        </Box>
      </Box>
      <Typography variant="h5">Products</Typography>
      {products.map((product: Product) => {
        if (store.integration === "shopify") {
          const shopifyProduct = product as ShopifyProduct
          return (
            <ShopifyProductCard
              product={shopifyProduct}
              key={shopifyProduct.productId}
            />
          )
        }
      })}
    </Box>
  ) : (
    <Box>Empty</Box>
  )
}

export default StorePage
