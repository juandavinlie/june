import { Store } from "@/pages/models/Store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserStoresState {
  stores: { [id: string]: Store }
}

const initialState: UserStoresState = {
  stores: {},
}

export const userStoresSlice = createSlice({
  name: "userStore",
  initialState,
  reducers: {
    setStores: (state, action: PayloadAction<{ [id: string]: Store }>) => {
      state.stores = action.payload
    },
    addStore: (state, action: PayloadAction<Store>) => {
      state.stores[action.payload.storeId] = action.payload
      //   const newPair: { [id: string]: Store } = {}
      //   newPair[action.payload.storeId] = action.payload
      //   const newStores = { ...state.stores, newPair }
      //   return {
      //     ...state,
      //     newStores,
      //   }
    },
  },
})

export const { setStores, addStore } = userStoresSlice.actions
export default userStoresSlice.reducer
