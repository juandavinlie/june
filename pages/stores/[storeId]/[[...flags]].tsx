import { Box, Button, Divider, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"
import { ShopifyProduct } from "@/models/ShopifyProduct"
import { addProductList } from "@/redux/UserStoresProductsSlice"
import { Product } from "@/models/Product"
import ShopifyProductCard from "@/pages/components/shopify/ShopifyProductCard"

import shopifyLogo from "../../../public/shopify.png"
import IntegrationLogo from "@/pages/components/IntegrationLogo"

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

  let conversationPageLink = ""

  // GETTERS
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

  // EMBEDDINGS STATUSES
  const [hasEmbeddings, setHasEmbeddings] = useState<boolean | null>(null)
  const [embeddingsTimestamp, setEmbeddingsTimestamp] = useState<string | null>(
    null
  )
  const [isEmbedding, setIsEmbedding] = useState<boolean | null>(null)

  const getEmbeddingStatuses = async () => {
    const response = await fetch(
      `/api/stores/${store.storeId as string}/embeddings`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      setHasEmbeddings(data.has_embeddings)
      setEmbeddingsTimestamp(data.last_embeddings_timestamp)
      setIsEmbedding(data.is_embedding)
    }
  }

  // SYNCING STATUSES
  const [isSyncing, setIsSyncing] = useState<boolean | null>(null)
  const [syncTimestamp, setSyncTimestamp] = useState<string | null>(null)

  const getSyncingStatuses = async () => {
    const response = await fetch(
      `/api/stores/${store.storeId as string}/syncing`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      setIsSyncing(data.is_syncing)
      setSyncTimestamp(data.last_sync_timestamp)
    }
  }

  // ACTIONS
  const copyConversationPageLink = () => {
    navigator.clipboard.writeText(conversationPageLink)
  }

  const syncStoreData = async () => {
    setIsSyncing(true)
    console.log("Syncing Store Data")
    const response = await fetch(`/api/stores/${store.storeId}/sync`, {
      method: "POST",
    })
    if (response.ok) {
    }
  }

  const embedStoreData = async () => {
    setIsEmbedding(true)
    console.log("Embedding Store Data")
    const response = await fetch(`/api/stores/${store.storeId}/embed`, {
      method: "POST",
    })
    if (response.ok) {
    }
  }

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer")
    if (newWindow) newWindow.opener = null
  }

  // INITIALISATIONS
  useEffect(() => {
    if (!router.isReady) return
  }, [router.isReady])

  useEffect(() => {
    if (!store) return

    if (router.query.flags && router.query.flags.includes("initial")) {
      syncStoreData()
    }

    conversationPageLink = `${process.env.NEXT_PUBLIC_SHOPIFY_HOST_SCHEME}://${process.env.NEXT_PUBLIC_SHOPIFY_HOST_NAME}/conversation/${store.storeId}`

    if (!products) {
      getProducts()
    }

    getSyncingStatuses()
    getEmbeddingStatuses()
  }, [store])

  const [embeddingIntervalId, setEmbeddingIntervalId] =
    useState<NodeJS.Timer | null>(null)

  useEffect(() => {
    if (embeddingIntervalId) {
      clearInterval(embeddingIntervalId)
    }
    if (isEmbedding) {
      setEmbeddingIntervalId(setInterval(getEmbeddingStatuses, 5000))
    }
  }, [isEmbedding])

  const [syncIntervalId, setSyncIntervalId] = useState<NodeJS.Timer | null>(
    null
  )

  useEffect(() => {
    if (syncIntervalId) {
      clearInterval(syncIntervalId)
      getProducts()
    }
    if (isSyncing) {
      setSyncIntervalId(setInterval(getSyncingStatuses, 5000))
    }
  }, [isSyncing])

  return store && router.isReady ? (
    <Box display="flex" flexDirection="column" p="20px" gap="10px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" gap="10px">
          <Typography variant="h3">{store.name}</Typography>
          <IntegrationLogo
            integration={store.integration}
            logoSrc={shopifyLogo.src}
          />
        </Box>
        <Box display="flex" gap="5px">
          <Button
            variant="outlined"
            onClick={copyConversationPageLink}
            sx={{ textTransform: "none" }}
          >
            Copy June Link
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (!isSyncing && !isEmbedding) {
                syncStoreData()
              }
            }}
            sx={{ textTransform: "none" }}
          >
            Sync
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (!isSyncing && !isEmbedding) {
                embedStoreData()
              }
            }}
            sx={{ textTransform: "none" }}
          >
            Embed
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              openInNewTab(`/conversation/${store.storeId}`)
            }}
            sx={{ textTransform: "none" }}
          >
            Test
          </Button>
        </Box>
      </Box>
      <Typography variant="h5">
        Store Data:{" "}
        {isSyncing === null || syncTimestamp === null
          ? "Loading..."
          : isSyncing
          ? "In Progress..."
          : syncTimestamp
          ? `Synced on ${new Date(syncTimestamp)}`
          : "No yet synced"}
      </Typography>
      <Typography variant="h5">
        Embeddings:{" "}
        {hasEmbeddings === null || isEmbedding === null
          ? "Loading..."
          : isEmbedding
          ? "In Progress..."
          : hasEmbeddings && embeddingsTimestamp
          ? `Updated on ${new Date(embeddingsTimestamp)}`
          : "No embeddings yet"}
      </Typography>
      <Divider />
      {products &&
        products.map((product: Product) => {
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
    <Box>Loading</Box>
  )
}

export default StorePage
