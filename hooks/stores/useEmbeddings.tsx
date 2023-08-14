import { useState } from "react"

export interface EmbeddingsHook {
  hasEmbeddings: boolean | null
  embeddingsTimestamp: string | null
  isEmbedding: boolean | null
  getEmbeddingStatuses: () => void
  embedStoreData: () => void
}

export const useEmbeddings = (storeId: string) => {
  const [hasEmbeddings, setHasEmbeddings] = useState<boolean | null>(null)
  const [embeddingsTimestamp, setEmbeddingsTimestamp] = useState<string | null>(
    null
  )
  const [isEmbedding, setIsEmbedding] = useState<boolean | null>(null)

  const getEmbeddingStatuses = async () => {
    const response = await fetch(
      `/api/stores/${storeId as string}/embeddings`,
      {
        method: "GET",
      }
    )
    if (response.ok) {
      const data = await response.json()
      setHasEmbeddings(data.has_embeddings)
      setEmbeddingsTimestamp(data.last_embeddings_timestamp)
      setIsEmbedding(data.is_embedding)
    }
  }

  const embedStoreData = async () => {
    setIsEmbedding(true)
    console.log("Embedding Store Data")
    const response = await fetch(`/api/stores/${storeId}/embed`, {
      method: "POST",
    })
    if (response.ok) {
    }
  }

  return {
    hasEmbeddings,
    embeddingsTimestamp,
    isEmbedding,
    getEmbeddingStatuses,
    embedStoreData,
  } as EmbeddingsHook
}
