import { createTheme } from "@mui/material"
export const themeSettings = createTheme({
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
    fontSize: 14,
    h1: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 40,
    },
    h2: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "bold",
      fontSize: 28,
    },
    h3: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 24,
    },
    h4: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 20,
    },
    h5: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "300",
      fontSize: 16,
    },
    h6: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "300",
      color: "gray",
      fontSize: 14,
    },
  },
  palette: {
    primary: {
      dark: "#0E062D",
      main: "#f8f9fa",
    },
    secondary: {
      main: "#000000",
    },
    background: {
      default: "#f6f7f9",
    },
  },
})
