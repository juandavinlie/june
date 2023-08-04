import { Box, Button, Tabs, TextField, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { StyledTab } from "./StyledTab"
import {
  PropertiesContext,
  Property,
  Variant,
  VariantsContext,
} from "./AddProductPopup"

import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"

const PropertiesTab = () => {
  const [properties, setProperties] = useContext(PropertiesContext)

  const updatePropertyFields = (
    name: string | null,
    values: string | null,
    idx: number
  ) => {
    const copy = properties.slice()
    const existingRecord = copy[idx]
    const newRecord: Property = {
      name: name !== null ? name : existingRecord["name"],
      values: values !== null ? values : existingRecord["values"],
    }
    copy[idx] = newRecord
    setProperties(copy)
  }

  return (
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
      {properties.length > 0 ? (
        properties.map((property: Property, idx: number) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            key={idx}
          >
            <TextField
              value={property.name ? property.name : ""}
              placeholder={`e.g. Size`}
              onChange={(e: any) => {
                updatePropertyFields(e.currentTarget.value, null, idx)
              }}
              inputProps={{
                style: { fontSize: 14, padding: 5, width: 100 },
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="5px"
            >
              <Typography variant="h5">Options: </Typography>
              <TextField
                value={property.values ? property.values : ""}
                placeholder="e.g. XXS, XS, S, M, L, XL, XXL"
                onChange={(e: any) => {
                  updatePropertyFields(null, e.currentTarget.value, idx)
                }}
                inputProps={{
                  style: { fontSize: 14, padding: 5, width: 300 },
                }}
              />
            </Box>
            <DeleteIcon
              onClick={() => {
                const newProperties = properties
                  .slice(0, idx)
                  .concat(properties.slice(idx + 1))
                setProperties(newProperties)
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
          <Typography variant="h5">No property added yet</Typography>
        </Box>
      )}
    </Box>
  )
}

const VariantsTab = () => {
  const [variants, setVariants] = useContext(VariantsContext)

  const updateVariantFields = (
    title: string | null,
    inventory_quantity: number | null,
    price: number | null,
    idx: number
  ) => {
    const copy = variants.slice()
    const existingRecord = copy[idx]
    const newRecord: Variant = {
      title: title !== null ? title : existingRecord["title"],
      inventory_quantity:
        inventory_quantity !== null
          ? inventory_quantity
          : existingRecord["inventory_quantity"],
      price: price !== null ? price : existingRecord["price"],
    }
    copy[idx] = newRecord
    setVariants(copy)
  }

  return (
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
        variants.map((variant: Variant, idx: number) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            key={idx}
          >
            <TextField
              value={variant.title ? variant.title : ""}
              placeholder={`e.g. Green Chino Pants Size M`}
              onChange={(e: any) => {
                updateVariantFields(e.currentTarget.value, null, null, idx)
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
              <Typography variant="h5">Quantity: </Typography>
              <TextField
                type="number"
                placeholder="2"
                value={
                  variant.inventory_quantity ? variant.inventory_quantity : ""
                }
                onChange={(e: any) => {
                  updateVariantFields(null, e.currentTarget.value, null, idx)
                }}
                inputProps={{
                  style: { fontSize: 14, padding: 5, width: 75 },
                }}
              />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="5px"
            >
              <Typography variant="h5">Price: </Typography>
              <TextField
                type="number"
                value={variant.price ? variant.price : ""}
                placeholder="59"
                onChange={(e: any) => {
                  updateVariantFields(null, null, e.currentTarget.value, idx)
                }}
                inputProps={{
                  style: { fontSize: 14, padding: 5, width: 100 },
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
  )
}

const AddProductTabs = () => {
  const bodies = [<PropertiesTab key={1} />, <VariantsTab key={2} />]
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const handleChange = (event: React.SyntheticEvent, newIndex: number) => {
    setSelectedIndex(newIndex)
  }

  const [properties, setProperties] = useContext(PropertiesContext)
  const [variants, setVariants] = useContext(VariantsContext)

  const populateVariants = (
    curIdx: number,
    variantTitle: string,
    allVariants: Variant[]
  ) => {
    if (curIdx === properties.length) {
      allVariants.push({
        title: variantTitle,
        inventory_quantity: null,
        price: null,
      })
    } else {
      const curProperty: Property = properties[curIdx]

      if (!curProperty.name || !curProperty.values) {
        return
      }

      const curPropertyName: string = curProperty.name
      const curPropertyValues: string[] = curProperty.values.split(",")

      for (let i = 0; i < curPropertyValues.length; i++) {
        const value = curPropertyValues[i]
        populateVariants(
          curIdx + 1,
          variantTitle +
            `${curIdx !== 0 ? ", " : ""}${curPropertyName}: ${value}`,
          allVariants
        )
      }
    }
  }

  const generateVariants = () => {
    if (properties.length > 0) {
      let allVariants: Variant[] = []
      populateVariants(0, "", allVariants)
      setVariants(allVariants)
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="325px"
      width="auto"
      gap="1rem"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tabs
          value={selectedIndex}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <StyledTab label="Properties" />
          <StyledTab label="Variants" />
        </Tabs>
        <Box display="flex" gap="5px">
          {selectedIndex === 1 && (
            <Button onClick={generateVariants} variant="outlined">
              <Typography>Auto Generate</Typography>
            </Button>
          )}
          <Button
            onClick={() => {
              if (selectedIndex === 0) {
                setProperties(properties.concat({ name: null, values: null }))
              } else if (selectedIndex === 1) {
                setVariants(
                  variants.concat({
                    title: null,
                    inventory_quantity: null,
                    price: null,
                  })
                )
              }
            }}
            variant="outlined"
          >
            <AddIcon />
          </Button>
        </Box>
      </Box>
      <Box height="auto" width="100%">
        {bodies[selectedIndex]}
      </Box>
    </Box>
  )
}

export default AddProductTabs
