import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"

import shopifyLogo from "../../../public/shopify.png"
import IntegrationLogo from "@/pages/components/common/IntegrationLogo"
import { Store } from "@/models/Store"
import { addStore } from "@/redux/UserStoresSlice"
import { HeaderContext } from "@/pages/components/common/HeaderLayout"
import StoreTabs from "@/pages/components/stores/StoreTabs"
import {
  StoreProductsHook,
  useStoreProducts,
} from "@/pages/hooks/stores/useStoreProducts"
import {
  EmbeddingsHook,
  useEmbeddings,
} from "@/pages/hooks/stores/useEmbeddings"
import { SyncingHook, useSyncing } from "@/pages/hooks/stores/useSyncing"
import LoadingWidget from "@/pages/components/common/LoadingWidget"

export const StoreContext = createContext<Store>(new Store({}))
export const StoreProductsContext = createContext<StoreProductsHook>(
  {} as StoreProductsHook
)
export const EmbeddingsContext = createContext<EmbeddingsHook>(
  {} as EmbeddingsHook
)
export const SyncingContext = createContext<SyncingHook>({} as SyncingHook)

const StorePage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const setHeaderTitle = useContext(HeaderContext)
  const { storeId } = router.query

  const store = useSelector(
    (state: RootState) => state.userStoresSliceReducer.stores[storeId as string]
  )

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

  // PRODUCTS
  const storeProductsHookObj: StoreProductsHook = useStoreProducts(
    storeId as string
  )
  const { getProducts } = storeProductsHookObj

  // EMBEDDINGS
  const embeddingsHookObj: EmbeddingsHook = useEmbeddings(storeId as string)
  const {
    hasEmbeddings,
    embeddingsTimestamp,
    isEmbedding,
    getEmbeddingStatuses,
    embedStoreData,
  } = embeddingsHookObj

  // SYNCING
  const syncingHookObj: SyncingHook = useSyncing(storeId as string)
  const {
    isSyncing,
    syncTimestamp,
    getShopifySyncingStatuses,
    syncShopifyStoreData,
  } = syncingHookObj

  // INITIALISATIONS
  useEffect(() => {
    if (!router.isReady) return

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
      </Box>
      <StoreContext.Provider value={store}>
        <StoreProductsContext.Provider value={storeProductsHookObj}>
          <EmbeddingsContext.Provider value={embeddingsHookObj}>
            <SyncingContext.Provider value={syncingHookObj}>
              <StoreTabs />
            </SyncingContext.Provider>
          </EmbeddingsContext.Provider>
        </StoreProductsContext.Provider>
      </StoreContext.Provider>
    </Box>
  ) : (
    <LoadingWidget color="black" text="Loading stores..." />
  )
}

export default StorePage
