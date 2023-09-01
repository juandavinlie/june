import { Store } from "@/models/Store"
import { addStore } from "@/redux/UserStoresSlice"
import { RootState } from "@/redux/config"
import { currencyLocale } from "@/utils"
import { useDispatch, useSelector } from "react-redux"

export interface StoreHook {
  store: Store
  getStore: () => void
  formatString: Intl.NumberFormat
}

export const useStore = (storeId: string) => {
  const dispatch = useDispatch()
  const store = useSelector(
    (state: RootState) => state.userStoresSliceReducer.stores[storeId as string]
  )

  // GETTERS
  const getStore = async () => {
    const response = await fetch(`/api/stores/${storeId}`, {
      method: "GET",
    })
    if (response.ok) {
      const data = await response.json()
      const store = new Store(data)
      dispatch(addStore(store))
    }
  }

  const formatString = new Intl.NumberFormat(
    currencyLocale(store ? store.currency : "USD"),
    {
      style: "currency",
      currency: store && store.currency ? store.currency : "USD",
      minimumFractionDigits: 2,
    }
  )

  return { store, getStore, formatString } as StoreHook
}
