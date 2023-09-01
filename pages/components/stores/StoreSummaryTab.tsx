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
import { EmbeddingsHook } from "@/hooks/stores/useEmbeddings"
import { SyncingHook } from "@/hooks/stores/useSyncing"
import CurrencyPicker from "./CurrencyPicker"
import { Currency } from "@/utils/constants"
import { useDispatch } from "react-redux"
import { updateStoreCurrency } from "@/redux/UserStoresSlice"

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
}

const StoreSummaryTab = () => {
  const dispatch = useDispatch()
  const store = useContext(StoreContext)

  const embeddingsHookObj: EmbeddingsHook = useContext(EmbeddingsContext)
  const {
    hasEmbeddings,
    embeddingsTimestamp,
    isEmbedding,
    embedStoreData,
  } = embeddingsHookObj

  const syncingHookObj: SyncingHook = useContext(SyncingContext)
  const {
    isSyncing,
    syncTimestamp,
    syncShopifyStoreData,
  } = syncingHookObj

  // Currency
  const [isChangingCurrency, setIsChangingCurrency] = useState(false)
  const [currencyValue, setCurrencyValue] = useState<Currency | null>(null)
  const [inputCurrencyValue, setInputCurrencyValue] = useState("")
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false)
  const [updatingError, setUpdatingError] = useState<string | null>(null)

  const saveNewCurrency = async () => {
    try {
      setIsUpdatingCurrency(true)

      if (!currencyValue) {
        throw "New currency cannot be empty"
      }

      const currencyTicker = currencyValue!.ticker

      const updateResponse = await fetch(
        `/api/stores/${store.storeId}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currency: currencyTicker }),
        }
      )

      setIsUpdatingCurrency(false)

      if (!updateResponse.ok) {
        throw "Failed updating. Please try again."
      }

      dispatch(
        updateStoreCurrency({
          storeId: store.storeId,
          currency: currencyTicker,
        })
      )
      setIsChangingCurrency(false)
    } catch (error) {
      setUpdatingError(error as string)
    }
  }

  // Share Link
  const conversationPageLink = `${process.env.NEXT_PUBLIC_SHOPIFY_HOST_SCHEME}://${process.env.NEXT_PUBLIC_SHOPIFY_HOST_NAME}/c/${store.storeId}`
  const [linkIsJustCopied, setLinkIsJustCopied] = useState(false)

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
          <Typography variant="h5">Currency has not been set</Typography>
        )}
        {isChangingCurrency && (
          <CurrencyPicker
            value={currencyValue}
            setCurrencyValue={setCurrencyValue}
            inputValue={inputCurrencyValue}
            setInputCurrencyValue={setInputCurrencyValue}
          />
        )}
        <Box display="flex" gap="10px">
          <Button
            variant="outlined"
            sx={{ width: "100px", gap: "5px" }}
            onClick={() => {
              if (!isChangingCurrency) {
                setIsChangingCurrency(true)
              } else {
                saveNewCurrency()
              }
            }}
          >
            <Typography variant="h5">
              {!store.currency ? "Set" : isChangingCurrency ? "Save" : "Change"}
            </Typography>
          </Button>
          {isChangingCurrency && (
            <Button
              variant="outlined"
              sx={{ width: "100px", gap: "5px" }}
              onClick={() => {
                setIsChangingCurrency(false)
              }}
            >
              <Typography variant="h5">Cancel</Typography>
            </Button>
          )}
        </Box>
        {updatingError && (
          <Typography variant="error">{updatingError}</Typography>
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
