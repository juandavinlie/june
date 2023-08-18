import { Currency, supportedCurrencies } from "@/utils/constants"
import { Autocomplete, TextField } from "@mui/material"

interface CurrencyPickerProps {
    value: Currency | null
    setCurrencyValue: (value: Currency | null) => void
    inputValue: string
    setInputCurrencyValue: (value: string) => void
}

const CurrencyPicker = ({value, setCurrencyValue, inputValue, setInputCurrencyValue}: CurrencyPickerProps) => {
  return <Autocomplete
    value={value}
    onChange={(event: any, newValue: Currency | null) => {
      setCurrencyValue(newValue ? newValue : null)
    }}
    inputValue={inputValue}
    onInputChange={(event: any, newInputValue: string) => {
      setInputCurrencyValue(newInputValue)
    }}
    disablePortal
    id="currency-auto-complete"
    options={supportedCurrencies}
    getOptionLabel={(currency: Currency) =>
      `${currency.currency} (${currency.ticker})`
    }
    sx={{
      width: "50%",
      "& .MuiOutlinedInput-root": {
        padding: "4px!important",
        fontSize: "14px!important",
      },
    }}
    renderInput={(params) => (
      <TextField {...params} placeholder="e.g. Indonesian Rupiah (IDR)" />
    )}
  />
}

export default CurrencyPicker
