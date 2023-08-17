import {
  EmbeddingsContext,
  StoreContext,
  SyncingContext,
} from "@/pages/stores/[storeId]"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useContext, useState } from "react"

import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CheckIcon from "@mui/icons-material/Check"
import LaunchIcon from "@mui/icons-material/Launch"
import { openInNewTab } from "@/utils"
import { EmbeddingsHook, useEmbeddings } from "@/hooks/stores/useEmbeddings"
import { SyncingHook } from "@/hooks/stores/useSyncing"

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
}

const StoreSummaryTab = () => {
  const store = useContext(StoreContext)

  const conversationPageLink = `${process.env.NEXT_PUBLIC_SHOPIFY_HOST_SCHEME}://${process.env.NEXT_PUBLIC_SHOPIFY_HOST_NAME}/c/${store.storeId}`

  const [linkIsJustCopied, setLinkIsJustCopied] = useState(false)

  const embeddingsHookObj: EmbeddingsHook = useContext(EmbeddingsContext)
  const {
    hasEmbeddings,
    embeddingsTimestamp,
    isEmbedding,
    getEmbeddingStatuses,
    embedStoreData,
  } = embeddingsHookObj

  const syncingHookObj: SyncingHook = useContext(SyncingContext)
  const {
    isSyncing,
    syncTimestamp,
    getShopifySyncingStatuses,
    syncShopifyStoreData,
  } = syncingHookObj

  const showCopiedLabel = () => {
    setLinkIsJustCopied(true)
    setTimeout(() => {
      setLinkIsJustCopied(false)
    }, 2000)
  }

  const copyConversationPageLink = () => {
    if (conversationPageLink) {
      navigator.clipboard.writeText(conversationPageLink).then(showCopiedLabel)
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="40px">
      <Box display="flex" flexDirection="column" gap="10px" maxWidth="600px">
        <Typography variant="tabtitle">Currency</Typography>
        {store.currency ? (
          <Typography variant="h5">
            Your store uses{" "}
            <Box component="span" fontWeight="fontWeightMedium">
              {store.currency}
            </Box>
          </Typography>
        ) : (
          <Typography variant="h5">
            Currency has not been set
          </Typography>
        )}
      </Box>
      <Box display="flex" flexDirection="column" gap="10px" maxWidth="600px">
        <Typography variant="tabtitle">Share Link</Typography>
        <TextField
          value={conversationPageLink}
          inputProps={{
            style: { fontSize: 14, padding: 10 },
          }}
        />
        <Box display="flex" gap="10px">
          <Button
            variant="outlined"
            sx={{ width: "100px", gap: "5px" }}
            onClick={copyConversationPageLink}
          >
            {linkIsJustCopied ? (
              <CheckIcon sx={{ fontSize: 14 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            )}
            <Typography variant="h5">Copy</Typography>
          </Button>
          <Button
            variant="outlined"
            sx={{ width: "50px", gap: "5px" }}
            onClick={() => {
              openInNewTab(`/c/${store.storeId}`)
            }}
          >
            <LaunchIcon sx={{ fontSize: 14 }} />
          </Button>
        </Box>
      </Box>
      {store.integration !== "manual" && (
        <Box display="flex" flexDirection="column" gap="10px" maxWidth="600px">
          <Typography variant="tabtitle">Syncs</Typography>
          <Typography variant="h5">
            {isSyncing === null ? (
              "Loading..."
            ) : isSyncing ? (
              "In Progress..."
            ) : syncTimestamp ? (
              <Typography variant="h5">
                Your June was last synced on{" "}
                <Box component="span" fontWeight="fontWeightMedium">
                  {new Date(syncTimestamp as string).toLocaleDateString(
                    "en-US",
                    dateOptions
                  )}
                </Box>
              </Typography>
            ) : (
              "No yet synced"
            )}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              syncShopifyStoreData()
            }}
            sx={{ textTransform: "none", width: "100px", gap: "5px" }}
          >
            <Typography variant="h5">
              {isSyncing ? "Syncing..." : "Sync"}
            </Typography>
          </Button>
        </Box>
      )}
      <Box display="flex" flexDirection="column" gap="10px" maxWidth="600px">
        <Typography variant="tabtitle">Embeddings</Typography>
        <Typography variant="h5">
          {hasEmbeddings === null || isEmbedding === null ? (
            "Loading..."
          ) : isEmbedding ? (
            "In Progress..."
          ) : hasEmbeddings && embeddingsTimestamp ? (
            <Typography variant="h5">
              Your June was last updated on{" "}
              <Box component="span" fontWeight="fontWeightMedium">
                {new Date(embeddingsTimestamp as string).toLocaleDateString(
                  "en-US",
                  dateOptions
                )}
              </Box>
            </Typography>
          ) : (
            "No embeddings yet"
          )}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            embedStoreData()
          }}
          sx={{ textTransform: "none", width: "100px", gap: "5px" }}
        >
          <Typography variant="h5">
            {isEmbedding ? "Embedding..." : "Embed"}
          </Typography>
        </Button>
      </Box>
    </Box>
  )
}

export default StoreSummaryTab
