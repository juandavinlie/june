import { Store } from "@/models/Store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserStoresState {
  stores: { [id: string]: Store }
}

const initialState: UserStoresState = {
  stores: {},
}

interface UpdateCurrencyProps {
  storeId: string
  currency: string
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
    updateStoreCurrency: (
      state,
      action: PayloadAction<UpdateCurrencyProps>
    ) => {
      state.stores[action.payload.storeId].currency = action.payload.currency
    },
  },
})

export const { setStores, addStore, updateStoreCurrency } =
  userStoresSlice.actions
export default userStoresSlice.reducer
