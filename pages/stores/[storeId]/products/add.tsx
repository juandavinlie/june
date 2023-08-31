import AddProductSectionBox from "@/pages/components/stores/manual/AddProductSectionBox"
import {
  Box,
  Button,
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
import { currencyLocale, getCurrencySymbol } from "@/utils"
import LoadingWidget from "@/pages/components/common/LoadingWidget"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import PropertyBox from "@/pages/components/stores/manual/PropertyBox"
import EditPricesPopup from "@/pages/components/stores/manual/EditPricesPopup"
import { HeaderContext } from "@/pages/components/common/HeaderLayout"

export interface Property {
  name: string | null
  values: [string]
  isEditing: boolean
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
  const [universalPrice, setUniversalPrice] = useState<number | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [variants, setVariants] = useState<Variant[]>([])

  const [deletedVariants, setDeletedVariants] = useState<Set<string>>(new Set())

  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false)

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

  // SIDE EFFECTS
  useEffect(() => {
    if (!router.isReady) return

    if (!store) {
      getStore()
    }

    setHeaderTitle([
      { text: "Stores", link: "/stores" },
      { text: store.name, link: `/stores/${storeId as string}` },
      { text: "Add product", link: `/stores/${storeId as string}/products/add` },
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
        <Typography variant="h5">Title</Typography>
        <TextField
          value={title}
          placeholder="Slim Fit Chino Pants"
          inputProps={{
            style: { fontSize: 14, padding: 10 },
          }}
          InputProps={{ sx: { borderRadius: 3, marginBottom: 1 } }}
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
      {/* <AddProductSectionBox>
        <Typography variant="title">Pricing</Typography>
        <Box height="10px" />
        <Typography variant="h5">Price</Typography>
        <TextField
          type="number"
          value={universalPrice ? universalPrice : ""}
          placeholder="0.00"
          inputProps={{
            style: { fontSize: 14, padding: 10 },
          }}
          InputProps={{
            sx: { borderRadius: 3, marginBottom: 1 },
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="h5">
                  {getCurrencySymbol(store.currency)}
                </Typography>
              </InputAdornment>
            ),
          }}
          onChange={(e: any) => {
            setUniversalPrice(e.currentTarget.value)
          }}
        />
      </AddProductSectionBox> */}
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
              onClick={() => {
                addNewOption()
              }}
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
            <Typography variant="h5">{`Total: ${variants.length} variants`}</Typography>
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
                      sx={{ fontSize: 14 }}
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
        justifyContent="flex-end"
        gap="10px"
        alignItems="center"
        maxWidth="620px"
      >
        <Button
          variant="outlined"
          onClick={() => {}}
          sx={{ textTransform: "none", width: "50px", height: "40px" }}
        >
          <Typography variant="button">Cancel</Typography>
        </Button>
        <Button
          variant="outlined"
          onClick={() => {}}
          sx={{ textTransform: "none", width: "50px", height: "40px" }}
        >
          <Typography variant="button">Save</Typography>
        </Button>
      </Box>
    </Box>
  ) : (
    <LoadingWidget color="black" text="Loading store..." />
  )
}

export default AddProductPage
