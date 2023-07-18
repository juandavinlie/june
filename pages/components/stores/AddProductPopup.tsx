import { Box, Button, Divider, TextField, Typography } from "@mui/material"
import Popup from "../Popup"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import { useEffect, useState } from "react"

interface AddProductPopupProps {
  removePopup: () => void
}

const AddProductPopup = ({ removePopup }: AddProductPopupProps) => {
  const [description, setDescription] = useState("")
  const [variants, setVariants] = useState<any[]>([])

  const updateFields = (
    name: string | null,
    stock: number | null,
    idx: number
  ) => {
    const copy = variants.slice()
    const existingRecord = copy[idx]
    const newRecord = {
      name: name !== null ? name : existingRecord["name"],
      stock: stock !== null ? stock : existingRecord["stock"],
    }
    copy[idx] = newRecord
    setVariants(copy)
  }

  return (
    <Popup removePopup={removePopup}>
      <Typography variant="h5">Add New Product</Typography>
      <Divider />
      <Box height="10px" />
      <Box display="flex" flexDirection="column" gap="10px">
        <Box display="flex" gap="10px">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="250px"
            height="250px"
            border="0.5px dashed gray"
            sx={{ "&:hover": { cursor: "pointer" } }}
          >
            <CameraAltIcon />
            <Typography variant="h6">Upload a picture</Typography>
          </Box>
          <Box display="flex" flexGrow={1} flexDirection="column" gap="10px">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">Product name</Typography>
              <TextField
                placeholder="e.g. Slim Fit Chino Pants"
                inputProps={{ style: { fontSize: 14, padding: 5, width: 300 } }}
              />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">Description</Typography>
              {description && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDescription("")
                  }}
                >
                  <Typography variant="h5">Clear</Typography>
                </Button>
              )}
            </Box>
            <Box
              height="160px"
              sx={{
                overflowX: "hidden",
                overflowY: "overlay",
                "&:hover": { overflowY: "overlay" },
              }}
            >
              <TextField
                fullWidth
                multiline
                value={description}
                placeholder="e.g. Super stretchy chino pants. Suitable for both formal and informal occasions."
                onChange={(e: any) => {
                  setDescription(e.currentTarget.value)
                }}
                inputProps={{
                  style: { fontSize: 14 },
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Variants</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setVariants(variants.concat({ name: null, stock: null }))
            }}
          >
            <AddIcon />
          </Button>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          gap="5px"
          height="250px"
          sx={{
            overflowX: "hidden",
            overflowY: "overlay",
            "&:hover": { overflowY: "overlay" },
          }}
        >
          {variants.length > 0 ? (
            variants.map((variant: any, idx: number) => (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <TextField
                  value={variant.name ? variant.name : ""}
                  placeholder={`e.g. Green Chino Pants Size M`}
                  onChange={(e: any) => {
                    updateFields(e.currentTarget.value, null, idx)
                  }}
                  inputProps={{
                    style: { fontSize: 14, padding: 5, width: 300 },
                  }}
                />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="5px"
                >
                  <Typography variant="h5">Stock: </Typography>
                  <TextField
                    value={variant.stock ? variant.stock : ""}
                    onChange={(e: any) => {
                      updateFields(null, e.currentTarget.value, idx)
                    }}
                    inputProps={{
                      style: { fontSize: 14, padding: 5, width: 50 },
                    }}
                  />
                </Box>
                <DeleteIcon
                  onClick={() => {
                    const newVariants = variants
                      .slice(0, idx)
                      .concat(variants.slice(idx + 1))
                    setVariants(newVariants)
                  }}
                />
              </Box>
            ))
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              border="0.5px solid gray"
              p="5px"
            >
              <Typography variant="h5">No variant added yet</Typography>
            </Box>
          )}
        </Box>
        <Box display="flex" flexDirection="column" gap="5px">
          <Typography variant="h5">Link</Typography>
          <TextField
            placeholder="e.g. www.example.com/chino_pants"
            inputProps={{ style: { fontSize: 14, padding: 5, width: 300 } }}
          />
        </Box>
        <Box height="10px" />
        <Box display="flex" justifyContent="flex-end">
          <Button variant="outlined">Add</Button>
        </Box>
      </Box>
    </Popup>
  )
}

export default AddProductPopup
