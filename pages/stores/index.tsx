import { setStores } from "@/redux/UserStoresSlice"
import { Button } from "@mui/base"
import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import StoreCard from "../components/StoreCard"
import { Store } from "../models/Store"
import { RootState } from "@/redux/config"

const Stores = () => {
  const stores: { [id: string]: Store } = useSelector(
    (state: RootState) => state.userStoresSliceReducer.stores
  )
  const dispatch = useDispatch()

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
    getStores()
  }, [])

  return (
    <Box p="20px">
      {stores &&
        Object.values(stores).map((store: Store) => (
          <StoreCard store={store} key={store.storeId} />
        ))}
    </Box>
  )
}

export default Stores
