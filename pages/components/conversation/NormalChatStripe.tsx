import { Box, Typography } from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"

interface NormalChatStripeProps {
  content: string
}

const NormalChatStripe = ({ content }: NormalChatStripeProps) => {
  return (
    <Box
      borderBottom="0.1px solid #D3D3D3"
      width="auto"
      bgcolor="#ffffff"
      p="36px 70px"
      display="flex"
      flexDirection="row"
      gap="15px"
    >
      {<PersonIcon />}
      <Typography>{content}</Typography>
    </Box>
  )
}

export default NormalChatStripe
