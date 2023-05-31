import { Box, Typography } from "@mui/material"
import SmartToyIcon from "@mui/icons-material/SmartToy"

const LoadingChatStripe = ({ isError }: { isError: boolean }) => {
  return (
    <Box
      borderBottom="0.1px solid #D3D3D3"
      width="auto"
      bgcolor="#f7f7f8"
      p="36px 70px"
      display="flex"
      flexDirection="row"
      gap="15px"
    >
      <SmartToyIcon />
      <Typography color={!isError ? "black" : "red"}>
        {!isError ? "..." : "Something went wrong, please try again."}
      </Typography>
    </Box>
  )
}

export default LoadingChatStripe
