import { Box, Typography } from "@mui/material"
import Link from "next/link"
import { Store } from "../models/Store"

interface StoreCardProps {
  store: Store
}

const StoreCard = ({ store }: StoreCardProps) => {
  return (
    <Link href={`/store/${store.storeId}`}>
      <Box
        minHeight="90px"
        width="20%"
        minWidth="200px"
        p="10px"
        borderRadius="5px"
        border="1px solid #D3D3D3"
        boxShadow="1"
        sx={{ "&:hover": { cursor: "pointer", bgcolor: "#D3D3D3" } }}
      >
        <Typography variant="h5">{store.name}</Typography>
        <Typography variant="h6">{store.integration}</Typography>
      </Box>
    </Link>
  )
}

export default StoreCard
