import BorderedBox from "@/pages/components/common/BorderedBox"
import { HeaderContext } from "@/pages/components/common/HeaderLayout"
import { Box, Button, Divider, TextField, Typography } from "@mui/material"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"

const ManualEntryPage = () => {
  const [storeName, setStoreName] = useState("")
  const [category, setCategory] = useState("")

  const [isCreatingStore, setIsCreatingStore] = useState(false)
  const setHeaderTitle = useContext(HeaderContext)

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

  useEffect(() => {
    setHeaderTitle([{ text: "Stores", link: "/stores" }, { text: "Add", link: "/stores/add" }, { text: "Manual", link: "/stores/add/manual" }])
  }, [])

  return (
    <Box display="flex" p="20px">
      <BorderedBox>
        <Box>
          <Typography variant="h5">Store Details</Typography>
          <Divider />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Store name</Typography>
          <TextField
            sx={{ width: "50%" }}
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
            sx={{ width: "50%" }}
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
