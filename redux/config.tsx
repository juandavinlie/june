import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { combineReducers, configureStore } from "@reduxjs/toolkit"
import userStoresSliceReducer from "./UserStoresSlice"
import userStoresProductsSliceReducer from "./UserStoresProductsSlice"

const persistConfig = {
  key: "root",
  storage,
}

const rootReducer = combineReducers({
  userStoresSliceReducer,
  userStoresProductsSliceReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
