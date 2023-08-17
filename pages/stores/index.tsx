import { setStores } from "@/redux/UserStoresSlice"
import { Button } from "@mui/material"
import { Box, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import StoreCard from "../components/stores/StoreCard"
import { Store } from "../../models/Store"
import { RootState } from "@/redux/config"
import { useRouter } from "next/router"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { HeaderContext } from "../components/common/HeaderLayout"
import { ScreenContext } from "../_app"
import LoadingWidget from "../components/common/LoadingWidget"

const Stores = () => {
  const isMobileScreen = useContext(ScreenContext)
  const [isCreatingNewStore, setIsCreatingNewStore] = useState(false)

  const stores: { [id: string]: Store } = useSelector(
    (state: RootState) => state.userStoresSliceReducer.stores
  )
  const dispatch = useDispatch()
  const setHeaderTitle = useContext(HeaderContext)
  const router = useRouter()
  const supabase = useSupabaseClient()

  const isNewUncreatedStore = (params: any) => {
    return params && params.status === "new"
  }

  const createNewShopifyStore = async (params: any) => {
    const shopifyAccessToken = params.shopify_access_token
    const shopifyDomain = params.shopify_domain

    // Retrieved Logged In User
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch Shop Data
    const shopResponse = await fetch(
      `/api/integration/shopify/shop?shopify_domain=${shopifyDomain}&shopify_access_token=${shopifyAccessToken}`
    )

    if (!shopResponse.ok) {
      throw "Shop response is not ok"
    }

    // Fetch Currency Data
    const currencyResponse = await fetch(
      `/api/integration/shopify/shop/currency?shopify_domain=${shopifyDomain}&shopify_access_token=${shopifyAccessToken}`
    )

    if (!currencyResponse.ok) {
      throw "Currency response is not ok"
    }
    const { mainCurrency } = await currencyResponse.json()

    // Create store
    const shopData = await shopResponse.json()
    const storeId = "shopify_" + shopData.shop.id.toString()
    const { data, error } = await supabase
      .from("store")
      .upsert(
        {
          id: storeId,
          user_id: user!.id,
          name: shopData.shop.name,
          integration: "shopify",
          shopify_access_token: shopifyAccessToken,
          shopify_domain: shopifyDomain,
          currency: mainCurrency,
        },
        { onConflict: "id" }
      )
      .select()

    if (error) {
      throw "Error upserting store"
    }
    return storeId
  }

  const createNewStore = async (params: any) => {
    setIsCreatingNewStore(true)
    try {
      let storeId = null
      if (params.integration === "shopify") {
        storeId = await createNewShopifyStore(params)
      }
      if (storeId) router.push(`/stores/${storeId}`)
    } catch (error) {
      console.log(error)
    }
    setIsCreatingNewStore(false)
  }

  const getStores = async () => {
    const response = await fetch("/api/stores", {
      method: "GET",
    })
    if (response.ok) {
      const data = await response.json()
      const formattedStores: { [id: string]: Store } = Object.assign(
        {},
        ...data.map((store: any) => ({
          [store.id]: new Store(store),
        }))
      )
      console.log(formattedStores)
      dispatch(setStores(formattedStores))
    }
  }

  useEffect(() => {
    if (!router.isReady) return

    setHeaderTitle([{ text: "Stores", link: "/stores" }])

    if (isNewUncreatedStore(router.query)) {
      createNewStore(router.query)
    }
  }, [router.isReady])

  useEffect(() => {
    getStores()
  }, [])

  return router.isReady ? (
    <Box display="flex" flexDirection="column" p="20px" gap="10px">
      <Button
        variant="outlined"
        onClick={() => {
          router.push("/stores/add")
        }}
        sx={{ textTransform: "none", width: "100px", padding: "8px" }}
      >
        <Typography variant="h5">Add store</Typography>
      </Button>
      <Box display="flex" flexWrap="wrap" gap="20px">
        {stores &&
          Object.values(stores).map((store: Store) => (
            <StoreCard store={store} key={store.storeId} />
          ))}
        {isCreatingNewStore && (
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
            <Typography variant="h6">Creating new store...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  ) : (
    <LoadingWidget color="black" text="Loading stores page..." />
  )
}

export default Stores
