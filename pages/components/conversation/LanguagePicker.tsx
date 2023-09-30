import { supportedConversationLanguages } from "@/utils/constants"
import { Autocomplete, TextField } from "@mui/material"

interface LanguagePickerProps {
  value: string | undefined
  setValue: (value: string | undefined) => void
  inputValue: string
  setInputValue: (value: string) => void
}

const LanguagePicker = ({
  value,
  setValue,
  inputValue,
  setInputValue,
}: LanguagePickerProps) => {
  return (
    <Autocomplete
      value={value}
      onChange={(event: any, newValue: string | null) => {
        setValue(newValue ? newValue : undefined)
      }}
      inputValue={inputValue}
      onInputChange={(event: any, newInputValue: string) => {
        setInputValue(newInputValue)
      }}
      disablePortal
      disableClearable
      id="language-auto-complete"
      options={supportedConversationLanguages}
      getOptionLabel={(language: string) => language}
      sx={{
        width: "50%",
        "& .MuiOutlinedInput-root": {
          padding: "4px!important",
          fontSize: "14px!important",
        },
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder="e.g. English" />
      )}
    />
  )
}

export default LanguagePicker
