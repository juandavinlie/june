import { Store } from "@/models/Store"
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
    },
  },
})

export const { setStores, addStore } = userStoresSlice.actions
export default userStoresSlice.reducer
