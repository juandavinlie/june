import { Box, Button, Divider, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"
import { ShopifyProduct } from "@/models/ShopifyProduct"
import { addProductList } from "@/redux/UserStoresProductsSlice"
import { Product } from "@/models/Product"
import ProductCard from "@/pages/components/stores/shopify/ProductCard"

import shopifyLogo from "../../../public/shopify.png"
import emptyLogo from "../../../public/box.png"
import IntegrationLogo from "@/pages/components/common/IntegrationLogo"
import { Store } from "@/models/Store"
import { addStore } from "@/redux/UserStoresSlice"
import AddProductPopup from "@/pages/components/stores/AddProductPopup"
import { ManualProduct } from "@/models/ManualProduct"
import LoadingWidget from "@/pages/components/common/LoadingWidget"
import { Title, HeaderContext } from "@/pages/components/common/HeaderLayout"
import { openInNewTab } from "@/utils"

const StorePage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const setHeaderTitle = useContext(HeaderContext)
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

  // LOADING STATUSES
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

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
    try {
      setIsLoadingProducts(true)
      const response = await fetch(
        `/api/stores/${storeId as string}/products`,
        {
          method: "GET",
        }
      )
      if (response.ok) {
        const data = await response.json()
        let formattedProducts: Product[] = []
        if (store.integration === "shopify") {
          formattedProducts = data.map(
            (product: any) => new ShopifyProduct(product)
          )
        } else if (store.integration === "manual") {
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

  const getShopifySyncingStatuses = async () => {
    const response = await fetch(
      `/api/stores/${storeId as string}/shopify/syncing`,
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
    const response = await fetch(`/api/stores/${storeId}/shopify/sync`, {
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

    setHeaderTitle([
      { text: "Stores", link: "/stores" },
      { text: store.name, link: `/stores/${storeId as string}` },
    ])
    getProducts()

    if (store.integration === "shopify") getShopifySyncingStatuses()
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
    if (!store || store.integration !== "shopify") return

    if (syncIntervalId) {
      clearInterval(syncIntervalId)
      getProducts()
    }
    if (isSyncing) {
      setSyncIntervalId(setInterval(getShopifySyncingStatuses, 5000))
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
