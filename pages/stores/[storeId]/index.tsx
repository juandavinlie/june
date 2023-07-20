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
import emptyLogo from "../../../public/box.png"
import IntegrationLogo from "@/pages/components/IntegrationLogo"
import { Store } from "@/models/Store"
import { addStore } from "@/redux/UserStoresSlice"
import AddProductPopup from "@/pages/components/stores/AddProductPopup"

const StorePage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { storeId } = router.query

  const store = useSelector(
    (state: RootState) => state.userStoresSliceReducer.stores[storeId as string]
  )

  const products = useSelector(
    (state: RootState) =>
      state.userStoresProductsSliceReducer.productLists &&
      state.userStoresProductsSliceReducer.productLists[storeId as string]
  )

  const newProducts = []

  // GETTERS
  const getStore = async (storeId: string) => {
    const response = await fetch(`/api/stores/${storeId}`, {
      method: "GET",
    })
    if (response.ok) {
      const data = await response.json()
      const store = new Store(data)
      dispatch(addStore(store))
    }
  }

  const getProducts = async () => {
    const response = await fetch(`/api/stores/${storeId as string}/products`, {
      method: "GET",
    })
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
          storeId: storeId,
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
      `/api/stores/${storeId as string}/embeddings`,
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

  // SYNCING STATUSES FOR SHOPIFY
  const [isSyncing, setIsSyncing] = useState<boolean | null>(null)
  const [syncTimestamp, setSyncTimestamp] = useState<string | null>(null)

  const getSyncingStatuses = async () => {
    const response = await fetch(`/api/stores/${storeId as string}/syncing`, {
      method: "GET",
    })
    if (response.ok) {
      const data = await response.json()
      setIsSyncing(data.is_syncing)
      setSyncTimestamp(data.last_sync_timestamp)
    }
  }

  // ADDING PRODUCTS
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  // COPYING JUNE LINK
  const [conversationPageLink, setConversationPageLink] = useState("")
  const [linkIsJustCopied, setLinkIsJustCopied] = useState(false)

  // ACTIONS
  const showCopiedLabel = () => {
    setLinkIsJustCopied(true)
    setTimeout(() => {
      setLinkIsJustCopied(false)
    }, 3000)
  }

  const copyConversationPageLink = () => {
    if (conversationPageLink) {
      navigator.clipboard.writeText(conversationPageLink).then(showCopiedLabel)
    }
  }

  const syncShopifyStoreData = async () => {
    setIsSyncing(true)
    console.log("Syncing Store Data")
    const response = await fetch(`/api/stores/${storeId}/sync`, {
      method: "POST",
    })
    if (response.ok) {
    }
  }

  const embedStoreData = async () => {
    setIsEmbedding(true)
    console.log("Embedding Store Data")
    const response = await fetch(`/api/stores/${storeId}/embed`, {
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

    setConversationPageLink(
      `${process.env.NEXT_PUBLIC_SHOPIFY_HOST_SCHEME}://${process.env.NEXT_PUBLIC_SHOPIFY_HOST_NAME}/conversation/${storeId}`
    )

    if (!store) {
      getStore(storeId as string)
    }
  }, [router.isReady])

  useEffect(() => {
    if (!store) return

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
          {store.integration !== "manual" && (
            <Button
              variant="outlined"
              onClick={() => {
                syncShopifyStoreData()
              }}
              sx={{ textTransform: "none" }}
            >
              Sync
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => {
              embedStoreData()
            }}
            sx={{ textTransform: "none" }}
          >
            Embed
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              openInNewTab(`/conversation/${storeId}`)
            }}
            sx={{ textTransform: "none" }}
          >
            Test
          </Button>
        </Box>
      </Box>
      {store.integration !== "manual" && (
        <Typography variant="h5">
          Store Data:{" "}
          {isSyncing === null
            ? "Loading..."
            : isSyncing
            ? "In Progress..."
            : syncTimestamp
            ? `Synced on ${new Date(syncTimestamp)}`
            : "No yet synced"}
        </Typography>
      )}
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
      <Typography>Products</Typography>
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
      {products.length > 0 ? (
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
          removePopup={() => {
            setIsAddingProduct(false)
          }}
        />
      )}
      {linkIsJustCopied && (
        <Box
          position="fixed"
          bottom="50px"
          right="50px"
          boxShadow="2"
          borderRadius="5px"
          bgcolor="#2b825b"
          color="white"
          p="8px"
        >
          <Typography variant="h5">June Link Copied to Clipboard</Typography>
        </Box>
      )}
    </Box>
  ) : (
    <Box>Loading</Box>
  )
}

export default StorePage
