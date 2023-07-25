import { styled, Tab } from "@mui/material"

interface StyledTabProps {
  label: string
}

export const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: "none",
  fontFamily: ["Inter", "sans-serif"].join(","),
  fontWeight: 500,
  fontSize: 14,
}))

export const Dummy = () => {
  return <></>
}
