import { Box, CircularProgress, Typography } from "@mui/material"

interface LoadingWidgetProps {
  color: string
  text: string
}

const LoadingWidget = ({ color, text }: LoadingWidgetProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="200px"
      width="auto"
      gap="20px"
    >
      <CircularProgress style={{ color: color }} />
      <Typography>{text}</Typography>
    </Box>
  )
}

export default LoadingWidget
