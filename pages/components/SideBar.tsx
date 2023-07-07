import { Box, Divider, Typography } from "@mui/material"
import Link from "next/link"

import LogoutIcon from "@mui/icons-material/Logout"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"

interface MenuButton {
  menuTitle: string
  menuLink: string
}

interface MenuGroupProps {
  title: string
  buttons: MenuButton[]
}

const MenuGroup = ({ title, buttons }: MenuGroupProps) => {
  return (
    <Box display="flex" flexDirection="column" p="20px" gap="15px">
      <Typography variant="h5">{title}</Typography>
      {buttons.map((button: MenuButton) => (
        <Link href={button.menuLink} key={button.menuLink}>
          <Typography
            variant="h6"
            sx={{ "&:hover": { cursor: "pointer", color: "black" } }}
          >
            {button.menuTitle}
          </Typography>
        </Link>
      ))}
    </Box>
  )
}

const GrayDivider = () => {
  return <Divider color="#D3D3D3" />
}

const SideBar = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const stores: MenuButton[] = [
    { menuTitle: "All Stores", menuLink: "/stores" },
  ]
  const accountOptions: MenuButton[] = [
    { menuTitle: "Preferences", menuLink: "/preferences" },
  ]

  return (
    <Box
      width="256px"
      height="100vh"
      borderRight="1px solid #D3D3D3"
      position="fixed"
      top="0"
      bottom="0"
    >
      <Box display="flex" flexDirection="column" p="20px" gap="15px">
        <Link href={"/"} key={"/"}>
          <Typography
            variant="h5"
            sx={{ "&:hover": { cursor: "pointer", color: "black" } }}
          >
            Home
          </Typography>
        </Link>
      </Box>
      <GrayDivider />
      <MenuGroup title="Stores" buttons={stores} />
      <GrayDivider />
      <MenuGroup title="Account" buttons={accountOptions} />
      <GrayDivider />
      <Box display="flex" p="20px" gap="5px">
        <LogoutIcon />
        <Typography
          variant="h6"
          sx={{ "&:hover": { cursor: "pointer", color: "black" } }}
          onClick={async () => {
            const { error } = await supabase.auth.signOut()
            router.push("/")
          }}
        >
          Logout
        </Typography>
      </Box>
    </Box>
  )
}

export default SideBar
