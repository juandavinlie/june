import { Product } from "@/models/Product"
import { Store } from "@/models/Store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserStoresProductsState {
  productLists: { [id: string]: Product[] }
}

const initialState: UserStoresProductsState = {
  productLists: {},
}

export const userStoresProductsSlice = createSlice({
  name: "userStoresProducts",
  initialState,
  reducers: {
    addProductList: (state, action) => {
      if (!state.productLists) {
        state.productLists = {}
      }
      state.productLists[action.payload.storeId] = action.payload.productList
    },
  },
})

export const { addProductList } = userStoresProductsSlice.actions
export default userStoresProductsSlice.reducer
