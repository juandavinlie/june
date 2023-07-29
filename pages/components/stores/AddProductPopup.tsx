import {
  Autocomplete,
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from "@mui/material"
import Popup from "../common/Popup"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import { createContext, useState } from "react"
import AddProductTabs from "./AddProductTabs"
import Dropzone from "react-dropzone"
import Image from "next/image"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import CircularProgress from "@mui/material/CircularProgress"
import { Store } from "@/models/Store"

export interface Property {
  name: string | null
  values: string | null
}

export const PropertiesContext = createContext<
  [Property[], (properties: Property[]) => void]
>([[], () => {}])

export interface Variant {
  title: string | null
  inventory_quantity: number | null
  price: number | null
}

export const VariantsContext = createContext<
  [Variant[], (properties: Variant[]) => void]
>([[], () => {}])

interface AddProductPopupProps {
  store: Store
  removePopup: () => void
}

const processProperties = (properties: Property[]) => {
  return properties.filter(
    (property: Property) => property.name !== null && property.values !== null
  )
}

const processVariants = (variants: Variant[]) => {
  return variants.filter(
    (variant: Variant) =>
      variant.title !== null &&
      variant.inventory_quantity !== null &&
      variant.price !== null
  )
}

const AddProductPopup = ({ store, removePopup }: AddProductPopupProps) => {
  const storeId = store.storeId

  const [image, setImage] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [properties, setProperties] = useState<Property[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [link, setLink] = useState("")

  const [isAdding, setIsAdding] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const supabase = useSupabaseClient()

  const addNewProduct = async () => {
    try {
      setIsAdding(true)

      // Preprocessing
      const processedProperties = processProperties(properties)
      const processedVariants = processVariants(variants)

      // Validation
      if (!name) throw "Name is required"
      else if (!description) throw "Description is required"
      else if (processedProperties.length === 0)
        throw "At least one property is required"
      else if (processedVariants.length === 0)
        throw "At least one variant is required"
      else if (!image) throw "Image is required"

      const imageId = crypto.randomUUID()
      const fullImagePath = `${imageId}_${image!.name}`
      const bucketName = `/products_images/manual/${storeId}`

      const { data: imageData, error: imageError } = await supabase.storage
        .from(bucketName)
        .upload(fullImagePath, image)

      if (imageError) {
        console.log(imageError)
        throw "Image upload failed."
      }

      const { data: imageUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fullImagePath)

      const response = await fetch(
        `/api/stores/${storeId}/manual/add_product`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            properties: processedProperties,
            variants: processedVariants,
            image: image ? imageUrlData.publicUrl : null,
            link,
          }),
        }
      )

      const productData = await response.json()

      if (!response.ok) {
        throw productData.message
      }

      removePopup()
    } catch (error) {
      setErrorMessage(error as string)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Popup removePopup={removePopup}>
      <Typography variant="title">Add New Product</Typography>
      <Divider />
      <Box height="10px" />
      <Box display="flex" flexDirection="column" gap="10px">
        <Box display="flex" gap="10px">
          <Dropzone
            multiple={false}
            onDrop={(acceptedFiles: File[]) => {
              console.log(acceptedFiles[0])
              setImage(acceptedFiles[0])
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <Box
                {...getRootProps()}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                width="250px"
                height="250px"
                border="0.5px dashed gray"
                position="relative"
                sx={{ "&:hover": { cursor: "pointer" } }}
              >
                <input {...getInputProps()} />
                {!image ? (
                  <>
                    <CameraAltIcon />
                    <Typography variant="h6">Upload a picture</Typography>
                  </>
                ) : (
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Product picture"
                    fill={true}
                    style={{ objectFit: "contain" }}
                  />
                )}
              </Box>
            )}
          </Dropzone>
          <Box display="flex" flexGrow={1} flexDirection="column" gap="10px">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="title">Product name</Typography>
              <TextField
                value={name}
                placeholder="e.g. Slim Fit Chino Pants"
                inputProps={{
                  style: { fontSize: 14, padding: 10, width: 300 },
                }}
                onChange={(e: any) => {
                  setName(e.currentTarget.value)
                }}
              />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              height="30px"
            >
              <Typography variant="title">Description</Typography>
              {description && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDescription("")
                  }}
                >
                  <Typography variant="title">Clear</Typography>
                </Button>
              )}
            </Box>
            <Box
              height="120px"
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
        <PropertiesContext.Provider value={[properties, setProperties]}>
          <VariantsContext.Provider value={[variants, setVariants]}>
            <AddProductTabs />
          </VariantsContext.Provider>
        </PropertiesContext.Provider>
        <Box display="flex" flexDirection="column" gap="5px">
          <Typography variant="title">Link (Optional)</Typography>
          <TextField
            value={link}
            placeholder="e.g. www.example.com/chino_pants"
            inputProps={{ style: { fontSize: 14, padding: 5, width: 300 } }}
            onChange={(e: any) => {
              setLink(e.currentTarget.value)
            }}
          />
        </Box>
        <Box height="10px" />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="title" color="red">
            {errorMessage}
          </Typography>
          <Box display="flex" alignItems="center" gap="10px">
            {isAdding && <CircularProgress color="secondary" size="2rem" />}
            <Button
              variant="outlined"
              disabled={isAdding}
              onClick={addNewProduct}
              sx={{
                "&:disabled": {
                  backgroundColor: "#cccccc",
                  color: "white",
                },
              }}
            >
              <Typography variant="title">Add</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </Popup>
  )
}

export default AddProductPopup
