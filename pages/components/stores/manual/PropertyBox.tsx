import {
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material"
import { useContext, useState } from "react"
import { PropertiesContext } from "@/pages/stores/[storeId]/products/add"
import { Property } from "@/pages/stores/[storeId]/products/add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"

const PropertyBox = ({ idx }: { idx: number }) => {
  const [properties, setProperties] = useContext(PropertiesContext)
  const [editingMemory, setEditingMemory] = useState<{ [id: number]: string }>(
    {}
  )

  const setEditingMemoryValue = (optIdx: number, value: string) => {
    let copy = structuredClone(editingMemory)
    copy[optIdx] = value
    setEditingMemory(copy)
  }

  const setOptionName = (name: string) => {
    let copy = structuredClone(properties)
    copy[idx].name = name
    setProperties(copy)
  }

  const setOptionValue = (
    option: string,
    optIdx: number,
    addNewNext: boolean
  ) => {
    let copy: Property[] = structuredClone(properties)

    if (copy[idx].values[optIdx] !== "" && option === "") {
      setEditingMemoryValue(optIdx, copy[idx].values[optIdx])
      console.log(editingMemory)
    }

    copy[idx].values[optIdx] = option
    if (addNewNext && optIdx === copy[idx].values.length - 1) {
      copy[idx].values.push("")
    }
    setProperties(copy)
  }

  const setOptionIsEditing = (isEditing: boolean) => {
    let copy = structuredClone(properties)
    copy[idx].isEditing = isEditing
    setProperties(copy)
  }

  const deleteProperty = () => {
    let copy = structuredClone(properties)
    copy.splice(idx, 1)
    setProperties(copy)
  }

  const deleteOption = (optIdx: number) => {
    let copy = structuredClone(properties)
    copy[idx].values.splice(optIdx, 1)
    setProperties(copy)
  }

  const property = properties[idx]

  return (
    <Box display="flex" flexDirection="column" gap="5px" p="0 30px">
      {property.isEditing ? (
        <>
          <Typography variant="h5">Option name</Typography>
          <TextField
            value={property.name}
            placeholder="Size"
            inputProps={{
              style: { fontSize: 14, padding: 10 },
            }}
            InputProps={{ sx: { borderRadius: 3, marginBottom: 1 } }}
            onChange={(e: any) => {
              setOptionName(e.currentTarget.value)
            }}
          />
          <Box display="flex" flexDirection="column" paddingLeft="10px">
            <Typography variant="h5">Option values</Typography>
            {property.values.map((option: string, optIdx: number) => {
              return (
                <Box display="flex" alignItems="center" gap="10px">
                  <TextField
                    value={option}
                    placeholder={optIdx === 0 ? "Medium" : "Add another value"}
                    fullWidth
                    inputProps={{
                      style: { fontSize: 14, padding: 10 },
                    }}
                    InputProps={{ sx: { borderRadius: 3, marginBottom: 1 } }}
                    onChange={(e: any) => {
                      setOptionValue(
                        e.currentTarget.value,
                        optIdx,
                        option === ""
                      )
                    }}
                    onBlur={() => {
                      console.log(option)
                      console.log(editingMemory)
                      if (option === "" && optIdx in editingMemory) {
                        setOptionValue(editingMemory[optIdx], optIdx, false)
                      }
                    }}
                  />
                  {property.values.length > 2 &&
                    optIdx !== property.values.length - 1 && (
                      <DeleteOutlineIcon
                        onClick={() => {
                          deleteOption(optIdx)
                        }}
                      />
                    )}
                </Box>
              )
            })}
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              if (
                property.name &&
                property.values.length > 0 &&
                property.values[0]
              ) {
                setOptionIsEditing(false)
              }
            }}
            sx={{ textTransform: "none", width: "100px", gap: "5px" }}
          >
            <Typography variant="h5">Done</Typography>
          </Button>
        </>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" flexDirection="column" gap="10px">
            <Typography variant="title">{property.name}</Typography>
            <Box display="flex" gap="5px">
              {property.values.map((option: string) => {
                return option === "" ? (
                  <></>
                ) : (
                  <Box borderRadius="2px" p="0 8px" bgcolor="#D3D3D3">
                    <Typography variant="h5">{option}</Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
          <Box display="flex" gap="10px">
            <Link
              component="button"
              color="#000000"
              sx={{ fontSize: 14 }}
              onClick={() => {
                setOptionIsEditing(true)
              }}
            >
              Edit
            </Link>
            <Link
              component="button"
              color="#000000"
              sx={{ fontSize: 14 }}
              onClick={() => {
                deleteProperty()
              }}
            >
              Delete
            </Link>
          </Box>
        </Box>
      )}
      <Box height="5px" />
      <Divider />
      <Box height="5px" />
    </Box>
  )
}

export default PropertyBox
