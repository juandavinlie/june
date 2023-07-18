import BorderedBox from "@/pages/components/BorderedBox"
import { Box, Button, Divider, TextField, Typography } from "@mui/material"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { useState } from "react"

const ManualEntryPage = () => {
  const [storeName, setStoreName] = useState("")
  const [category, setCategory] = useState("")

  const [isCreatingStore, setIsCreatingStore] = useState(false)

  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()

  const clearFields = () => {
    setStoreName("")
    setCategory("")
  }

  const createManualStore = async () => {
    const storeId = `manual_${user!.id}_${storeName}`
    const { error } = await supabase.from("store").insert({
      id: storeId,
      user_id: user!.id,
      name: storeName,
      integration: "manual",
    })
    if (!error) {
      return storeId
    } else {
      throw "Error creating new manual store"
    }
  }

  const next = async () => {
    try {
      setIsCreatingStore(true)
      if (storeName && category) {
        const storeId = await createManualStore()
        router.push(`/stores/${storeId}`)
      }
    } catch (error) {
    } finally {
      setIsCreatingStore(false)
    }
  }
  return (
    <Box>
      <BorderedBox>
        <Box>
          <Typography variant="h5">Store details</Typography>
          <Divider />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Store name</Typography>
          <TextField
            placeholder="e.g. Lavista"
            value={storeName}
            onChange={(e) => {
              setStoreName(e.currentTarget.value)
            }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Category</Typography>
          <TextField
            placeholder="e.g. Clothing"
            value={category}
            onChange={(e) => {
              setCategory(e.currentTarget.value)
            }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" gap="5px">
          <Button variant="outlined" onClick={clearFields}>
            Clear
          </Button>
          <Button variant="outlined" onClick={next}>
            Next
          </Button>
        </Box>
      </BorderedBox>
    </Box>
  )
}

export default ManualEntryPage
