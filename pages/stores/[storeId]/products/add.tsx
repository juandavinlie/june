import AddProductSectionBox from "@/pages/components/stores/manual/AddProductSectionBox"
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material"
import {
  useState,
  useEffect,
  createContext,
  useContext,
  SetStateAction,
  Dispatch,
  useMemo,
} from "react"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import Dropzone from "react-dropzone"
import Image from "next/image"
import { useRouter } from "next/router"
import { useStore } from "@/hooks/stores/useStore"
import LoadingWidget from "@/pages/components/common/LoadingWidget"
import PropertyBox from "@/pages/components/stores/manual/PropertyBox"
import EditPricesPopup from "@/pages/components/stores/manual/EditPricesPopup"
import { HeaderContext } from "@/pages/components/common/HeaderLayout"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export interface Property {
  name: string | null
  values: string[]
  isEditing?: boolean
}

export interface Variant {
  title: string | null
  price: number | null
}

export const PropertiesContext = createContext<
  [Property[], Dispatch<SetStateAction<Property[]>>]
>([[], () => {}])

export const VariantsContext = createContext<
  [Variant[], Dispatch<SetStateAction<Variant[]>>]
>([[], () => {}])

const AddProductPage = () => {
  const router = useRouter()
  const setHeaderTitle = useContext(HeaderContext)
  const { storeId } = router.query
  const { store, getStore, formatString } = useStore(storeId as string)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [link, setLink] = useState<string | null>(null)

  const [deletedVariants, setDeletedVariants] = useState<Set<string>>(new Set())
  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const supabase = useSupabaseClient()

  // Properties
  const addNewOption = () => {
    const count = Object.keys(properties).length
    if (count === 3) {
      return
    } else {
      let copy = structuredClone(properties)
      copy.push({ name: null, values: [""], isEditing: true } as Property)
      setProperties(copy)
    }
  }

  const processProperties = () => {
    const processedProperties: Property[] = []
    for (let i = 0; i < properties.length; i++) {
      let property = properties[i]
      delete property.isEditing
      if (!property.name) {
        return []
      }
      property.values = property.values.filter(
        (value: string) => value.length > 0
      )
      if (!property.values) {
        return []
      }
      processedProperties.push(property)
    }
    return processedProperties
  }

  // Variants
  const deleteVariant = (variantTitle: string) => {
    const copy = structuredClone(deletedVariants)
    copy.add(variantTitle)
    setDeletedVariants(copy)
  }

  const undoDeleteVariant = (variantTitle: string) => {
    const copy = structuredClone(deletedVariants)
    copy.delete(variantTitle)
    setDeletedVariants(copy)
  }

  // Variants
  const populateVariants = (
    curIdx: number,
    variantTitle: string,
    allVariants: Variant[]
  ) => {
    if (Object.keys(properties).length === 0) return

    if (curIdx === Object.keys(properties).length) {
      if (!variantTitle) return
      const idx = allVariants.length
      allVariants.push({
        title: variantTitle,
        price:
          variants[idx] && variants[idx].price ? variants[idx].price : null,
      })
    } else {
      const curProperty: Property = properties[curIdx]
      const curPropertyValues: string[] = curProperty.values

      for (let i = 0; i < curPropertyValues.length; i++) {
        const value = curPropertyValues[i]

        if (!value && i === curPropertyValues.length - 1) {
          if (curPropertyValues.length > 1) continue
        }

        populateVariants(
          curIdx + 1,
          variantTitle + `${curIdx !== 0 ? " / " : ""}${value}`,
          allVariants
        )
      }
    }
  }

  const processVariants = () => {
    return variants.filter(
      (variant: Variant) =>
        variant.title && variant.price && !deletedVariants.has(variant.title)
    )
  }

  // SAVE
  const saveNewProduct = async () => {
    try {
      setIsSaving(true)

      // Preprocessing
      const processedProperties = processProperties()
      const processedVariants = processVariants()

      // Validation
      if (!title) throw "Title is required"
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
      navigateBack()
    } catch (error) {
      setErrorMessage(error as string)
    } finally {
      setIsSaving(false)
    }
  }

  // NAVIGATION
  const navigateBack = () => {
    router.replace(`/stores/${store.storeId}`)
  }

  // SIDE EFFECTS
  useEffect(() => {
    if (!router.isReady) return

    if (!store) {
      getStore()
    }

    setHeaderTitle([
      { text: "Stores", link: "/stores" },
      { text: store.name, link: `/stores/${storeId as string}` },
      {
        text: "Add product",
        link: `/stores/${storeId as string}/products/add`,
      },
    ])
  }, [router.isReady])

  useEffect(() => {
    const allVariants: Variant[] = []
    populateVariants(0, "", allVariants)
    setVariants(allVariants)
  }, [properties])

  return store ? (
    <Box display="flex" flexDirection="column" p="20px" gap="20px">
      <AddProductSectionBox>
        <Typography variant="title">Product Information</Typography>
        <Typography variant="h5">Title</Typography>
        <TextField
          value={title}
          placeholder="Slim Fit Chino Pants"
          inputProps={{
            style: { fontSize: 14, padding: 10 },
          }}
          InputProps={{ sx: { borderRadius: 3, marginBottom: 1 } }}
          required
          error={!title}
          helperText={!title ? "Title is required" : ""}
          onChange={(e: any) => {
            setTitle(e.currentTarget.value)
          }}
        />
        <Typography variant="h5">Description</Typography>
        <TextField
          value={description}
          fullWidth
          multiline
          inputProps={{
            style: { fontSize: 14, padding: 1, minHeight: 100 },
          }}
          InputProps={{ sx: { borderRadius: 3 } }}
          required
          error={!description}
          helperText={!description ? "Description is required" : ""}
          onChange={(e: any) => {
            setDescription(e.currentTarget.value)
          }}
        />
      </AddProductSectionBox>
      <AddProductSectionBox>
        <Typography variant="title">Media</Typography>
        <Box height="10px" />
        <Dropzone
          multiple={false}
          onDrop={(acceptedFiles: File[]) => {
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
              height={image ? "250px" : "150px"}
              width="100%"
              border={`${image ? "0" : "0.5"}px dashed gray`}
              position="relative"
              sx={{ "&:hover": { cursor: "pointer" } }}
            >
              <input {...getInputProps()} />
              {!image ? (
                <>
                  <CameraAltIcon />
                  <Typography variant="h6">Add a picture</Typography>
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
      </AddProductSectionBox>
      <PropertiesContext.Provider value={[properties, setProperties]}>
        <AddProductSectionBox>
          <Typography variant="title">Variants & Pricing</Typography>
          <Box height="10px" />
          {properties.map((property: Property, idx: number) => {
            return <PropertyBox idx={Number(idx)} key={idx} />
          })}
          {Object.keys(properties).length < 3 && (
            <Link
              component="button"
              color="#4f88df"
              sx={{ fontSize: 14 }}
              onClick={addNewOption}
            >
              Add options like size or color
            </Link>
          )}
          <Box height="10px" />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">{`Total: ${variants.length} variant(s)`}</Typography>
            {variants.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditingPrices(true)
                }}
                sx={{ textTransform: "none", width: "100px", gap: "5px" }}
              >
                <Typography variant="button">Edit prices</Typography>
              </Button>
            )}
          </Box>
          <Box height="10px" />
          <Box display="flex" flexDirection="column" gap="10px">
            {variants.map((variant: Variant) => {
              return (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  key={variant.title}
                >
                  <Typography
                    variant="title"
                    color={
                      deletedVariants.has(variant.title as string)
                        ? "grey"
                        : "black"
                    }
                    sx={{
                      textDecoration: deletedVariants.has(
                        variant.title as string
                      )
                        ? "line-through"
                        : "",
                    }}
                  >
                    {variant.title}
                  </Typography>
                  <Box display="flex" gap="10px">
                    <Typography
                      variant="h5"
                      color={
                        deletedVariants.has(variant.title as string)
                          ? "grey"
                          : "black"
                      }
                      sx={{
                        textDecoration: deletedVariants.has(
                          variant.title as string
                        )
                          ? "line-through"
                          : "",
                      }}
                    >
                      {formatString.format(variant.price!)}
                    </Typography>
                    <Link
                      component="button"
                      color="#000000"
                      sx={{ fontSize: 12 }}
                      onClick={() => {
                        if (deletedVariants.has(variant.title as string)) {
                          undoDeleteVariant(variant.title as string)
                        } else {
                          deleteVariant(variant.title as string)
                        }
                      }}
                    >
                      {deletedVariants.has(variant.title as string)
                        ? "Undo"
                        : "Delete"}
                    </Link>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </AddProductSectionBox>
      </PropertiesContext.Provider>
      <AddProductSectionBox>
        <Typography variant="title">Link (optional)</Typography>
        <TextField
          value={link}
          placeholder="www.example.com/pants"
          inputProps={{
            style: { fontSize: 14, padding: 10 },
          }}
          InputProps={{ sx: { borderRadius: 3, marginBottom: 1 } }}
          onChange={(e: any) => {
            setLink(e.currentTarget.value)
          }}
        />
      </AddProductSectionBox>
      {isEditingPrices && (
        <VariantsContext.Provider value={[variants, setVariants]}>
          <EditPricesPopup
            removePopup={() => {
              setIsEditingPrices(false)
            }}
            currency={store.currency ? store.currency : "USD"}
          />
        </VariantsContext.Provider>
      )}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="620px"
      >
        <Typography variant="error">{errorMessage}</Typography>
        <Box display="flex" gap="10px">
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={navigateBack}
            sx={{ textTransform: "none", width: "50px", height: "40px" }}
          >
            <Typography variant="button">Cancel</Typography>
          </Button>
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={saveNewProduct}
            sx={{ textTransform: "none", width: "50px", height: "40px" }}
          >
            {isSaving ? (
              <CircularProgress color="secondary" size="1rem" />
            ) : (
              <Typography variant="button">Save</Typography>
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  ) : (
    <LoadingWidget color="black" text="Loading store..." />
  )
}

export default AddProductPage
