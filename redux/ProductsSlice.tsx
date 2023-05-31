import { Product } from "@/models/Product"
import { Store } from "@/models/Store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface ProductsState {
  products: { [id: string]: { [id: string]: Product[] } }
}

const initialState: ProductsState = {
  products: {},
}

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProducts: (state, action) => {
      state.products[action.payload.storeId] = action.payload.products
    },
  },
})

export const { addProducts } = productsSlice.actions
export default productsSlice.reducer
