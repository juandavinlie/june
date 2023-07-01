import { ReactNode } from "react"
import { Box, Divider, Typography } from "@mui/material"
import { useRouter } from "next/router"

import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import slashLogo from "../../public/slash.png"
import Link from "next/link"

interface HeaderLayoutProps {
  children: ReactNode
}

const HeaderLayout = ({ children }: HeaderLayoutProps) => {
  const router = useRouter()
  const paths = router.asPath.split("/").slice(1)
  return (
    <Box width="auto">
      <Box height="62px" display="flex" p="20px">
        {paths.length === 1 && paths[0] === "" ? (
          <Typography>Home</Typography>
        ) : (
          paths.map((path: string, idx: number) => {
            const constructedPath = paths.slice(0, idx + 1).join("/")
            return (
              <Box display="flex">
                <Link href={`/${constructedPath}`}>
                  <Box sx={{ "&:hover": { cursor: "pointer" } }}>
                    <Typography>
                      {path.charAt(0).toUpperCase() + path.slice(1)}
                    </Typography>
                  </Box>
                </Link>
                {idx < paths.length - 1 && <img src={slashLogo.src} />}
              </Box>
            )
          })
        )}
      </Box>
      <Divider color="#D3D3D3" />
      {children}
    </Box>
  )
}

export default HeaderLayout
