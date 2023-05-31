import { setStores } from "@/redux/UserStoresSlice"
import { Button } from "@mui/base"
import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import StoreCard from "../components/StoreCard"
import { Store } from "../../models/Store"
import { RootState } from "@/redux/config"
import Link from "next/link"

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
    <Box display="flex" gap="10px" p="20px">
      {stores &&
        Object.values(stores).map((store: Store) => (
          <StoreCard store={store} key={store.storeId} />
        ))}
      <Link href={``}>
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
          sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
        >
          <Typography>Add Store</Typography>
        </Box>
      </Link>
    </Box>
  )
}

export default Stores
