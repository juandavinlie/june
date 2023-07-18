import { setStores } from "@/redux/UserStoresSlice"
import { Button } from "@mui/base"
import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import StoreCard from "../components/StoreCard"
import { Store } from "../../models/Store"
import { RootState } from "@/redux/config"
import { useRouter } from "next/router"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

const Stores = () => {
  const [isAddingStore, setIsAddingStore] = useState(false)
  const [isCreatingNewStore, setIsCreatingNewStore] = useState(false)

  const stores: { [id: string]: Store } = useSelector(
    (state: RootState) => state.userStoresSliceReducer.stores
  )
  const dispatch = useDispatch()
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
      throw "Shop response not ok"
    }

    // Create Store
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
      console.log("Creating new store failed!")
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
    if (isNewUncreatedStore(router.query)) {
      createNewStore(router.query)
    }
  }, [router.isReady])

  useEffect(() => {
    getStores()
  }, [])

  return router.isReady ? (
    <Box display="flex" gap="10px" p="20px">
      {stores &&
        Object.values(stores).map((store: Store) => (
          <StoreCard store={store} key={store.storeId} />
        ))}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="90px"
        width="20%"
        minWidth="200px"
        p="10px"
        borderRadius="5px"
        border="1px solid #D3D3D3"
        boxShadow="1"
        onClick={() => {
          router.push("/stores/add")
        }}
        sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
      >
        <Typography>Add Store</Typography>
      </Box>
      {isCreatingNewStore && (
        <Box
          position="fixed"
          bottom="50px"
          right="50px"
          boxShadow="2"
          p="10px 20px"
          borderRadius="7px"
        >
          <Typography variant="h6">Creating new store...</Typography>
        </Box>
      )}
    </Box>
  ) : (
    "Loading"
  )
}

export default Stores
