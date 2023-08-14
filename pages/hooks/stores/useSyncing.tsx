import { useState } from "react"

export interface SyncingHook {
  isSyncing: boolean | null
  syncTimestamp: string | null
  getShopifySyncingStatuses: () => void
  syncShopifyStoreData: () => void
}

export const useSyncing = (storeId: string) => {
  const [isSyncing, setIsSyncing] = useState<boolean | null>(null)
  const [syncTimestamp, setSyncTimestamp] = useState<string | null>(null)

  const getShopifySyncingStatuses = async () => {
    const response = await fetch(
      `/api/stores/${storeId as string}/shopify/syncing`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      setIsSyncing(data.is_syncing)
      setSyncTimestamp(data.last_sync_timestamp)
    }
  }

  const syncShopifyStoreData = async () => {
    setIsSyncing(true)
    console.log("Syncing Store Data")
    const response = await fetch(`/api/stores/${storeId}/shopify/sync`, {
      method: "POST",
    })
    if (response.ok) {
    }
  }

  return {
    isSyncing,
    syncTimestamp,
    getShopifySyncingStatuses,
    syncShopifyStoreData,
  } as SyncingHook
}
