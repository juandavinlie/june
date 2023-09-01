import {
  Box,
  Button,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"
import Popup from "../../common/Popup"
import { useContext, useEffect, useState } from "react"
import { getCurrencySymbol } from "@/utils"
import { useDimensions } from "@/hooks/common/useDimensions"
import { Variant, VariantsContext } from "@/pages/stores/[storeId]/products/add"

interface EditPricesPopupProps {
  removePopup: () => void
  currency: string
}

const EditPricesPopup = ({ removePopup, currency }: EditPricesPopupProps) => {
  const [variants, setVariants] = useContext(VariantsContext)
  const dimensions = useDimensions()
  const [allPrice, setAllPrice] = useState<number | null>(null)

  const [tempVariants, setTempVariants] = useState<Variant[]>(variants)

  const setTempVariantPrice = (price: number, variantIdx: number) => {
    const copy = structuredClone(tempVariants)
    copy[variantIdx].price = price
    setTempVariants(copy)
  }

  const setAllVariantsPrice = () => {
    const copy = structuredClone(tempVariants)
    for (let i = 0; i < copy.length; i++) {
      copy[i].price = allPrice
    }
    setTempVariants(copy)
  }

  return (
    <Popup removePopup={removePopup}>
      <Box display="flex" flexDirection="column" gap="5px">
        <Typography variant="h5">Apply a price to all variants</Typography>
        <Box display="flex" gap="10px">
          <TextField
            type="number"
            value={allPrice ? allPrice : ""}
            fullWidth
            placeholder="0.00"
            inputProps={{
              style: { fontSize: 14, padding: 10 },
            }}
            InputProps={{
              sx: { borderRadius: 3, marginBottom: 1 },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="h5">
                    {getCurrencySymbol(currency)}
                  </Typography>
                </InputAdornment>
              ),
            }}
            onChange={(e: any) => {
              setAllPrice(e.currentTarget.value)
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              if (allPrice) {
                setAllVariantsPrice()
              }
            }}
            sx={{ textTransform: "none", width: "150px", height: "40px" }}
          >
            <Typography variant="button">Apply to all</Typography>
          </Button>
        </Box>
        <Divider />
        <Box
          height={dimensions.height * 0.4}
          maxHeight={
            dimensions.height < 400
              ? dimensions.height * 0.2
              : dimensions.height * 0.4
          }
          sx={{
            overflowX: "hidden",
          }}
        >
          {tempVariants.map((variant: Variant, idx: number) => {
            return (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p="10px 0"
                borderBottom="0.5px solid #d3d3d3"
                key={idx}
              >
                <Typography variant="title">{variant.title}</Typography>
                <TextField
                  type="number"
                  value={variant.price ? variant.price : ""}
                  placeholder="0.00"
                  inputProps={{
                    style: { fontSize: 14, width: 150, padding: 10 },
                  }}
                  InputProps={{
                    sx: { borderRadius: 3 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="h5">
                          {getCurrencySymbol(currency)}
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  required
                  error={!variant.price}
                  helperText={!variant.price ? "Price can't be blank" : ""}
                  onChange={(e: any) => {
                    setTempVariantPrice(e.currentTarget.value, idx)
                  }}
                />
              </Box>
            )
          })}
        </Box>
        <Box height="50px">
          <Box
            display="flex"
            flexDirection="column"
            gap="10px"
            position="absolute"
            left="20px"
            bottom="10px"
            right="20px"
          >
            <Divider />
            <Box
              display="flex"
              justifyContent="flex-end"
              gap="10px"
              alignItems="center"
            >
              <Button
                variant="outlined"
                onClick={removePopup}
                sx={{ textTransform: "none", width: "50px", height: "40px" }}
              >
                <Typography variant="button">Cancel</Typography>
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setVariants(tempVariants)
                  removePopup()
                }}
                sx={{ textTransform: "none", width: "50px", height: "40px" }}
              >
                <Typography variant="button">Done</Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Popup>
  )
}

export default EditPricesPopup
